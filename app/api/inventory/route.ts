import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

const DEFAULT_RAW_MATERIALS = [
  { id: "ing-paneer", name: "Fresh Malai Paneer", unit: "KG", currentStock: 45.0, minStockAlert: 10.0, unitCost: 320.0 },
  { id: "ing-ghee", name: "Vedic Desi Bilona Ghee", unit: "LITER", currentStock: 30.0, minStockAlert: 8.0, unitCost: 850.0 },
  { id: "ing-butter", name: "Amul Table Butter", unit: "KG", currentStock: 25.0, minStockAlert: 5.0, unitCost: 480.0 },
  { id: "ing-rice", name: "Royal Aged Basmati Rice", unit: "KG", currentStock: 100.0, minStockAlert: 20.0, unitCost: 110.0 },
  { id: "ing-cream", name: "Amul Fresh Dairy Cream", unit: "LITER", currentStock: 20.0, minStockAlert: 6.0, unitCost: 220.0 },
  { id: "ing-spices", name: "Shahi Garam Masala Blend", unit: "KG", currentStock: 12.0, minStockAlert: 3.0, unitCost: 650.0 },
  { id: "ing-chicken", name: "Fresh Farm Chicken", unit: "KG", currentStock: 35.0, minStockAlert: 10.0, unitCost: 220.0 },
  { id: "ing-eggs", name: "Farm Fresh Eggs", unit: "PIECE", currentStock: 180.0, minStockAlert: 30.0, unitCost: 7.0 },
  { id: "ing-oil", name: "Pure Mustard / Refined Oil", unit: "LITER", currentStock: 40.0, minStockAlert: 10.0, unitCost: 145.0 },
  { id: "ing-flour", name: "Chakki Fresh Atta & Maida", unit: "KG", currentStock: 80.0, minStockAlert: 15.0, unitCost: 42.0 },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getCurrentSession();
    const restaurantId = searchParams.get("restaurantId") || session?.restaurantId || "rest_aapno_khano";
    const range = searchParams.get("range") || "TODAY";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (range === "YESTERDAY") {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      endDate.setHours(23, 59, 59, 999);
    } else if (range === "7DAYS") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "30DAYS") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "3MONTHS") {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "6MONTHS") {
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "ALL") {
      startDate = new Date(2020, 0, 1);
    } else if (range === "CUSTOM" && customStart) {
      startDate = new Date(customStart);
      startDate.setHours(0, 0, 0, 0);
      if (customEnd) {
        endDate = new Date(customEnd);
        endDate.setHours(23, 59, 59, 999);
      }
    }

    let ingredients: any[] = [];
    let suppliers: any[] = [];
    let purchaseOrders: any[] = [];
    let stockTransactions: any[] = [];
    let recipes: any[] = [];

    try {
      if (prisma) {
        ingredients = await prisma.ingredient.findMany({
          where: { restaurantId },
          include: { supplier: true },
          orderBy: { name: "asc" },
        });

        suppliers = await prisma.supplier.findMany({
          where: { restaurantId },
          orderBy: { name: "asc" },
        });

        purchaseOrders = await prisma.purchaseOrder.findMany({
          where: {
            restaurantId,
            createdAt: { gte: startDate, lte: endDate },
          },
          include: { supplier: true },
          orderBy: { createdAt: "desc" },
        });

        stockTransactions = await prisma.stockTransaction.findMany({
          where: {
            restaurantId,
            createdAt: { gte: startDate, lte: endDate },
          },
          include: { ingredient: true, order: true },
          orderBy: { createdAt: "desc" },
          take: 100,
        });

        recipes = await prisma.recipe.findMany({
          where: { restaurantId },
          include: {
            product: true,
            ingredients: {
              include: { ingredient: true },
            },
          },
        });
      }
    } catch (dbErr) {
      console.warn("Inventory DB query error, using fallback state:", dbErr);
    }

    if (!ingredients || ingredients.length === 0) {
      ingredients = DEFAULT_RAW_MATERIALS;
    }

    const totalStockValue = ingredients.reduce(
      (sum, i) => sum + (i.currentStock || 0) * (i.unitCost || 0),
      0
    );
    const lowStockCount = ingredients.filter(
      (i) => (i.currentStock || 0) <= (i.minStockAlert || 5)
    ).length;

    return NextResponse.json({
      range,
      totalStockValue: Math.round(totalStockValue),
      lowStockCount,
      ingredients,
      suppliers,
      purchaseOrders,
      stockTransactions,
      recipes,
    });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json({
      ingredients: DEFAULT_RAW_MATERIALS,
      suppliers: [],
      purchaseOrders: [],
      stockTransactions: [],
      recipes: [],
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    const restaurantId = session?.restaurantId || "rest_aapno_khano";
    const userName = session?.name || "Inventory Manager";
    const data = await request.json();
    const { type } = data;

    // 1. ADD / CREATE INGREDIENT
    if (type === "INGREDIENT") {
      const { name, unit, currentStock, minStockAlert, unitCost, supplierId } = data;
      let ingredient: any = {
        id: "ing_" + Date.now(),
        restaurantId,
        name,
        unit: unit || "KG",
        currentStock: parseFloat(currentStock || "0"),
        minStockAlert: parseFloat(minStockAlert || "5"),
        unitCost: parseFloat(unitCost || "0"),
        supplierId: supplierId || null,
        createdAt: new Date(),
      };

      try {
        if (prisma) {
          ingredient = await prisma.ingredient.create({
            data: {
              restaurantId,
              name,
              unit: unit || "KG",
              currentStock: parseFloat(currentStock || "0"),
              minStockAlert: parseFloat(minStockAlert || "5"),
              unitCost: parseFloat(unitCost || "0"),
              supplierId: supplierId || null,
            },
          });

          // Record Opening Stock Transaction
          await prisma.stockTransaction.create({
            data: {
              restaurantId,
              ingredientId: ingredient.id,
              type: "OPENING_STOCK",
              quantity: parseFloat(currentStock || "0"),
              unit: unit || "KG",
              notes: `Opening stock initialized by ${userName}`,
            },
          });
        }
      } catch (dbErr) {
        console.warn("DB create ingredient fallback:", dbErr);
      }

      return NextResponse.json({ success: true, ingredient });
    }

    // 2. STOCK IN / PURCHASE / USAGE / WASTAGE ADJUSTMENT
    if (type === "STOCK_ADJUSTMENT") {
      const { ingredientId, quantity, actionType = "PURCHASE", reason, unitCost, supplierId } = data;
      const parsedQty = parseFloat(quantity || "0");

      let ingredient: any = { id: ingredientId, currentStock: parsedQty, unit: "KG" };
      let deltaQty = parsedQty;
      if (actionType === "WASTAGE" || actionType === "USAGE" || actionType === "DAMAGE" || actionType === "RETURN") {
        deltaQty = -Math.abs(parsedQty);
      } else {
        deltaQty = Math.abs(parsedQty);
      }

      let txn: any = {
        id: "txn_" + Date.now(),
        restaurantId,
        ingredientId,
        type: actionType,
        quantity: deltaQty,
        unit: "KG",
        notes: reason || `Stock ${actionType} entered by ${userName}`,
        createdAt: new Date(),
      };

      try {
        if (prisma) {
          const prev = await prisma.ingredient.findUnique({ where: { id: ingredientId } });
          const newStock = Math.max(0, (prev?.currentStock || 0) + deltaQty);

          const updateData: any = { currentStock: newStock };
          if (unitCost && parseFloat(unitCost) > 0) {
            updateData.unitCost = parseFloat(unitCost);
          }
          if (supplierId) {
            updateData.supplierId = supplierId;
          }

          ingredient = await prisma.ingredient.update({
            where: { id: ingredientId },
            data: updateData,
          });

          txn = await prisma.stockTransaction.create({
            data: {
              restaurantId,
              ingredientId,
              type: actionType === "PURCHASE" ? "STOCK_IN" : actionType,
              quantity: deltaQty,
              unit: ingredient.unit,
              notes: `${reason || actionType} (Prev: ${prev?.currentStock || 0} -> New: ${newStock}) by ${userName}`,
            },
          });
        }
      } catch (dbErr) {
        console.warn("DB stock adjust fallback:", dbErr);
      }

      return NextResponse.json({ success: true, ingredient, transaction: txn });
    }

    // 3. RECIPE BOM MAPPING (Link Product to Ingredients)
    if (type === "RECIPE_MAPPING") {
      const { productId, ingredients: recipeIngredients = [], yieldQuantity = 1 } = data;
      let recipe: any = { id: "rec_" + Date.now(), productId, restaurantId };

      try {
        if (prisma) {
          // Delete existing recipe for this product if any
          await prisma.recipe.deleteMany({
            where: { productId, restaurantId },
          });

          recipe = await prisma.recipe.create({
            data: {
              restaurantId,
              productId,
              name: "Standard Recipe BOM",
              yieldQuantity: parseFloat(yieldQuantity || "1"),
              ingredients: {
                create: recipeIngredients.map((ri: any) => ({
                  ingredientId: ri.ingredientId,
                  quantityUsed: parseFloat(ri.quantity || ri.quantityUsed || "0.1"),
                  unit: ri.unit || "KG",
                })),
              },
            },
            include: {
              ingredients: { include: { ingredient: true } },
            },
          });
        }
      } catch (dbErr) {
        console.warn("DB recipe mapping error:", dbErr);
      }

      return NextResponse.json({ success: true, recipe });
    }

    // 4. SUPPLIER CREATE
    if (type === "SUPPLIER") {
      const { name, contactPerson, phone, email, gstin, address } = data;
      let supplier: any = {
        id: "sup_" + Date.now(),
        restaurantId,
        name,
        contactPerson: contactPerson || null,
        phone,
        email: email || null,
        gstin: gstin || null,
        address: address || null,
        createdAt: new Date(),
      };

      try {
        if (prisma) {
          supplier = await prisma.supplier.create({
            data: {
              restaurantId,
              name,
              contactPerson: contactPerson || null,
              phone,
              email: email || null,
              gstin: gstin || null,
              address: address || null,
            },
          });
        }
      } catch (dbErr) {
        console.warn("DB create supplier fallback:", dbErr);
      }

      return NextResponse.json({ success: true, supplier });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Create inventory error:", error);
    return NextResponse.json({ success: true });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentSession();
    const restaurantId = session?.restaurantId || "rest_aapno_khano";
    const { id, name, unit, currentStock, minStockAlert, unitCost, supplierId } = await request.json();

    if (!id) return NextResponse.json({ error: "Missing ingredient ID" }, { status: 400 });

    const numStock = currentStock !== undefined ? parseFloat(String(currentStock)) : 0;
    const numMinAlert = minStockAlert !== undefined ? parseFloat(String(minStockAlert)) : 5;
    const numCost = unitCost !== undefined ? parseFloat(String(unitCost)) : 0;
    const cleanUnit = unit || "KG";
    const cleanName = name || "Raw Material";

    let ingredient: any = null;
    try {
      if (prisma) {
        ingredient = await prisma.ingredient.upsert({
          where: { id },
          update: {
            name: cleanName,
            unit: cleanUnit,
            currentStock: numStock,
            minStockAlert: numMinAlert,
            unitCost: numCost,
            supplierId: supplierId || null,
          },
          create: {
            id,
            restaurantId,
            name: cleanName,
            unit: cleanUnit,
            currentStock: numStock,
            minStockAlert: numMinAlert,
            unitCost: numCost,
            supplierId: supplierId || null,
          },
        });
      }
    } catch (dbErr) {
      console.warn("DB upsert ingredient error:", dbErr);
      ingredient = {
        id,
        restaurantId,
        name: cleanName,
        unit: cleanUnit,
        currentStock: numStock,
        minStockAlert: numMinAlert,
        unitCost: numCost,
        supplierId: supplierId || null,
      };
    }

    return NextResponse.json({ success: true, ingredient });
  } catch (error) {
    console.error("Update ingredient error:", error);
    return NextResponse.json({ error: "Failed to update ingredient" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return PATCH(request);
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const entity = searchParams.get("entity") || "INGREDIENT";

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    try {
      if (prisma) {
        if (entity === "INGREDIENT") {
          await prisma.stockTransaction.deleteMany({ where: { ingredientId: id } });
          await prisma.recipeIngredient.deleteMany({ where: { ingredientId: id } });
          await prisma.ingredient.delete({ where: { id } });
        } else if (entity === "SUPPLIER") {
          await prisma.supplier.delete({ where: { id } });
        }
      }
    } catch (dbErr) {
      console.warn("DB delete inventory fallback:", dbErr);
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete inventory error:", error);
    return NextResponse.json({ success: true });
  }
}
