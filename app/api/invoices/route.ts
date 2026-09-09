import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import { getLiveInvoices } from '@/lib/events';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getCurrentSession();
    const restaurantId = searchParams.get('restaurantId') || session?.restaurantId || 'rest_aapno_khano';
    const range = searchParams.get('range') || 'TODAY';
    const customStart = searchParams.get('startDate');
    const customEnd = searchParams.get('endDate');
    const searchQuery = searchParams.get('q')?.toLowerCase();

    // Date range calculation
    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (range === 'YESTERDAY') {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      endDate.setHours(23, 59, 59, 999);
    } else if (range === '7DAYS') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '30DAYS') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '3MONTHS') {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '6MONTHS') {
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'ALL') {
      startDate = new Date(2020, 0, 1);
    } else if (range === 'CUSTOM' && customStart) {
      startDate = new Date(customStart);
      startDate.setHours(0, 0, 0, 0);
      if (customEnd) {
        endDate = new Date(customEnd);
        endDate.setHours(23, 59, 59, 999);
      }
    }

    let dbInvoices: any[] = [];
    try {
      if (prisma) {
        dbInvoices = await prisma.invoice.findMany({
          where: {
            restaurantId,
            paymentStatus: "PAID",
            createdAt: { gte: startDate, lte: endDate },
          },
          include: {
            order: {
              include: { items: true },
            },
            payments: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 200,
        });
      }
    } catch (dbErr) {
      console.warn('Invoices DB fetch failed, using fallback list:', dbErr);
    }

    const liveMemInvoices = getLiveInvoices();
    const combinedInvoicesMap = new Map();

    (liveMemInvoices || []).forEach((inv) => {
      const invDate = new Date(inv.createdAt);
      if (invDate >= startDate && invDate <= endDate && (inv.paymentStatus === "PAID" || !inv.paymentStatus)) {
        combinedInvoicesMap.set(inv.id || inv.humanInvoiceNumber, inv);
      }
    });

    (dbInvoices || []).forEach((inv) => {
      combinedInvoicesMap.set(inv.id || inv.humanInvoiceNumber, inv);
    });

    let invoices = Array.from(combinedInvoicesMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (searchQuery) {
      invoices = invoices.filter((inv) => {
        const hNo = (inv.humanInvoiceNumber || '').toLowerCase();
        const cName = (inv.customerName || '').toLowerCase();
        const cPhone = (inv.customerPhone || '').toLowerCase();
        const car = (inv.carNumber || '').toLowerCase();
        return hNo.includes(searchQuery) || cName.includes(searchQuery) || cPhone.includes(searchQuery) || car.includes(searchQuery);
      });
    }

    return NextResponse.json({
      range,
      totalCount: invoices.length,
      totalSalesSum: invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0),
      invoices,
    });
  } catch (error) {
    console.error('Invoices fetch error:', error);
    return NextResponse.json({ invoices: [] });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { orderId, paymentMethod = 'UPI', grandTotal = 500 } = data;

    const orderNum = Math.floor(1000 + (Date.now() % 9000));
    const humanInvoiceNumber = `AK-INV-2026-${String(orderNum).padStart(6, '0')}`;

    let invoice: any = {
      id: `inv_${Date.now()}`,
      humanInvoiceNumber,
      orderId,
      customerName: 'Direct Guest',
      subtotal: grandTotal * 0.95,
      cgstAmount: grandTotal * 0.025,
      sgstAmount: grandTotal * 0.025,
      grandTotal,
      roundedTotal: Math.round(grandTotal),
      paymentMethod,
      paymentStatus: 'PAID',
      createdAt: new Date(),
    };

    try {
      if (prisma) {
        invoice = await prisma.invoice.create({
          data: {
            humanInvoiceNumber,
            restaurantId: 'rest_aapno_khano',
            orderId,
            customerName: 'Direct Guest',
            subtotal: grandTotal * 0.95,
            cgstRate: 2.5,
            cgstAmount: grandTotal * 0.025,
            sgstRate: 2.5,
            sgstAmount: grandTotal * 0.025,
            grandTotal,
            roundedTotal: Math.round(grandTotal),
            paymentMethod,
            paymentStatus: 'PAID',
          },
        });
      }
    } catch (e) {
      console.warn('Database offline during invoice create, serving in-memory invoice:', e);
    }

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error('Generate invoice error:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
