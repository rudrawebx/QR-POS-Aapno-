import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { broadcastEvent, getLiveOrders } from '@/lib/events';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, refundAmount, refundReason, staffName = 'Staff Member', action = 'STATUS_CHANGE' } = body;

    let updatedOrder: any = null;

    // 1. Try updating in Database
    try {
      if (prisma) {
        const existingOrder = await prisma.order.findUnique({
          where: { id },
          include: { restaurant: true },
        });

        if (existingOrder) {
          const updateData: any = {};
          if (status) updateData.status = status;
          if (action === 'REFUND') {
            updateData.paymentStatus = 'REFUNDED';
            updateData.status = 'CANCELLED';
          }

          updatedOrder = await prisma.order.update({
            where: { id },
            data: updateData,
          });

          if (action === 'REFUND') {
            await prisma.invoice.updateMany({
              where: { orderId: id },
              data: {
                isRefunded: true,
                refundAmount: parseFloat(refundAmount) || existingOrder.grandTotal,
                paymentStatus: 'REFUNDED',
              },
            });
          }
        }
      }
    } catch (dbErr) {
      console.warn('DB order status update warning:', dbErr);
    }

    // 2. Also update in-memory live orders
    const liveOrders = getLiveOrders();
    const liveOrder = liveOrders.find((o) => o.id === id || o.humanOrderId === id);
    if (liveOrder) {
      if (status) liveOrder.status = status;
      if (action === 'REFUND') {
        liveOrder.paymentStatus = 'REFUNDED';
        liveOrder.status = 'CANCELLED';
      }
      if (!updatedOrder) {
        updatedOrder = liveOrder;
      }
    }

    if (!updatedOrder) {
      updatedOrder = {
        id,
        status: status || 'READY',
        paymentStatus: action === 'REFUND' ? 'REFUNDED' : 'PAID',
      };
    }

    // Broadcast SSE update to POS & KDS
    broadcastEvent('pos_rest_aapno_khano', {
      type: 'ORDER_STATUS_UPDATED',
      orderId: id,
      humanOrderId: updatedOrder.humanOrderId || id,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
    });

    broadcastEvent('kds_rest_aapno_khano', {
      type: 'KDS_STATUS_UPDATED',
      orderId: id,
      status: updatedOrder.status,
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Order status update error:', error);
    return NextResponse.json({ success: true });
  }
}
