// 🚨 EMERGENCY RESCUE ENDPOINT — Saves in-memory invoices to DB before server restart
// Call this immediately if you see bills in memory that are not in DB
// GET /api/rescue-invoices  → preview what will be saved
// POST /api/rescue-invoices → actually save them to DB

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getLiveInvoices, getLiveOrders } from "@/lib/events";

export async function GET() {
  try {
    const liveInvoices = getLiveInvoices() || [];
    const liveOrders = getLiveOrders() || [];

    // Find which ones are NOT in DB
    const rescued: any[] = [];
    const alreadyInDb: any[] = [];

    for (const inv of liveInvoices) {
      // Only real invoices (not fake in-memory fallbacks with inv_ prefix)
      if (!inv.humanInvoiceNumber) continue;

      const existing = await prisma.invoice.findFirst({
        where: {
          OR: [
            { humanInvoiceNumber: inv.humanInvoiceNumber },
            ...(inv.id && !inv.id.startsWith("inv_") ? [{ id: inv.id }] : []),
          ],
        },
        select: { id: true, humanInvoiceNumber: true },
      });

      if (existing) {
        alreadyInDb.push({ humanInvoiceNumber: inv.humanInvoiceNumber, grandTotal: inv.grandTotal });
      } else {
        rescued.push({
          humanInvoiceNumber: inv.humanInvoiceNumber,
          grandTotal: inv.grandTotal,
          paymentMethod: inv.paymentMethod,
          customerName: inv.customerName,
          carNumber: inv.carNumber,
          createdAt: inv.createdAt,
        });
      }
    }

    return NextResponse.json({
      message: "PREVIEW — Call POST to actually save",
      totalInMemory: liveInvoices.length,
      totalOrders: liveOrders.length,
      alreadyInDb: alreadyInDb.length,
      needsRescue: rescued.length,
      billsToRescue: rescued,
      billsAlreadySafe: alreadyInDb,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const liveInvoices = getLiveInvoices() || [];
    const liveOrders = getLiveOrders() || [];

    const savedToDb: any[] = [];
    const skipped: any[] = [];
    const errors: any[] = [];

    // Build order map for lookup
    const ordersMap = new Map();
    liveOrders.forEach((o: any) => {
      if (o.id) ordersMap.set(o.id, o);
      if (o.humanOrderId) ordersMap.set(o.humanOrderId, o);
    });

    for (const inv of liveInvoices) {
      if (!inv.humanInvoiceNumber) continue;

      try {
        // Check if already in DB
        const existing = await prisma.invoice.findFirst({
          where: {
            OR: [
              { humanInvoiceNumber: inv.humanInvoiceNumber },
              ...(inv.id && !inv.id.startsWith("inv_") ? [{ id: inv.id }] : []),
            ],
          },
          select: { id: true },
        });

        if (existing) {
          skipped.push(inv.humanInvoiceNumber);
          continue;
        }

        // Find or create the order in DB
        let dbOrderId: string | null = null;

        if (inv.orderId && !inv.orderId.startsWith("ord_")) {
          // Real DB order — verify it exists
          const dbOrder = await prisma.order.findUnique({ where: { id: inv.orderId }, select: { id: true } });
          if (dbOrder) dbOrderId = dbOrder.id;
        }

        if (!dbOrderId) {
          // Try to find by humanOrderId from live orders
          const liveOrder = ordersMap.get(inv.orderId);
          if (liveOrder && liveOrder.humanOrderId) {
            const dbOrder = await prisma.order.findFirst({
              where: { humanOrderId: liveOrder.humanOrderId },
              select: { id: true },
            });
            if (dbOrder) dbOrderId = dbOrder.id;
          }
        }

        if (!dbOrderId) {
          // Create order in DB from live order data
          const liveOrder = ordersMap.get(inv.orderId) || inv.order;
          if (liveOrder) {
            try {
              const newOrder = await prisma.order.create({
                data: {
                  humanOrderId: liveOrder.humanOrderId || `RESCUED-${Date.now()}`,
                  restaurantId: liveOrder.restaurantId || "rest_aapno_khano",
                  customerName: liveOrder.customerName || inv.customerName || "Direct Guest",
                  customerPhone: liveOrder.customerPhone || inv.customerPhone || null,
                  carNumber: liveOrder.carNumber || inv.carNumber || null,
                  orderType: liveOrder.orderType || inv.orderType || "CAR_SERVICE",
                  status: "CONFIRMED",
                  subtotal: liveOrder.subtotal || inv.subtotal || 0,
                  discountAmount: liveOrder.discountAmount || inv.discountAmount || 0,
                  taxAmount: liveOrder.taxAmount || (inv.cgstAmount + inv.sgstAmount) || 0,
                  grandTotal: liveOrder.grandTotal || inv.grandTotal || 0,
                  paymentStatus: "PAID",
                  paymentMethod: liveOrder.paymentMethod || inv.paymentMethod || "CASH",
                  transactionId: liveOrder.transactionId || inv.transactionId || `RESCUED_${Date.now()}`,
                  cookingInstructions: liveOrder.cookingInstructions || null,
                  createdAt: liveOrder.createdAt ? new Date(liveOrder.createdAt) : new Date(),
                  items: {
                    create: (liveOrder.items || inv.items || []).map((it: any) => ({
                      productName: it.productName || it.name || "Rescued Item",
                      selectedVariation: it.selectedVariation || null,
                      isVeg: it.isVeg ?? true,
                      quantity: it.quantity || 1,
                      unitPrice: it.unitPrice || 0,
                      totalPrice: it.totalPrice || (it.unitPrice * it.quantity) || 0,
                      itemNotes: it.itemNotes || null,
                      status: "SERVED",
                      // Try to connect product if productId is a real DB id
                      ...(it.productId && !it.productId.startsWith("p_") && !it.productId.startsWith("item_")
                        ? { product: { connect: { id: it.productId } } }
                        : {}),
                    })),
                  },
                },
                select: { id: true },
              });
              dbOrderId = newOrder.id;
            } catch (orderErr: any) {
              // Create order without items as fallback
              try {
                const newOrder = await prisma.order.create({
                  data: {
                    humanOrderId: liveOrder.humanOrderId || `RESCUED-${Date.now()}`,
                    restaurantId: liveOrder.restaurantId || "rest_aapno_khano",
                    customerName: liveOrder.customerName || inv.customerName || "Direct Guest",
                    customerPhone: null,
                    carNumber: liveOrder.carNumber || inv.carNumber || null,
                    orderType: liveOrder.orderType || "CAR_SERVICE",
                    status: "CONFIRMED",
                    subtotal: liveOrder.subtotal || inv.subtotal || 0,
                    discountAmount: liveOrder.discountAmount || 0,
                    taxAmount: (inv.cgstAmount || 0) + (inv.sgstAmount || 0),
                    grandTotal: liveOrder.grandTotal || inv.grandTotal || 0,
                    paymentStatus: "PAID",
                    paymentMethod: liveOrder.paymentMethod || inv.paymentMethod || "CASH",
                    transactionId: `RESCUED_${Date.now()}`,
                    createdAt: liveOrder.createdAt ? new Date(liveOrder.createdAt) : new Date(),
                  },
                  select: { id: true },
                });
                dbOrderId = newOrder.id;
              } catch (e2) {
                // skip
              }
            }
          }
        }

        // Now save the invoice
        const savedInv = await prisma.invoice.create({
          data: {
            humanInvoiceNumber: inv.humanInvoiceNumber,
            restaurantId: inv.restaurantId || "rest_aapno_khano",
            orderId: dbOrderId || undefined,
            carNumber: inv.carNumber || null,
            customerName: inv.customerName || "Direct Guest",
            customerPhone: inv.customerPhone || undefined,
            orderType: inv.orderType || "CAR_SERVICE",
            subtotal: inv.subtotal || 0,
            discountAmount: inv.discountAmount || 0,
            cgstRate: inv.cgstRate || 2.5,
            cgstAmount: inv.cgstAmount || 0,
            sgstRate: inv.sgstRate || 2.5,
            sgstAmount: inv.sgstAmount || 0,
            grandTotal: inv.grandTotal || 0,
            roundedTotal: inv.roundedTotal || Math.round(inv.grandTotal || 0),
            paymentMethod: inv.paymentMethod || "CASH",
            paymentStatus: "PAID",
            transactionId: inv.transactionId || `RESCUED_${Date.now()}`,
            createdAt: inv.createdAt ? new Date(inv.createdAt) : new Date(),
          },
        });

        savedToDb.push({
          humanInvoiceNumber: savedInv.humanInvoiceNumber,
          grandTotal: inv.grandTotal,
          paymentMethod: inv.paymentMethod,
          customerName: inv.customerName,
          carNumber: inv.carNumber,
        });
      } catch (err: any) {
        errors.push({ invoice: inv.humanInvoiceNumber, error: err.message });
      }
    }

    const totalRevenue = savedToDb.reduce((sum, i) => sum + (i.grandTotal || 0), 0);

    return NextResponse.json({
      success: true,
      message: `✅ Rescue complete! ${savedToDb.length} bills saved to DB.`,
      savedToDb: savedToDb.length,
      skippedAlreadyInDb: skipped.length,
      errors: errors.length,
      totalRescuedRevenue: `₹${totalRevenue.toFixed(2)}`,
      details: { savedToDb, skipped, errors },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
