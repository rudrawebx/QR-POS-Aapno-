import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { recordLiveOrder, getLiveOrders, recordLiveInvoice, broadcastLiveEvent } from "@/lib/events";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getCurrentSession();
    const restaurantId = searchParams.get("restaurantId") || session?.restaurantId || "rest_aapno_khano";
    const range = searchParams.get("range") || "TODAY";
    const status = searchParams.get("status");

    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (range === "YESTERDAY") {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "7DAYS") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "30DAYS") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "ALL") {
      startDate = new Date(2020, 0, 1);
    }

    let dbOrders: any[] = [];
    try {
      if (prisma) {
        const whereClause: any = {
          restaurantId,
          createdAt: { gte: startDate },
        };
        if (status && status !== "ALL") {
          whereClause.status = status;
        }

        dbOrders = await prisma.order.findMany({
          where: whereClause,
          include: {
            items: true,
            table: true,
            kots: { include: { items: true } },
            invoices: true,
            payments: true,
          },
          orderBy: { createdAt: "desc" },
          take: 100,
        });
      }
    } catch (dbErr) {
      console.warn("Orders DB query failed, falling back to memory:", dbErr);
    }

    const liveMemOrders = getLiveOrders();
    const combinedOrdersMap = new Map();

    (liveMemOrders || []).forEach((o) => {
      const oDate = new Date(o.createdAt);
      if (oDate >= startDate) {
        combinedOrdersMap.set(o.id || o.humanOrderId, o);
      }
    });

    (dbOrders || []).forEach((o) => {
      combinedOrdersMap.set(o.id || o.humanOrderId, o);
    });

    const orders = Array.from(combinedOrdersMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json({ orders: [] });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      restaurantId = "rest_aapno_khano",
      customerName = "Direct Guest",
      customerPhone = "9996213962",
      carNumber,
      orderType = "CAR_SERVICE",
      cookingInstructions,
      items = [],
      paymentMethod = "UPI",
    } = data;

    const subtotal = items.reduce((acc: number, it: any) => acc + (it.unitPrice || 0) * (it.quantity || 1), 0);
    const cgstAmount = +(subtotal * 0.025).toFixed(2);
    const sgstAmount = +(subtotal * 0.025).toFixed(2);
    const grandTotal = +(subtotal + cgstAmount + sgstAmount).toFixed(2);
    const orderNum = Math.floor(1000 + (Date.now() % 9000));
    const humanOrderId = "AK-2026-" + orderNum;
    const humanInvoiceNumber = "AK-INV-2026-" + String(orderNum).padStart(6, "0");
    const kotNumber = "KOT-" + Math.floor(100 + Math.random() * 900);

    let order: any = {
      id: "ord_" + Date.now(),
      humanOrderId,
      restaurantId,
      customerName,
      customerPhone,
      carNumber: carNumber ? String(carNumber).toUpperCase().trim() : null,
      orderType,
      status: "CONFIRMED",
      subtotal,
      taxAmount: cgstAmount + sgstAmount,
      grandTotal,
      cookingInstructions,
      paymentStatus: "PAID",
      paymentMethod,
      createdAt: new Date(),
      items: items.map((it: any) => ({
        id: "oi_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
        productName: it.productName || it.name,
        selectedVariation: it.selectedVariation,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: (it.unitPrice || 0) * (it.quantity || 1),
        isVeg: it.isVeg ?? true,
      })),
    };

    try {
      if (prisma) {
        // 1. Create Order & Items in DB
        order = await prisma.order.create({
          data: {
            humanOrderId,
            restaurantId,
            customerName,
            customerPhone,
            carNumber: carNumber ? String(carNumber).toUpperCase().trim() : null,
            orderType,
            status: "CONFIRMED",
            subtotal,
            taxAmount: cgstAmount + sgstAmount,
            grandTotal,
            cookingInstructions,
            paymentStatus: "PAID",
            paymentMethod,
            items: {
              create: items.map((it: any) => ({
                productName: it.productName || it.name,
                selectedVariation: it.selectedVariation,
                quantity: it.quantity,
                unitPrice: it.unitPrice,
                totalPrice: (it.unitPrice || 0) * (it.quantity || 1),
                isVeg: it.isVeg ?? true,
              })),
            },
          },
          include: { items: true },
        });

        // 2. Create KOT in DB
        try {
          await prisma.kot.create({
            data: {
              kotNumber,
              restaurantId,
              orderId: order.id,
              status: "PREPARING",
              notes: cookingInstructions || null,
              items: {
                create: items.map((it: any) => ({
                  productName: it.productName || it.name,
                  selectedVariation: it.selectedVariation,
                  quantity: it.quantity,
                  notes: it.notes || null,
                })),
              },
            },
          });
        } catch (kotErr) {
          console.warn("Kot DB insert fallback:", kotErr);
        }

        // 3. Create Invoice & Payment in DB
        try {
          const inv = await prisma.invoice.create({
            data: {
              humanInvoiceNumber,
              restaurantId,
              orderId: order.id,
              customerName: customerName || "Direct Guest",
              customerPhone: customerPhone || "9996213962",
              carNumber: carNumber ? String(carNumber).toUpperCase().trim() : null,
              orderType,
              subtotal,
              cgstRate: 2.5,
              cgstAmount,
              sgstRate: 2.5,
              sgstAmount,
              grandTotal,
              roundedTotal: Math.round(grandTotal),
              paymentMethod,
              paymentStatus: "PAID",
              transactionId: "UPI_" + (customerPhone ? customerPhone.slice(-6) : "13962") + "_" + orderNum,
            },
          });
          recordLiveInvoice(inv);
        } catch (invErr) {
          console.warn("Invoice DB insert fallback:", invErr);
        }
      }
    } catch (e) {
      console.warn("Database error during order creation, serving in-memory order:", e);
    }

    recordLiveOrder(order);

    return NextResponse.json({
      success: true,
      order,
      invoiceNumber: humanInvoiceNumber,
      kotNumber,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json({ success: true, order: { id: "ord_" + Date.now(), humanOrderId: "AK-2026-1001" } });
  }
}
