import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { recordLiveOrder, getLiveOrders, recordLiveInvoice, broadcastEvent } from "@/lib/events";
import { deductInventoryForOrder } from "@/lib/inventory";
import { MASTER_AAPNO_KHANO_CATEGORIES } from "@/lib/menuData";

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
            takenByStaff: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 100,
        });
      }
    } catch (dbErr) {
      console.warn("Orders DB query fallback:", dbErr);
    }

    const liveMemOrders = getLiveOrders();
    const combinedOrdersMap = new Map();

    (liveMemOrders || []).forEach((o) => {
      const oDate = new Date(o.createdAt);
      if (oDate >= startDate && (o.restaurantId === restaurantId || !o.restaurantId)) {
        if (!status || status === "ALL" || o.status === status) {
          combinedOrdersMap.set(o.id || o.humanOrderId, o);
        }
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
    const session = await getCurrentSession();
    const data = await request.json();
    const {
      restaurantId = session?.restaurantId || "rest_aapno_khano",
      customerName = "Direct Guest",
      customerPhone = "9996213962",
      carNumber,
      orderType = "CAR_SERVICE",
      cookingInstructions,
      items = [],
      paymentMethod = "CASH",
      isStaffCashConfirmed = false,
      receivedAmount = 0,
      discountAmount = 0,
    } = data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one valid item" }, { status: 400 });
    }

    const cleanPhone = (customerPhone || "9996213962").replace(/\D/g, "");

    // 1. Calculate Server-Side Item Totals & GST
    const masterDishesMap = new Map();
    MASTER_AAPNO_KHANO_CATEGORIES.forEach((c) => {
      (c.products || []).forEach((p) => {
        masterDishesMap.set(p.id, p);
        masterDishesMap.set(p.name, p);
      });
    });

    let calculatedSubtotal = 0;
    const validatedItems: any[] = [];

    for (const it of items) {
      let product: any = null;
      try {
        if (prisma && it.productId) {
          product = await prisma.product.findUnique({ where: { id: it.productId } });
        }
      } catch (e) {
        product = null;
      }

      if (!product) {
        product = masterDishesMap.get(it.productId) || masterDishesMap.get(it.productName || it.name) || {
          id: it.productId || `p_${Date.now()}`,
          name: it.productName || it.name || "Special Royal Dish",
          basePrice: it.unitPrice || 199,
          isVeg: it.isVeg ?? true,
          kitchenStationId: it.kitchenStationId || null,
        };
      }

      let itemPrice = product.basePrice;
      if (it.selectedVariation === "Small" || it.selectedVariation === "Half") {
        itemPrice = product.priceSmallHalf || product.basePrice * 0.6;
      } else if (it.selectedVariation === "Large" || it.selectedVariation === "Full") {
        itemPrice = product.priceLargeFull || product.basePrice;
      } else if (product.discountPrice) {
        itemPrice = product.discountPrice;
      }

      const qty = Math.max(1, parseInt(it.quantity) || 1);
      const lineTotal = itemPrice * qty;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        selectedVariation: it.selectedVariation || null,
        isVeg: Boolean(product.isVeg),
        quantity: qty,
        unitPrice: itemPrice,
        totalPrice: lineTotal,
        itemNotes: it.specialNotes || it.itemNotes || null,
      });
    }

    const discountVal = parseFloat(discountAmount) || 0;
    const subtotalAfterDiscount = Math.max(0, calculatedSubtotal - discountVal);
    const cgstAmount = +(subtotalAfterDiscount * 0.025).toFixed(2);
    const sgstAmount = +(subtotalAfterDiscount * 0.025).toFixed(2);
    const taxAmount = +(cgstAmount + sgstAmount).toFixed(2);
    const grandTotal = +(subtotalAfterDiscount + taxAmount).toFixed(2);
    const roundedTotal = Math.round(grandTotal);

    const orderNum = Math.floor(1000 + (Date.now() % 9000));
    const humanOrderId = `AK-2026-${orderNum}`;

    // 2. CHECK AUTHORIZATION FOR MANUAL / POS SETTLEMENT
    const isStaff = session?.user && ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER", "WAITER"].includes(session.user.role);
    const validCounterMethods = ["CASH", "UPI", "CARD", "SPLIT", "UPI_DIRECT", "DIRECT_QR", "PAY_AT_COUNTER"];
    const isConfirmedStaffOrder = (isStaffCashConfirmed && validCounterMethods.includes(paymentMethod)) || (isStaff && validCounterMethods.includes(paymentMethod));
    const effectivePaymentMethod = validCounterMethods.includes(paymentMethod) ? paymentMethod : "CASH";

    // CASE A: UNPAID / PENDING ORDER -> Strictly NO Invoice, NO KOT, NO Stock Deduction
    if (!isConfirmedStaffOrder) {
      let pendingOrder: any = null;
      if (prisma) {
        try {
          pendingOrder = await prisma.order.create({
            data: {
              humanOrderId,
              restaurantId,
              customerName: customerName.trim(),
              customerPhone: cleanPhone,
              carNumber: carNumber ? carNumber.trim().toUpperCase() : null,
              orderType,
              status: "awaiting_payment",
              subtotal: calculatedSubtotal,
              discountAmount: discountVal,
              taxAmount,
              grandTotal,
              cookingInstructions: cookingInstructions ? cookingInstructions.trim() : null,
              paymentStatus: "pending",
              paymentMethod: effectivePaymentMethod,
              items: {
                create: validatedItems.map((vi) => ({
                  productName: vi.productName,
                  selectedVariation: vi.selectedVariation,
                  isVeg: vi.isVeg,
                  quantity: vi.quantity,
                  unitPrice: vi.unitPrice,
                  totalPrice: vi.totalPrice,
                  itemNotes: vi.itemNotes,
                  status: "PREPARING",
                  product: { connect: { id: vi.productId } },
                })),
              },
            },
            include: { items: true },
          });
        } catch (dbErr) {
          console.warn("DB pending order fallback:", dbErr);
        }
      }

      if (!pendingOrder) {
        pendingOrder = {
          id: `ord_pending_${Date.now()}`,
          humanOrderId,
          restaurantId,
          customerName,
          customerPhone: cleanPhone,
          carNumber,
          orderType,
          status: "awaiting_payment",
          subtotal: calculatedSubtotal,
          taxAmount,
          grandTotal,
          paymentStatus: "pending",
          paymentMethod: effectivePaymentMethod,
          items: validatedItems,
        };
      }

      // Record to live memory
      recordLiveOrder(pendingOrder);

      return NextResponse.json({
        success: true,
        order: pendingOrder,
        requiresPayment: true,
        status: "awaiting_payment",
        paymentStatus: "pending",
        message: "Order created in awaiting_payment state. Invoice and KOT will be generated strictly upon verified payment.",
      });
    }

    // CASE B: AUTHORIZED CONFIRMED TRANSACTION (POS CASHIER / MANUAL SETTLEMENT)
    const humanInvoiceNumber = `AK-INV-2026-${String(orderNum).padStart(6, "0")}`;
    const humanKotNumber = `KOT-${orderNum}`;
    const transactionId = `${effectivePaymentMethod}_${Date.now()}_${session?.user?.id?.slice(-4) || "POS"}`;

    let orderRecord: any = null;
    let invoiceRecord: any = null;
    let kotRecord: any = null;

    if (prisma) {
      try {
        orderRecord = await prisma.order.create({
          data: {
            humanOrderId,
            restaurantId,
            customerName: customerName.trim(),
            customerPhone: cleanPhone,
            carNumber: carNumber ? carNumber.trim().toUpperCase() : null,
            orderType,
            status: "CONFIRMED",
            subtotal: calculatedSubtotal,
            discountAmount: discountVal,
            taxAmount,
            grandTotal,
            cookingInstructions: cookingInstructions ? cookingInstructions.trim() : null,
            paymentStatus: "PAID",
            paymentMethod: effectivePaymentMethod,
            transactionId,
            takenByStaffId: session?.user?.id || null,
            items: {
              create: validatedItems.map((vi) => ({
                productName: vi.productName,
                selectedVariation: vi.selectedVariation,
                isVeg: vi.isVeg,
                quantity: vi.quantity,
                unitPrice: vi.unitPrice,
                totalPrice: vi.totalPrice,
                itemNotes: vi.itemNotes,
                status: "PREPARING",
                product: { connect: { id: vi.productId } },
              })),
            },
          },
          include: { items: true },
        });

        // 1 Permanent Invoice
        invoiceRecord = await prisma.invoice.create({
          data: {
            humanInvoiceNumber,
            restaurantId,
            orderId: orderRecord.id,
            carNumber: orderRecord.carNumber,
            customerName: orderRecord.customerName,
            customerPhone: orderRecord.customerPhone,
            orderType,
            subtotal: calculatedSubtotal,
            discountAmount: discountVal,
            cgstRate: 2.5,
            cgstAmount,
            sgstRate: 2.5,
            sgstAmount,
            grandTotal,
            roundedTotal,
            paymentMethod: effectivePaymentMethod,
            paymentStatus: "PAID",
            transactionId,
          },
        });

        // 1 KOT Record
        kotRecord = await prisma.kot.create({
          data: {
            humanKotNumber,
            restaurantId,
            orderId: orderRecord.id,
            carNumber: orderRecord.carNumber,
            customerName: orderRecord.customerName,
            orderType,
            status: "PREPARING",
            isPrinted: true,
            printCount: 1,
            kotItems: {
              create: orderRecord.items.map((it: any) => ({
                orderItemId: it.id,
                productName: it.productName,
                selectedVariation: it.selectedVariation,
                isVeg: it.isVeg,
                quantity: it.quantity,
                status: "PREPARING",
              })),
            },
          },
          include: { kotItems: true },
        });

        // Payment Record
        const paymentGateway = effectivePaymentMethod === "CASH" ? "CASH" : effectivePaymentMethod === "UPI" ? "UPI_DIRECT" : effectivePaymentMethod === "CARD" ? "POS_CARD" : "MANUAL";
        await prisma.payment.create({
          data: {
            restaurantId,
            orderId: orderRecord.id,
            invoiceId: invoiceRecord.id,
            amount: grandTotal,
            currency: "INR",
            paymentGateway,
            transactionId,
            paymentMethod: effectivePaymentMethod,
            status: "SUCCESS",
          },
        });

        // Deduct inventory
        await deductInventoryForOrder(orderRecord.id, restaurantId);
      } catch (dbErr) {
        console.warn("DB create confirmed order fallback:", dbErr);
      }
    }

    if (!orderRecord) {
      orderRecord = {
        id: `ord_${effectivePaymentMethod.toLowerCase()}_${Date.now()}`,
        humanOrderId,
        restaurantId,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        carNumber,
        orderType,
        status: "CONFIRMED",
        subtotal: calculatedSubtotal,
        discountAmount: discountVal,
        taxAmount,
        grandTotal,
        paymentStatus: "PAID",
        paymentMethod: effectivePaymentMethod,
        transactionId,
        createdAt: new Date(),
        items: validatedItems,
      };
      invoiceRecord = {
        id: `inv_${Date.now()}`,
        humanInvoiceNumber,
        restaurantId,
        orderId: orderRecord.id,
        customerName: orderRecord.customerName,
        customerPhone: orderRecord.customerPhone,
        subtotal: calculatedSubtotal,
        cgstAmount,
        sgstAmount,
        grandTotal,
        paymentMethod: effectivePaymentMethod,
        paymentStatus: "PAID",
        createdAt: new Date(),
      };
      kotRecord = {
        id: `kot_${Date.now()}`,
        humanKotNumber,
        orderNumber: humanOrderId,
        createdAt: new Date(),
        status: "PREPARING",
        items: validatedItems,
      };
    }

    const effectiveOrderSource = data.source || (isStaffCashConfirmed || isStaff ? "POS_TERMINAL" : "QR_MENU");
    const orderWithSource = { ...orderRecord, source: effectiveOrderSource, isStaffCashConfirmed: Boolean(isStaffCashConfirmed) };
    recordLiveOrder(orderWithSource);
    recordLiveInvoice(invoiceRecord);
    broadcastEvent("pos_rest_aapno_khano", { type: "NEW_CONFIRMED_ORDER", order: orderWithSource, invoice: invoiceRecord, source: effectiveOrderSource });
    broadcastEvent("kds_rest_aapno_khano", { type: "NEW_KOT", kot: kotRecord });

    const printReceiptData = {
      restaurant: {
        name: "आपणो खाणो (Aapno Khaano)",
        address: "Shop No. 50, HUDA Sector 3, Fatehabad, Haryana – 125053",
        city: "Fatehabad",
        phone: "+91 99962 13962",
        gstin: "08AABCU9603R1ZM",
        fssaiNumber: "12224026000189",
        currencySymbol: "₹",
        defaultReceiptFooter: "Padharo Mhare Desh! Thank you for visiting Aapno Khaano.",
      },
      order: {
        humanOrderId,
        createdAt: orderRecord.createdAt,
        customerName: orderRecord.customerName,
        customerPhone: orderRecord.customerPhone,
        carNumber: orderRecord.carNumber,
        orderType: orderRecord.orderType,
        cookingInstructions: orderRecord.cookingInstructions,
        paymentMethod: effectivePaymentMethod,
        paymentStatus: "PAID",
        transactionId,
        subtotal: subtotalAfterDiscount,
        cgstAmount,
        sgstAmount,
        grandTotal,
        discountAmount: discountVal,
      },
      items: (orderRecord.items || validatedItems).map((it: any) => ({
        name: it.productName || it.name,
        selectedVariation: it.selectedVariation,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
        isVeg: it.isVeg,
      })),
    };

    return NextResponse.json({
      success: true,
      order: orderRecord,
      invoice: invoiceRecord,
      kot: kotRecord,
      humanOrderId,
      humanInvoiceNumber,
      printReceiptData,
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create order" }, { status: 500 });
  }
}
