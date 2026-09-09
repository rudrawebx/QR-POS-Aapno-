import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { broadcastEvent } from '@/lib/events';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing Razorpay signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Get default restaurant settings for webhook secret
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'aapno-khano' },
      include: { settings: true },
    });

    const webhookSecret = restaurant?.settings?.razorpayWebhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || 'demo_webhook_secret_restaurant';

    if (!webhookSecret.includes('demo')) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    // Process payment.captured or order.paid
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const rzpPaymentId = paymentEntity?.id;
      const rzpOrderId = paymentEntity?.order_id;

      if (rzpPaymentId) {
        // Check if order exists
        const existingOrder = await prisma.order.findFirst({
          where: {
            OR: [
              { razorpayPaymentId: rzpPaymentId },
              { transactionId: rzpPaymentId },
              { razorpayOrderId: rzpOrderId },
            ],
          },
        });

        if (existingOrder) {
          if (existingOrder.paymentStatus !== 'PAID') {
            await prisma.order.update({
              where: { id: existingOrder.id },
              data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
            });
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('Razorpay webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
