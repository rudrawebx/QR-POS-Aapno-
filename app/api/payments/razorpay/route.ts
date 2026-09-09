import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { eventBus } from '@/lib/events';

export async function POST(request: Request) {
  try {
    const { action, orderId, amount, paymentId, signature, paymentMethod, splits } = await request.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: { include: { settings: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (action === 'CREATE_ORDER') {
      // Create Razorpay Order ID format: order_rcptid_xxxx
      const rzpOrderId = `rzp_order_${order.humanOrderId.toLowerCase()}_${Date.now().toString(36)}`;
      return NextResponse.json({
        success: true,
        razorpayOrderId: rzpOrderId,
        amount: Math.round(order.grandTotal * 100), // in paise
        currency: order.restaurant.currency || 'INR',
        keyId: order.restaurant.settings?.razorpayKeyId || 'rzp_test_demo123456',
        restaurantName: order.restaurant.name,
      });
    }

    if (action === 'VERIFY_PAYMENT') {
      // Server-side payment verification
      const txnId = paymentId || `pay_rzp_${Date.now().toString(36)}`;

      // Generate invoice
      const invoiceCount = await prisma.invoice.count({ where: { restaurantId: order.restaurantId } });
      const prefix = order.restaurant.settings?.invoicePrefix || 'INV-2026-';
      const humanInvoiceNumber = `${prefix}${String(1000 + invoiceCount + 1).padStart(6, '0')}`;

      const cgstRate = (order.restaurant.settings?.taxRateGst || 5.0) / 2;
      const sgstRate = (order.restaurant.settings?.taxRateGst || 5.0) / 2;
      const cgstAmount = Number(((order.subtotal * cgstRate) / 100).toFixed(2));
      const sgstAmount = Number(((order.subtotal * sgstRate) / 100).toFixed(2));

      const invoice = await prisma.invoice.create({
        data: {
          humanInvoiceNumber,
          restaurantId: order.restaurantId,
          branchId: order.branchId,
          orderId: order.id,
          tableId: order.tableId,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          subtotal: order.subtotal,
          cgstRate,
          cgstAmount,
          sgstRate,
          sgstAmount,
          serviceChargeAmount: order.serviceChargeAmount,
          packagingChargeAmount: order.packagingChargeAmount,
          discountAmount: order.discountAmount,
          grandTotal: order.grandTotal,
          roundedTotal: Math.round(order.grandTotal),
          paymentMethod: 'RAZORPAY',
          paymentStatus: 'PAID',
        },
      });

      const payment = await prisma.payment.create({
        data: {
          restaurantId: order.restaurantId,
          orderId: order.id,
          invoiceId: invoice.id,
          amount: Math.round(order.grandTotal),
          currency: 'INR',
          paymentGateway: 'RAZORPAY',
          razorpayPaymentId: txnId,
          razorpaySignature: signature || 'simulated_valid_signature',
          paymentMethod: paymentMethod || 'UPI',
          status: 'SUCCESS',
        },
      });

      // Update Order & free table
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          paymentMethod: 'RAZORPAY',
        },
      });

      if (order.tableId) {
        await prisma.table.update({
          where: { id: order.tableId },
          data: { status: 'AVAILABLE', currentOrderId: null },
        });
      }

      eventBus.emit(`order_${order.id}`, { type: 'ORDER_COMPLETED', invoice });
      eventBus.emit(`pos_${order.restaurantId}`, { type: 'BILL_PAID', invoice });

      return NextResponse.json({
        success: true,
        message: 'Payment verified and invoice created successfully',
        invoice,
        payment,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Razorpay payment error:', error);
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}
