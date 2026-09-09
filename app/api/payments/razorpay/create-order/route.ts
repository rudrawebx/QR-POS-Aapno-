import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { restaurantSlug = 'aapno-khano', amount, customerName, customerPhone, carNumber } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid payable amount is required' }, { status: 400 });
    }

    let restaurant: any = null;
    try {
      if (prisma) {
        restaurant = await prisma.restaurant.findUnique({
          where: { slug: restaurantSlug },
          include: { settings: true },
        });
      }
    } catch (e) {
      restaurant = null;
    }

    const keyId =
      restaurant?.settings?.razorpayKeyId ||
      process.env.RAZORPAY_KEY_ID ||
      'rzp_test_TWIx6ekD7pnyCY';
    const keySecret =
      restaurant?.settings?.razorpayKeySecret ||
      process.env.RAZORPAY_KEY_SECRET ||
      'Zbn2W1RvnXnWFT2dMxVldrjT';
    const merchantName = restaurant?.settings?.upiMerchantName || restaurant?.name || 'AAPNO KHANO';

    const amountInPaise = Math.round(Number(amount) * 100);
    const receiptId = `rcpt_${Date.now()}_${(customerPhone || '9999').slice(-4)}`;

    let razorpayOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Invoke Razorpay API with key_id & key_secret
    if (keyId && keySecret && !keyId.includes('demo')) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: 'INR',
            receipt: receiptId,
            notes: {
              restaurantName: restaurant?.name || 'आपणो खाणो (Aapno Khaano)',
              customerName: customerName || 'Guest',
              carNumber: carNumber || 'N/A',
            },
          }),
        });

        if (rzpRes.ok) {
          const rzpData = await rzpRes.json();
          razorpayOrderId = rzpData.id;
        }
      } catch (e) {
        console.warn('Razorpay API call warning, fallback order ID generated:', e);
      }
    }

    return NextResponse.json({
      success: true,
      razorpayOrderId,
      amountInPaise,
      amount: Number(amount).toFixed(2),
      currency: 'INR',
      keyId,
      merchantName,
    });
  } catch (error: any) {
    console.error('Razorpay create-order error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create payment order' }, { status: 500 });
  }
}
