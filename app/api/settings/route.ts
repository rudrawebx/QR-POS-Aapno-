import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import { memoryCache, CacheKeys, invalidateRestaurantCache } from '@/lib/cache';

const CACHE_HEADERS = {
  'Cache-Control': 'no-store',
};

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(request.url);
    const includeLogs = searchParams.get('includeLogs') === 'true';
    const restId = session?.restaurantId || 'rest_aapno_khano';
    const cacheKey = CacheKeys.settings(restId);

    let restaurant: any = null;

    if (!includeLogs) {
      const cached = memoryCache.get<any>(cacheKey);
      if (cached) {
        return NextResponse.json({ success: true, restaurant: cached, cached: true }, { headers: CACHE_HEADERS });
      }
    }

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

    memoryCache.set(cacheKey, restaurant, 300);

    let auditLogs: any[] = [];
    if (includeLogs && session) {
      auditLogs = await prisma.auditLog.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: 'desc' },
        take: 40,
      }).catch(() => []);
    }

    return NextResponse.json({ success: true, restaurant, auditLogs }, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    if (!['SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden. Only Owners and Managers can update restaurant settings.' }, { status: 403 });
    }

    const body = await request.json();
    const restaurantId = session.restaurantId;

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant context not found' }, { status: 404 });
    }

    const {
      name,
      displayName,
      ownerName,
      description,
      phone,
      email,
      address,
      city,
      state,
      postalCode,
      logoUrl,
      bannerUrl,
      gstRegistered,
      gstin,
      gstBusinessName,
      fssaiRegistered,
      fssaiNumber,
      fssaiBusinessName,
      isRestaurantOpen,
      openingHoursText,
      closureMessage,
      upiId,
      upiMerchantName,
      upiQrImageUrl,
      upiQrEnabled,
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

    // Validate optional GSTIN if non-empty
    if (gstin !== undefined && gstin !== null && String(gstin).trim() !== '') {
      const cleanGstin = String(gstin).trim().toUpperCase();
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGstin)) {
        return NextResponse.json({ error: 'Invalid GSTIN format (15-character alphanumeric GSTIN required).' }, { status: 400 });
      }
    }

    // Validate optional FSSAI if non-empty
    if (fssaiNumber !== undefined && fssaiNumber !== null && String(fssaiNumber).trim() !== '') {
      const cleanFssai = String(fssaiNumber).trim();
      if (!/^[0-9]{14}$/.test(cleanFssai)) {
        return NextResponse.json({ error: 'Invalid FSSAI number (must be 14 digits).' }, { status: 400 });
      }
    }

    // Validate optional UPI ID if non-empty
    if (upiId !== undefined && upiId !== null && String(upiId).trim() !== '') {
      const cleanUpi = String(upiId).trim();
      if (!/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(cleanUpi)) {
        return NextResponse.json({ error: 'Invalid UPI ID format (e.g. restaurant@upi).' }, { status: 400 });
      }
    }

    // Update Restaurant (QSR Number is NEVER updated from settings — permanently read-only)
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        name: name !== undefined ? name : undefined,
        displayName: displayName !== undefined ? displayName : undefined,
        ownerName: ownerName !== undefined ? ownerName : undefined,
        description: description !== undefined ? description : undefined,
        phone: phone !== undefined ? phone : undefined,
        email: email !== undefined ? email : undefined,
        address: address !== undefined ? address : undefined,
        city: city !== undefined ? city : undefined,
        state: state !== undefined ? state : undefined,
        postalCode: postalCode !== undefined ? postalCode : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        bannerUrl: bannerUrl !== undefined ? bannerUrl : undefined,
        gstRegistered: gstRegistered !== undefined ? Boolean(gstRegistered) : undefined,
        gstin: gstin !== undefined ? (String(gstin).trim().toUpperCase() || null) : undefined,
        gstBusinessName: gstBusinessName !== undefined ? (String(gstBusinessName).trim() || null) : undefined,
        fssaiRegistered: fssaiRegistered !== undefined ? Boolean(fssaiRegistered) : undefined,
        fssaiNumber: fssaiNumber !== undefined ? (String(fssaiNumber).trim() || null) : undefined,
        fssaiBusinessName: fssaiBusinessName !== undefined ? (String(fssaiBusinessName).trim() || null) : undefined,
      },
    });

    // Upsert Settings (strictly tenant-isolated, never using another restaurant's UPI ID)
    const updatedSettings = await prisma.restaurantSettings.upsert({
      where: { restaurantId },
      update: {
        isRestaurantOpen: isRestaurantOpen !== undefined ? isRestaurantOpen : undefined,
        openingHoursText: openingHoursText !== undefined ? openingHoursText : undefined,
        closureMessage: closureMessage !== undefined ? closureMessage : undefined,
        upiId: upiId !== undefined ? String(upiId).trim() : undefined,
        upiMerchantName: upiMerchantName !== undefined ? upiMerchantName : undefined,
        upiQrImageUrl: upiQrImageUrl !== undefined ? upiQrImageUrl : undefined,
        upiQrEnabled: upiQrEnabled !== undefined ? Boolean(upiQrEnabled) : undefined,
        razorpayKeyId: razorpayKeyId !== undefined ? razorpayKeyId : undefined,
        razorpayKeySecret: razorpayKeySecret !== undefined ? razorpayKeySecret : undefined,
        razorpayWebhookSecret: razorpayWebhookSecret !== undefined ? razorpayWebhookSecret : undefined,
        paymentMode: paymentMode !== undefined ? paymentMode : undefined,
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
        upiId: upiId ? String(upiId).trim() : '',
        upiMerchantName: upiMerchantName || updatedRestaurant.name,
        upiQrImageUrl: upiQrImageUrl || '',
        upiQrEnabled: Boolean(upiQrEnabled && upiId),
        supportWhatsappNumber: supportWhatsappNumber || updatedRestaurant.phone,
        defaultReceiptFooter: `Thank you for visiting ${updatedRestaurant.name}!`,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        restaurantId,
        userId: session.userId,
        userName: session.name,
        action: gstin !== undefined || fssaiNumber !== undefined
          ? 'TAX_COMPLIANCE_UPDATED'
          : upiId !== undefined || upiQrEnabled !== undefined
          ? 'UPI_PAYMENT_UPDATED'
          : 'RESTAURANT_SETTINGS_UPDATED',
        entity: 'RestaurantSettings',
        entityId: restaurantId,
        notes: `Settings updated by ${session.email}`,
      },
    }).catch(() => {});

    // Invalidate cached restaurant settings immediately
    invalidateRestaurantCache(updatedRestaurant.slug);
    invalidateRestaurantCache(restaurantId);

    return NextResponse.json({
      success: true,
      restaurant: { ...updatedRestaurant, settings: updatedSettings },
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
