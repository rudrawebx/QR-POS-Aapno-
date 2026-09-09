import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    let restaurant = null;

    if (session?.restaurantId) {
      restaurant = await prisma.restaurant.findUnique({
        where: { id: session.restaurantId },
        include: { settings: true, hours: true },
      });
    }

    if (!restaurant) {
      restaurant = await prisma.restaurant.findFirst({
        where: { slug: 'aapno-khano' },
        include: { settings: true, hours: true },
      });
    }

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, restaurant });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await getCurrentSession();
    let restaurantId = session?.restaurantId;

    if (!restaurantId) {
      const defaultRest = await prisma.restaurant.findFirst({ where: { slug: 'aapno-khano' } });
      restaurantId = defaultRest?.id;
    }

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const {
      name,
      phone,
      email,
      address,
      gstin,
      fssaiNumber,
      isRestaurantOpen,
      openingHoursText,
      closureMessage,
      upiId,
      upiMerchantName,
      upiQrImageUrl,
      razorpayKeyId,
      razorpayKeySecret,
      razorpayWebhookSecret,
      paymentMode,
      printerIpBill,
      printerIpKot,
      autoPrintBill,
      autoPrintKot,
      supportWhatsappNumber,
      instagramUrl,
      facebookUrl,
      googleMapsUrl,
      defaultReceiptFooter,
      billTemplateConfig,
      kotTemplateConfig,
    } = body;

    // Update Restaurant
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        name: name !== undefined ? name : undefined,
        phone: phone !== undefined ? phone : undefined,
        email: email !== undefined ? email : undefined,
        address: address !== undefined ? address : undefined,
        gstin: gstin !== undefined ? gstin : undefined,
        fssaiNumber: fssaiNumber !== undefined ? fssaiNumber : undefined,
      },
    });

    // Upsert Settings
    const updatedSettings = await prisma.restaurantSettings.upsert({
      where: { restaurantId },
      update: {
        isRestaurantOpen: isRestaurantOpen !== undefined ? isRestaurantOpen : undefined,
        openingHoursText: openingHoursText !== undefined ? openingHoursText : undefined,
        closureMessage: closureMessage !== undefined ? closureMessage : undefined,
        upiId: upiId !== undefined ? upiId : undefined,
        upiMerchantName: upiMerchantName !== undefined ? upiMerchantName : undefined,
        upiQrImageUrl: upiQrImageUrl !== undefined ? upiQrImageUrl : undefined,
        razorpayKeyId: razorpayKeyId !== undefined ? razorpayKeyId : undefined,
        razorpayKeySecret: razorpayKeySecret !== undefined ? razorpayKeySecret : undefined,
        razorpayWebhookSecret: razorpayWebhookSecret !== undefined ? razorpayWebhookSecret : undefined,
        printerIpBill: printerIpBill !== undefined ? printerIpBill : undefined,
        printerIpKot: printerIpKot !== undefined ? printerIpKot : undefined,
        autoPrintBill: autoPrintBill !== undefined ? autoPrintBill : undefined,
        autoPrintKot: autoPrintKot !== undefined ? autoPrintKot : undefined,
        supportWhatsappNumber: supportWhatsappNumber !== undefined ? supportWhatsappNumber : undefined,
        instagramUrl: instagramUrl !== undefined ? instagramUrl : undefined,
        facebookUrl: facebookUrl !== undefined ? facebookUrl : undefined,
        googleMapsUrl: googleMapsUrl !== undefined ? googleMapsUrl : undefined,
        defaultReceiptFooter: defaultReceiptFooter !== undefined ? defaultReceiptFooter : undefined,
        billTemplateConfig: billTemplateConfig !== undefined ? JSON.stringify(billTemplateConfig) : undefined,
        kotTemplateConfig: kotTemplateConfig !== undefined ? JSON.stringify(kotTemplateConfig) : undefined,
      },
      create: {
        restaurantId,
        isRestaurantOpen: isRestaurantOpen ?? true,
        openingHoursText: openingHoursText || '11:00 AM - 11:30 PM',
        closureMessage: closureMessage || 'We are currently closed for orders.',
        upiId: upiId || '9996213962m@pnb',
        upiMerchantName: upiMerchantName || 'AAPNO KHANO',
        upiQrImageUrl: upiQrImageUrl || '/images/pnb-upi-qr.png',
        razorpayKeyId: razorpayKeyId || 'rzp_test_demo123456',
        razorpayKeySecret: razorpayKeySecret || 'demo_secret_key_restaurant',
        supportWhatsappNumber: supportWhatsappNumber || '+919996213962',
      },
    });

    return NextResponse.json({
      success: true,
      restaurant: updatedRestaurant,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
