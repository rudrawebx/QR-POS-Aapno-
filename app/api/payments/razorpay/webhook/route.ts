import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { broadcastEvent, recordLiveOrder, recordLiveInvoice } from "@/lib/events";
import { deductInventoryForOrder } from "@/lib/inventory";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing Razorpay signature header" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    let restaurant: any = null;
    try {
      if (prisma) {
        restaurant = await prisma.restaurant.findUnique({
          where: { slug: "aapno-khano" },
          include: { settings: true },
        });
      }
    } catch (e) {
      restaurant = null;
    }

    const webhookSecret =
      restaurant?.settings?.razorpayWebhookSecret ||
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      "demo_webhook_secret_restaurant";

    if (!webhookSecret.includes("demo")) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.error("[Webhook Security] Invalid signature mismatch");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    // Process payment.captured or order.paid
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const rzpPaymentId = paymentEntity?.id;
      const rzpOrderId = paymentEntity?.order_id;

      if (rzpPaymentId && prisma) {
        const existingOrder = await prisma.order.findFirst({
          where: {
            OR: [
              { razorpayPaymentId: rzpPaymentId },
              { transactionId: rzpPaymentId },
              ...(rzpOrderId ? [{ razorpayOrderId: rzpOrderId }] : []),
            ],
          },
          include: { items: true, invoices: true, kots: true },
        });

        if (existingOrder) {
          // Idempotent: Only process if not yet confirmed & paid
          if (existingOrder.paymentStatus !== "PAID") {
            const updatedOrder = await prisma.order.update({
              where: { id: existingOrder.id },
              data: {
                paymentStatus: "PAID",
                status: "CONFIRMED",
                razorpayPaymentId: rzpPaymentId,
                transactionId: rzpPaymentId,
              },
              include: { items: true },
            });

            // Create Invoice if not already existing
            let invoiceRecord = existingOrder.invoices[0];
            if (!invoiceRecord) {
              const orderNum = Math.floor(1000 + (Date.now() % 9000));
              const humanInvoiceNumber = `AK-INV-2026-${String(orderNum).padStart(6, "0")}`;
              const subtotal = updatedOrder.subtotal || 0;
              const cgstAmount = +(subtotal * 0.025).toFixed(2);
              const sgstAmount = +(subtotal * 0.025).toFixed(2);

              invoiceRecord = await prisma.invoice.create({
                data: {
                  humanInvoiceNumber,
                  restaurantId: updatedOrder.restaurantId,
                  orderId: updatedOrder.id,
                  carNumber: updatedOrder.carNumber,
                  customerName: updatedOrder.customerName,
                  customerPhone: updatedOrder.customerPhone,
                  orderType: updatedOrder.orderType,
                  subtotal,
                  cgstRate: 2.5,
                  cgstAmount,
                  sgstRate: 2.5,
                  sgstAmount,
                  grandTotal: updatedOrder.grandTotal,
                  roundedTotal: Math.round(updatedOrder.grandTotal),
                  paymentMethod: "RAZORPAY",
                  paymentStatus: "PAID",
                  transactionId: rzpPaymentId,
                  razorpayPaymentId: rzpPaymentId,
                },
              });
            }

            // Create KOT if not already existing
            let kotRecord = existingOrder.kots[0];
            if (!kotRecord) {
              const orderNum = Math.floor(1000 + (Date.now() % 9000));
              const humanKotNumber = `KOT-${orderNum}`;
              kotRecord = await prisma.kot.create({
                data: {
                  humanKotNumber,
                  restaurantId: updatedOrder.restaurantId,
                  orderId: updatedOrder.id,
                  carNumber: updatedOrder.carNumber,
                  customerName: updatedOrder.customerName,
                  orderType: updatedOrder.orderType,
                  status: "PREPARING",
                  isPrinted: true,
                  printCount: 1,
                  kotItems: {
                    create: updatedOrder.items.map((it: any) => ({
                      orderItemId: it.id,
                      productName: it.productName,
                      selectedVariation: it.selectedVariation,
                      isVeg: it.isVeg,
                      quantity: it.quantity,
                      status: "PREPARING",
                    })),
                  },
                },
              });
            }

            // Deduct recipe BOM inventory
            await deductInventoryForOrder(updatedOrder.id, updatedOrder.restaurantId);

            // Record in real-time event bus
            recordLiveOrder(updatedOrder);
            recordLiveInvoice(invoiceRecord);
            broadcastEvent("pos_rest_aapno_khano", { type: "NEW_CONFIRMED_ORDER", order: updatedOrder, invoice: invoiceRecord });
            broadcastEvent("kds_rest_aapno_khano", { type: "NEW_KOT", kot: kotRecord });
            console.log(`[Webhook] Successfully processed captured payment for order ${updatedOrder.humanOrderId}`);
          }
        }
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      if (rzpOrderId && prisma) {
        await prisma.order.updateMany({
          where: { razorpayOrderId: rzpOrderId, paymentStatus: "pending" },
          data: { paymentStatus: "failed", status: "payment_failed" },
        });
      }
    }

    return NextResponse.json({ status: "ok", received: true });
  } catch (error: any) {
    console.error("Razorpay webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
