import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const {
      action = 'PRINT_BOTH',
      orderId,
      invoiceId,
      kotId,
      staffName = 'Cashier / Admin',
      notes,
    } = await request.json();

    let restaurantId: string | null = null;
    let orderRef: string | null = null;

    if (orderId) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          printCount: { increment: 1 },
          lastPrintedAt: new Date(),
        },
      });
      restaurantId = order.restaurantId;
      orderRef = order.humanOrderId;
    }

    if (invoiceId) {
      const inv = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          printCount: { increment: 1 },
          lastPrintedAt: new Date(),
        },
      });
      if (!restaurantId) restaurantId = inv.restaurantId;
      if (!orderRef) orderRef = inv.humanInvoiceNumber;
    }

    if (kotId) {
      const kot = await prisma.kot.update({
        where: { id: kotId },
        data: {
          printCount: { increment: 1 },
          lastPrintedAt: new Date(),
        },
      });
      if (!restaurantId) restaurantId = kot.restaurantId;
      if (!orderRef) orderRef = kot.humanKotNumber;
    }

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        restaurantId,
        userName: staffName,
        action: action,
        entity: orderId ? 'Order' : invoiceId ? 'Invoice' : 'Kot',
        entityId: orderId || invoiceId || kotId,
        oldValue: 'Printed',
        newValue: `Reprinted / Fired via ${action}`,
        notes: notes || `Print action ${action} performed for ${orderRef || 'Ticket'}`,
      },
    });

    return NextResponse.json({
      success: true,
      printJobId: `PJ_${Date.now()}`,
      status: 'DISPATCHED_TO_PRINTER',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Print logger error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to log print action' }, { status: 500 });
  }
}
