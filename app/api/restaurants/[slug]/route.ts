import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    let restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { slug: slug.toLowerCase() },
          { uniqueUsername: slug.toLowerCase() },
        ],
      },
      include: {
        settings: true,
        hours: true,
        branches: true,
      },
    });

    // Auto-create Aapno Khaano restaurant record if running on a fresh Vercel serverless instance
    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: {
          id: 'rest_aapno_khano_default',
          name: 'आपणो खाणो (Aapno Khaano)',
          slug: 'aapno-khano',
          uniqueUsername: 'skdahiya1007',
          logoUrl: '/images/aapno-khano-logo.png',
          bannerUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200',
          description: 'Authentic Royal Rajasthani & North Indian Handi Specialties • Car Service • QSR Drive-In',
          cuisine: 'Rajasthani Handi, Tandoor & Wok Curries',
          phone: '+91 99962 13962',
          email: 'contact@aapnokhano.com',
          address: 'Shop No. 50, HUDA Sector 3, Fatehabad, Haryana – 125053',
          city: 'Fatehabad',
          state: 'Haryana',
          postalCode: '125053',
          country: 'India',
          currency: 'INR',
          currencySymbol: '₹',
          timezone: 'Asia/Kolkata',
          gstin: '08AABCU9603R1ZM',
          fssaiNumber: '12224026000189',
          settings: {
            create: {
              upiId: '9996213962m@pnb',
              upiMerchantName: 'AAPNO KHANO',
              upiQrImageUrl: '/images/pnb-upi-qr.png',
              taxRateGst: 5.0,
              serviceChargeRate: 0.0,
              autoPrintKot: true,
              autoAcceptOrders: true,
              soundAlertsEnabled: true,
              defaultReceiptFooter: 'Padharo Mhare Desh! Thank you for visiting Aapno Khaano.',
              invoicePrefix: 'AK-2026-',
              kotPrefix: 'KOT-',
              themePrimaryColor: '#7A0C16',
              themeGoldColor: '#D4AF37',
            },
          },
        },
        include: {
          settings: true,
          hours: true,
          branches: true,
        },
      });
    }

    return NextResponse.json({
      restaurant: {
        ...restaurant,
        isOpen: true,
        closedReason: '',
      },
    });
  } catch (error) {
    console.error('Restaurant fetch error:', error);
    // Safe fallback object for Vercel
    return NextResponse.json({
      restaurant: {
        id: 'rest_aapno_khano_default',
        name: 'आपणो खाणो (Aapno Khaano)',
        slug: 'aapno-khano',
        uniqueUsername: 'skdahiya1007',
        logoUrl: '/images/aapno-khano-logo.png',
        phone: '+91 99962 13962',
        address: 'Shop No. 50, HUDA Sector 3, Fatehabad, Haryana – 125053',
        city: 'Fatehabad',
        state: 'Haryana',
        postalCode: '125053',
        gstin: '08AABCU9603R1ZM',
        fssaiNumber: '12224026000189',
        currencySymbol: '₹',
        isOpen: true,
        settings: {
          upiId: '9996213962m@pnb',
          upiMerchantName: 'AAPNO KHANO',
          upiQrImageUrl: '/images/pnb-upi-qr.png',
          taxRateGst: 5.0,
          themePrimaryColor: '#7A0C16',
          themeGoldColor: '#D4AF37',
        },
      },
    });
  }
}
