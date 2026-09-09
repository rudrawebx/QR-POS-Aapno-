import prisma from "@/lib/prisma";

/**
 * Deducts raw ingredients based on Recipe BOM strictly upon confirmed paid order.
 * Idempotent: Checks if inventory was already deducted for this orderId.
 */
export async function deductInventoryForOrder(orderId: string, restaurantId = "rest_aapno_khano"): Promise<boolean> {
  try {
    if (!prisma) return false;

    // 1. Check idempotency: Have we already deducted for this order?
    const existingTxns = await prisma.stockTransaction.findFirst({
      where: { orderId, type: "USAGE_RECIPE_BOM" },
    });
    if (existingTxns) {
      console.log(`[Inventory] Order ${orderId} inventory already deducted. Skipping.`);
      return true;
    }

    // 2. Fetch order items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order || !order.items || order.items.length === 0) {
      return false;
    }

    // 3. For each order item, find matching recipe
    for (const item of order.items) {
      const qty = item.quantity || 1;
      const recipe = await prisma.recipe.findFirst({
        where: { productId: item.productId, restaurantId },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });

      if (recipe && recipe.ingredients.length > 0) {
        for (const rItem of recipe.ingredients) {
          const totalQtyUsed = (rItem.quantityUsed || 0.1) * qty;

          // Update current stock
          await prisma.ingredient.update({
            where: { id: rItem.ingredientId },
            data: {
              currentStock: {
                decrement: totalQtyUsed,
              },
            },
          });

          // Record stock transaction
          await prisma.stockTransaction.create({
            data: {
              restaurantId,
              ingredientId: rItem.ingredientId,
              orderId,
              type: "USAGE_RECIPE_BOM",
              quantity: totalQtyUsed,
              unit: rItem.unit || rItem.ingredient?.unit || "KG",
              costPerUnit: rItem.ingredient?.unitCost || 0.0,
              notes: `Order ${order.humanOrderId} - ${item.quantity}x ${item.productName}`,
            },
          });
        }
      }
    }

    console.log(`[Inventory] Successfully deducted recipe BOM for order ${order.humanOrderId}`);
    return true;
  } catch (error) {
    console.warn("[Inventory] Recipe BOM deduction warning:", error);
    return false;
  }
}

/**
 * Restores raw ingredients when an order is refunded or cancelled.
 */
export async function restoreInventoryForOrder(orderId: string, restaurantId = "rest_aapno_khano"): Promise<boolean> {
  try {
    if (!prisma) return false;

    const usages = await prisma.stockTransaction.findMany({
      where: { orderId, type: "USAGE_RECIPE_BOM" },
    });

    if (!usages || usages.length === 0) {
      return false;
    }

    for (const txn of usages) {
      await prisma.ingredient.update({
        where: { id: txn.ingredientId },
        data: {
          currentStock: {
            increment: txn.quantity,
          },
        },
      });

      await prisma.stockTransaction.create({
        data: {
          restaurantId,
          ingredientId: txn.ingredientId,
          orderId,
          type: "RESTORE_REFUND",
          quantity: txn.quantity,
          unit: txn.unit,
          costPerUnit: txn.costPerUnit,
          notes: `Reversal / Refund for Order ${orderId}`,
        },
      });
    }

    console.log(`[Inventory] Successfully restored inventory for refunded order ${orderId}`);
    return true;
  } catch (error) {
    console.warn("[Inventory] Restore inventory warning:", error);
    return false;
  }
}
