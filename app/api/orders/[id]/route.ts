import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { eventBus } from '@/lib/events';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { humanOrderId: id }],
      },
      include: {
        restaurant: {
          include: { settings: true },
        },
        table: true,
        items: {
          include: {
            modifiers: true,
            kitchenStation: true,
          },
        },
        kots: {
          include: {
            kitchenStation: true,
            kotItems: true,
          },
        },
        invoices: true,
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, paymentStatus, paymentMethod } = await request.json();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        restaurant: true,
        table: true,
        items: true,
      },
    });

    // If order is COMPLETED or CANCELLED, free up the table
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      if (order.tableId) {
        await prisma.table.update({
          where: { id: order.tableId },
          data: {
            status: 'AVAILABLE',
            currentOrderId: null,
          },
        });
      }
    }

    // Broadcast status change to customer tracker, POS & KDS
    eventBus.emit(`order_${order.id}`, {
      type: 'ORDER_STATUS_CHANGED',
      order,
    });

    eventBus.emit(`pos_${order.restaurantId}`, {
      type: 'ORDER_UPDATED',
      order,
    });

    eventBus.emit(`kds_${order.restaurantId}`, {
      type: 'ORDER_UPDATED',
      order,
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
