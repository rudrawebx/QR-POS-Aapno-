import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { recordLiveOrder, getLiveOrders, recordLiveInvoice, broadcastEvent } from "@/lib/events";
import { deductInventoryForOrder } from "@/lib/inventory";
import { MASTER_AAPNO_KHANO_CATEGORIES, isDrinkBeverageItem } from "@/lib/menuData";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// In-memory idempotency cache for duplicate request prevention (expiring after 120 seconds)
const idempotentOrdersCache = new Map<string, { response: any; timestamp: number }>();

function cleanExpiredIdempotencyKeys() {
  const now = Date.now();
  for (const [key, value] of idempotentOrdersCache.entries()) {
    if (now - value.timestamp > 120000) {
      idempotentOrdersCache.delete(key);
    }
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getCurrentSession();

    // Multi-Tenant Isolation:
    // Derive restaurantId strictly from authenticated session unless Super Admin explicitly requests another tenant
    let restaurantId = session?.restaurantId || "rest_aapno_khano";
    if (session?.role === "SUPER_ADMIN" && searchParams.get("restaurantId")) {
      restaurantId = searchParams.get("restaurantId")!;
    }
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

    // HANDLER FOR CASHIER SETTLING / CONFIRMING CASH PAYMENT AT COUNTER
    if (data.action === "CONFIRM_CASH" || data.action === "SETTLE_PAYMENT") {
      const targetOrderId = data.orderId || data.id;
      if (!targetOrderId) {
        return NextResponse.json({ error: "Missing order ID for cash confirmation" }, { status: 400 });
      }

      let existingOrder: any = null;
      if (prisma) {
        try {
          existingOrder = await prisma.order.findFirst({
            where: {
              OR: [{ id: targetOrderId }, { humanOrderId: targetOrderId }],
            },
            include: { items: true, invoices: true, kots: true },
          });
        } catch (e) {
          console.warn("DB find order for cash confirm warning:", e);
        }
      }

      if (!existingOrder) {
        const liveOrders = getLiveOrders() || [];
        existingOrder = liveOrders.find((o: any) => o.id === targetOrderId || o.humanOrderId === targetOrderId);
      }

      if (!existingOrder) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const paymentMethod = data.paymentMethod || "CASH";
      const txnId = `${paymentMethod}_COLLECTED_${Date.now()}`;
      let updatedOrder = existingOrder;
      let invoiceRecord = existingOrder.invoices?.[0] || null;

      if (prisma) {
        try {
          updatedOrder = await prisma.order.update({
            where: { id: existingOrder.id },
            data: {
              paymentStatus: "PAID",
              paymentMethod,
              transactionId: txnId,
              takenByStaffId: session?.userId || null,
            },
            include: { items: true },
          });

          if (!invoiceRecord) {
            const orderNum = Math.floor(1000 + (Date.now() % 9000));
            const humanInvoiceNumber = `AK-INV-2026-${String(orderNum).padStart(6, "0")}`;
            const subtotal = existingOrder.subtotal || 0;
            const discountVal = existingOrder.discountAmount || 0;
            const subtotalAfterDiscount = Math.max(0, subtotal - discountVal);
            const cgstAmount = +(subtotalAfterDiscount * 0.025).toFixed(2);
            const sgstAmount = +(subtotalAfterDiscount * 0.025).toFixed(2);

            invoiceRecord = await prisma.invoice.create({
              data: {
                humanInvoiceNumber,
                restaurantId: existingOrder.restaurantId,
                orderId: existingOrder.id,
                carNumber: existingOrder.carNumber,
                customerName: existingOrder.customerName,
                customerPhone: existingOrder.customerPhone,
                orderType: existingOrder.orderType,
                subtotal,
                discountAmount: discountVal,
                cgstRate: 2.5,
                cgstAmount,
                sgstRate: 2.5,
                sgstAmount,
                grandTotal: existingOrder.grandTotal,
                roundedTotal: Math.round(existingOrder.grandTotal),
                paymentMethod,
                paymentStatus: "PAID",
                transactionId: txnId,
              },
            });
          } else {
            invoiceRecord = await prisma.invoice.update({
              where: { id: invoiceRecord.id },
              data: {
                paymentStatus: "PAID",
                paymentMethod,
                transactionId: txnId,
              },
            });
          }

          // Create payment record
          await prisma.payment.create({
            data: {
              restaurantId: existingOrder.restaurantId,
              orderId: existingOrder.id,
              invoiceId: invoiceRecord?.id || null,
              amount: existingOrder.grandTotal,
              currency: "INR",
              paymentGateway: paymentMethod,
              transactionId: txnId,
              paymentMethod,
              status: "CAPTURED",
            },
          });

          // Deduct recipe BOM inventory
          await deductInventoryForOrder(existingOrder.id, existingOrder.restaurantId);
        } catch (dbErr) {
          console.warn("DB settle order warning:", dbErr);
        }
      }

      // Update in memory & broadcast
      recordLiveOrder({ ...updatedOrder, paymentStatus: "PAID", paymentMethod });
      if (invoiceRecord) {
        recordLiveInvoice(invoiceRecord);
      }
      broadcastEvent("pos_rest_aapno_khano", {
        type: "ORDER_STATUS_UPDATED",
        orderId: existingOrder.id,
        humanOrderId: existingOrder.humanOrderId,
        paymentStatus: "PAID",
        paymentMethod,
      });

      return NextResponse.json({
        success: true,
        order: updatedOrder,
        invoice: invoiceRecord,
        message: "Payment confirmed successfully",
      });
    }

    const {
      restaurantId = session?.restaurantId || "rest_aapno_khano",
      customerName = "Direct Guest",
      customerPhone,
      carNumber,
      orderType = "CAR_SERVICE",
      cookingInstructions,
      items = [],
      paymentMethod = "CASH",
      isStaffCashConfirmed = false,
      receivedAmount = 0,
      discountAmount = 0,
      clientRequestId,
    } = data;

    // 🔒 IDEMPOTENCY CHECK — If client sent same requestId within 15s, return identical response
    if (clientRequestId) {
      cleanExpiredIdempotencyKeys();
      const cached = idempotentOrdersCache.get(clientRequestId);
      if (cached) {
        console.log(`[Idempotency] Returning cached response for duplicate request: ${clientRequestId}`);
        return NextResponse.json(cached.response);
      }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one valid item" }, { status: 400 });
    }

    const cleanPhone = customerPhone && customerPhone.toString().trim() ? customerPhone.toString().trim().replace(/\D/g, "") : "";

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
          id: it.productId || `p-1`,
          name: it.productName || it.name || "Special Royal Dish",
          basePrice: it.unitPrice || 199,
          isVeg: it.isVeg ?? true,
          kitchenStationId: it.kitchenStationId || null,
        };
      }

      let itemPrice = product.basePrice;
      const varStr = (it.selectedVariation || "").toLowerCase();
      if (varStr.includes("half") || varStr.includes("small")) {
        itemPrice = product.priceSmallHalf ?? (product.basePrice * 0.6);
      } else if (varStr.includes("full") || varStr.includes("large")) {
        itemPrice = product.priceLargeFull ?? product.basePrice;
      } else if (it.unitPrice) {
        itemPrice = it.unitPrice;
      } else if (product.discountPrice) {
        itemPrice = product.discountPrice;
      }

      const qty = Math.max(1, parseInt(it.quantity) || 1);
      const lineTotal = itemPrice * qty;
      calculatedSubtotal += lineTotal;

      const isDrink = isDrinkBeverageItem({
        name: product.name,
        categoryId: product.categoryId || null,
        categoryName: product.category?.name || null,
      });

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        selectedVariation: it.selectedVariation || null,
        isVeg: Boolean(product.isVeg),
        isDrink,
        quantity: qty,
        unitPrice: itemPrice,
        totalPrice: lineTotal,
        itemNotes: it.specialNotes || it.itemNotes || null,
      });
    }

    // Separate taxable food items vs exempt drinks (MRP tax inbuilt)
    const taxableFoodTotal = validatedItems
      .filter((it) => !it.isDrink)
      .reduce((sum, it) => sum + it.totalPrice, 0);

    const exemptDrinksTotal = validatedItems
      .filter((it) => it.isDrink)
      .reduce((sum, it) => sum + it.totalPrice, 0);

    const discountVal = parseFloat(discountAmount) || 0;
    const taxableFoodAfterDiscount = Math.max(0, taxableFoodTotal - discountVal);
    const cgstAmount = +(taxableFoodAfterDiscount * 0.025).toFixed(2);
    const sgstAmount = +(taxableFoodAfterDiscount * 0.025).toFixed(2);
    const taxAmount = +(cgstAmount + sgstAmount).toFixed(2);
    const grandTotal = +(taxableFoodAfterDiscount + exemptDrinksTotal + taxAmount).toFixed(2);
    const roundedTotal = Math.round(grandTotal);

    let candidateNum = Math.floor(1000 + (Date.now() % 900000));
    let humanOrderId = `AK-2026-${candidateNum}`;
    let humanInvoiceNumber = `AK-INV-2026-${String(candidateNum).padStart(6, "0")}`;
    let humanKotNumber = `KOT-${candidateNum}`;

    if (prisma) {
      try {
        let attempts = 0;
        while (attempts < 5) {
          const existingInv = await prisma.invoice.findUnique({
            where: { humanInvoiceNumber },
            select: { id: true },
          });
          if (!existingInv) break;
          candidateNum = Math.floor(10000 + Math.random() * 890000);
          humanOrderId = `AK-2026-${candidateNum}`;
          humanInvoiceNumber = `AK-INV-2026-${String(candidateNum).padStart(6, "0")}`;
          humanKotNumber = `KOT-${candidateNum}`;
          attempts++;
        }
      } catch (e) {
        console.warn("Invoice uniqueness check warning:", e);
      }
    }

    // 🛡️ ZERO-DUPLICATE GUARD (ANTI-REPLAY LAYER 1):
    // Calculate unique Cart Signature (Restaurant + Car/Walkin + OrderType + Items + GrandTotal)
    const cleanCar = carNumber ? carNumber.trim().toUpperCase() : "";
    const itemsFingerprint = validatedItems
      .map((vi) => `${vi.productId || vi.productName}:${vi.quantity}:${vi.selectedVariation || ""}`)
      .sort()
      .join("|");
    const cartIdempotencyKey = `fp_${restaurantId}_${cleanCar || "WALKIN"}_${orderType}_${grandTotal}_${itemsFingerprint}`;

    cleanExpiredIdempotencyKeys();
    const cachedByFingerprint = idempotentOrdersCache.get(cartIdempotencyKey);
    if (cachedByFingerprint) {
      console.log(`[Anti-Duplicate Shield] Blocked duplicate order via in-memory cart fingerprint: ${cartIdempotencyKey}`);
      return NextResponse.json({
        ...cachedByFingerprint.response,
        isDuplicatePrevented: true,
        notice: "Duplicate order prevented. Returned original invoice.",
      });
    }

    // 2. CHECK AUTHORIZATION FOR MANUAL / POS SETTLEMENT
    const isStaff = Boolean(session?.userId && ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER", "WAITER"].includes(session.role));
    const validCounterMethods = ["CASH", "UPI", "CARD", "SPLIT", "UPI_DIRECT", "DIRECT_QR", "PAY_AT_COUNTER"];
    const isConfirmedStaffOrder = (isStaffCashConfirmed && isStaff && validCounterMethods.includes(paymentMethod)) || 
                                  (isStaff && validCounterMethods.includes(paymentMethod)) ||
                                  (data.source === "POS_TERMINAL" && isStaffCashConfirmed && validCounterMethods.includes(paymentMethod));
    const effectivePaymentMethod = validCounterMethods.includes(paymentMethod) ? paymentMethod : "CASH";

    // 🛡️ ZERO-DUPLICATE DATABASE SHIELD:
    // If cashier or client tries to settle the exact same order for the same vehicle/table within 120s,
    // intercept it before DB write and return the already generated bill!
    if (isConfirmedStaffOrder && prisma) {
      try {
        const recentCutoff = new Date(Date.now() - 120 * 1000); // 120 seconds
        const candidateDuplicates = await prisma.order.findMany({
          where: {
            restaurantId,
            orderType: orderType || "CAR_SERVICE",
            carNumber: cleanCar || null,
            createdAt: { gte: recentCutoff },
            status: "CONFIRMED",
          },
          include: {
            items: true,
            invoices: true,
            kots: { include: { kotItems: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        });

        for (const prevOrder of candidateDuplicates) {
          const prevFingerprint = (prevOrder.items || [])
            .map((pi: any) => `${pi.productId || pi.productName}:${pi.quantity}:${pi.selectedVariation || ""}`)
            .sort()
            .join("|");

          const isSameItems = itemsFingerprint === prevFingerprint;
          const isSameAmount = Math.abs(prevOrder.grandTotal - grandTotal) < 0.5;

          if (isSameItems && isSameAmount) {
            console.warn(
              `[ZERO-DUPLICATE SHIELD] ⚠️ Intercepted duplicate order for car ${cleanCar || "Counter"}! Reusing ${prevOrder.humanOrderId}`
            );

            const existingInv = prevOrder.invoices?.[0];
            const existingKot = prevOrder.kots?.[0];

            const printReceiptData = {
              restaurant: {
                name: "आपणो खाणो (Aapno Khaano)",
                address: "Shop No. 50, HUDA Sector 3, Fatehabad, Haryana – 125053",
                city: "Fatehabad",
                phone: "+91 70820 40809, +91 70820 40892",
                gstin: "08AABCU9603R1ZM",
                fssaiNumber: "12224026000189",
                currencySymbol: "₹",
                defaultReceiptFooter: "Padharo Mhare Desh! Thank you for visiting Aapno Khaano.",
              },
              order: {
                humanOrderId: prevOrder.humanOrderId,
                createdAt: prevOrder.createdAt,
                customerName: prevOrder.customerName,
                customerPhone: prevOrder.customerPhone,
                carNumber: prevOrder.carNumber,
                orderType: prevOrder.orderType,
                cookingInstructions: prevOrder.cookingInstructions,
                paymentMethod: prevOrder.paymentMethod,
                paymentStatus: prevOrder.paymentStatus,
                transactionId: prevOrder.transactionId,
                subtotal: prevOrder.subtotal,
                cgstAmount: +(prevOrder.taxAmount / 2).toFixed(2),
                sgstAmount: +(prevOrder.taxAmount / 2).toFixed(2),
                grandTotal: prevOrder.grandTotal,
                discountAmount: prevOrder.discountAmount,
              },
              items: (prevOrder.items || []).map((it: any) => ({
                name: it.productName || it.name,
                selectedVariation: it.selectedVariation,
                quantity: it.quantity,
                unitPrice: it.unitPrice,
                totalPrice: it.totalPrice,
                isVeg: it.isVeg,
              })),
            };

            const dupResponse = {
              success: true,
              isDuplicatePrevented: true,
              duplicatePreventedMessage: `Notice: Identical order already processed ${Math.round((Date.now() - new Date(prevOrder.createdAt).getTime()) / 1000)}s ago. Re-printed original bill ${existingInv?.humanInvoiceNumber || prevOrder.humanOrderId}.`,
              order: prevOrder,
              invoice: existingInv,
              kot: existingKot,
              humanOrderId: prevOrder.humanOrderId,
              humanInvoiceNumber: existingInv?.humanInvoiceNumber,
              printReceiptData,
            };

            // Store in cache for subsequent sub-second clicks
            idempotentOrdersCache.set(cartIdempotencyKey, {
              response: dupResponse,
              timestamp: Date.now(),
            });

            return NextResponse.json(dupResponse);
          }
        }
      } catch (dupErr) {
        console.warn("Zero-duplicate DB guard warning:", dupErr);
      }
    }

    // CASE A: UNPAID / PENDING ORDER -> Strictly NO Invoice, NO KOT, NO Stock Deduction
    if (!isConfirmedStaffOrder) {
      let pendingOrder: any = null;
      if (prisma) {
        try {
          // Get all valid product IDs in DB
          const allDbProducts = await prisma.product.findMany({ select: { id: true } });
          const validDbProductIds = new Set(allDbProducts.map((p) => p.id));
          const fallbackProductId = allDbProducts[0]?.id || "p-1";

          pendingOrder = await prisma.order.create({
            data: {
              humanOrderId,
              restaurantId,
              customerName: customerName.trim() || "Direct Guest",
              customerPhone: cleanPhone || "",
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
                  productId: validDbProductIds.has(vi.productId) ? vi.productId : fallbackProductId,
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
          customerPhone: cleanPhone || "",
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
    const transactionId = `${effectivePaymentMethod}_${Date.now()}_${session?.userId?.slice(-4) || "POS"}`;

    let orderRecord: any = null;
    let invoiceRecord: any = null;
    let kotRecord: any = null;

    if (prisma) {
      const attemptDbWrite = async () => {
        // 1. Fetch valid product IDs so foreign key never fails
        const allDbProducts = await prisma.product.findMany({ select: { id: true } });
        const validDbProductIds = new Set(allDbProducts.map((p) => p.id));
        const fallbackProductId = allDbProducts[0]?.id || "p-1";

        // 2. Validate staff ID
        let validStaffId: string | null = null;
        if (session?.userId) {
          const staffUser = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true } });
          if (staffUser) validStaffId = staffUser.id;
        }

        // 3. Create Order
        orderRecord = await prisma.order.create({
          data: {
            humanOrderId,
            restaurantId,
            customerName: customerName.trim() || "Direct Guest",
            customerPhone: cleanPhone || "",
            carNumber: carNumber ? carNumber.trim().toUpperCase() : null,
            orderType: orderType || "CAR_SERVICE",
            status: "CONFIRMED",
            subtotal: calculatedSubtotal,
            discountAmount: discountVal,
            taxAmount,
            grandTotal,
            cookingInstructions: cookingInstructions ? cookingInstructions.trim() : null,
            paymentStatus: "PAID",
            paymentMethod: effectivePaymentMethod,
            transactionId,
            takenByStaffId: validStaffId,
            items: {
              create: validatedItems.map((vi) => ({
                productName: vi.productName,
                selectedVariation: vi.selectedVariation || null,
                isVeg: Boolean(vi.isVeg),
                quantity: vi.quantity,
                unitPrice: vi.unitPrice,
                totalPrice: vi.totalPrice,
                itemNotes: vi.itemNotes || null,
                status: "PREPARING",
                productId: validDbProductIds.has(vi.productId) ? vi.productId : fallbackProductId,
              })),
            },
          },
          include: { items: true },
        });

        // 4. Create Invoice
        invoiceRecord = await prisma.invoice.create({
          data: {
            humanInvoiceNumber,
            restaurantId,
            orderId: orderRecord.id,
            carNumber: orderRecord.carNumber,
            customerName: orderRecord.customerName,
            customerPhone: cleanPhone || "",
            orderType: orderRecord.orderType,
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
          include: {
            order: {
              include: { items: true },
            },
          },
        });

        // 5. Create KOT Record
        kotRecord = await prisma.kot.create({
          data: {
            humanKotNumber,
            restaurantId,
            orderId: orderRecord.id,
            carNumber: orderRecord.carNumber,
            customerName: orderRecord.customerName,
            orderType: orderRecord.orderType,
            status: "PREPARING",
            isPrinted: true,
            printCount: 1,
            kotItems: {
              create: orderRecord.items.map((it: any) => ({
                orderItemId: it.id,
                productName: it.productName,
                selectedVariation: it.selectedVariation || null,
                isVeg: it.isVeg,
                quantity: it.quantity,
                status: "PREPARING",
              })),
            },
          },
          include: { kotItems: true },
        });

        // 6. Payment Record
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

        // 7. Deduct inventory
        await deductInventoryForOrder(orderRecord.id, restaurantId);
      };

      try {
        await attemptDbWrite();
      } catch (firstErr: any) {
        console.error("DB write attempt 1 error:", firstErr?.message);
        try {
          await new Promise((r) => setTimeout(r, 1000));
          await attemptDbWrite();
        } catch (secondErr: any) {
          console.error("DB write attempt 2 error:", secondErr?.message);
        }
      }
    }

    if (!orderRecord) {
      orderRecord = {
        id: `ord_${effectivePaymentMethod.toLowerCase()}_${Date.now()}`,
        humanOrderId,
        restaurantId,
        customerName: customerName.trim() || "Direct Guest",
        customerPhone: cleanPhone || "",
        carNumber: carNumber ? carNumber.trim().toUpperCase() : null,
        orderType: orderType || "CAR_SERVICE",
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
        carNumber: orderRecord.carNumber,
        customerName: orderRecord.customerName,
        customerPhone: cleanPhone || "",
        orderType: orderRecord.orderType,
        subtotal: calculatedSubtotal,
        discountAmount: discountVal,
        cgstAmount,
        sgstAmount,
        grandTotal,
        roundedTotal: Math.round(grandTotal),
        paymentMethod: effectivePaymentMethod,
        paymentStatus: "PAID",
        transactionId,
        createdAt: new Date(),
        order: orderRecord,
        items: validatedItems,
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
        phone: "+91 70820 40809, +91 70820 40892",
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
        subtotal: calculatedSubtotal,
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

    const finalResponse = {
      success: true,
      order: orderRecord,
      invoice: invoiceRecord,
      kot: kotRecord,
      humanOrderId,
      humanInvoiceNumber,
      printReceiptData,
    };

    if (clientRequestId) {
      idempotentOrdersCache.set(clientRequestId, {
        response: finalResponse,
        timestamp: Date.now(),
      });
    }

    if (cartIdempotencyKey) {
      idempotentOrdersCache.set(cartIdempotencyKey, {
        response: finalResponse,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json(finalResponse);
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create order" }, { status: 500 });
  }
}
