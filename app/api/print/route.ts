import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getLiveOrders } from "@/lib/events";

export async function POST(request: Request) {
  try {
    const {
      action = "PRINT_BOTH",
      orderId,
      invoiceId,
      kotId,
      staffName = "Cashier / Admin",
      notes,
    } = await request.json();

    let restaurantId = "rest_aapno_khano";
    let orderRef: string | null = null;
    let targetOrder: any = null;

    if (prisma) {
      try {
        if (orderId) {
          targetOrder = await prisma.order.findFirst({
            where: {
              OR: [
                { id: orderId },
                { humanOrderId: orderId },
              ],
            },
          });
        } else if (invoiceId) {
          const inv = await prisma.invoice.findFirst({
            where: {
              OR: [
                { id: invoiceId },
                { humanInvoiceNumber: invoiceId },
              ],
            },
            include: { order: true },
          });
          targetOrder = inv?.order;
        }
      } catch (dbErr) {
        console.warn("DB order lookup warning in print route:", dbErr);
      }
    }

    // Check Live Memory if not found in DB
    if (!targetOrder && orderId) {
      const liveOrders = getLiveOrders() || [];
      targetOrder = liveOrders.find(
        (o: any) => o.id === orderId || o.humanOrderId === orderId
      );
    }

    // STRICT SECURITY CHECK: Reject print if order is unpaid
    if (targetOrder) {
      const isPaid =
        targetOrder.paymentStatus === "PAID" ||
        targetOrder.paymentStatus === "paid" ||
        targetOrder.status === "CONFIRMED" ||
        targetOrder.status === "confirmed";

      if (!isPaid) {
        console.error(`[Print Security] Rejected print attempt for unpaid order ${targetOrder.humanOrderId || targetOrder.id}`);
        return NextResponse.json(
          { error: "Security Violation: Cannot print Bill or KOT for unpaid order. Payment must be verified first." },
          { status: 403 }
        );
      }

      if (prisma && targetOrder.id) {
        try {
          await prisma.order.update({
            where: { id: targetOrder.id },
            data: {
              printCount: { increment: 1 },
              lastPrintedAt: new Date(),
            },
          });
        } catch (updateErr) {
          // Non-blocking
        }
      }
      restaurantId = targetOrder.restaurantId || restaurantId;
      orderRef = targetOrder.humanOrderId || targetOrder.id;
    } else {
      return NextResponse.json(
        { error: "Order not found or invalid" },
        { status: 404 }
      );
    }

    // Log reprint in AuditLog
    if (prisma) {
      try {
        await prisma.auditLog.create({
          data: {
            restaurantId,
            userName: staffName,
            action,
            entity: orderId ? "Order" : invoiceId ? "Invoice" : "Kot",
            entityId: orderRef || orderId || invoiceId || "PRINT_JOB",
            details: `Printed via ${action}. Notes: ${notes || "Verified Paid Print"}`,
          },
        });
      } catch (auditErr) {
        // Non-blocking audit log
      }
    }

    return NextResponse.json({
      success: true,
      printed: true,
      action,
      orderRef,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error("Print API error:", error);
    return NextResponse.json({ error: error?.message || "Failed to process print logging" }, { status: 500 });
  }
}
