import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Fetch all active held orders for restaurant
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId') || 'rest_aapno_khano';

    if (!prisma) {
      return NextResponse.json({ success: true, heldOrders: [] });
    }

    const dbHeldOrders = await prisma.heldOrder.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const formatted = dbHeldOrders.map((h) => {
      let cartItems = [];
      try {
        cartItems = JSON.parse(h.itemsJson);
      } catch (e) {
        cartItems = [];
      }

      return {
        id: h.id,
        holdNumber: h.holdNumber,
        title: h.title,
        createdAt: h.createdAt.toISOString(),
        time: h.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cartItems,
        customerName: h.customerName || '',
        customerPhone: h.customerPhone || '',
        carNumber: h.carNumber || '',
        cookingInstructions: h.cookingInstructions || '',
        orderType: (h.orderType as 'CAR_SERVICE' | 'TAKEAWAY') || 'CAR_SERVICE',
        paymentMethod: (h.paymentMethod as any) || 'UPI',
        discountAmount: h.discountAmount,
        subtotal: h.subtotal,
        taxAmount: h.taxAmount,
        grandTotal: h.grandTotal,
        itemCount: h.itemCount,
      };
    });

    return NextResponse.json({ success: true, heldOrders: formatted });
  } catch (err: any) {
    console.error('Fetch held orders API error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch held orders' }, { status: 500 });
  }
}

// POST: Save or Sync a held order to Database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      restaurantId = 'rest_aapno_khano',
      holdNumber = 1,
      title,
      customerName,
      customerPhone,
      carNumber,
      orderType = 'CAR_SERVICE',
      cookingInstructions,
      paymentMethod = 'UPI',
      discountAmount = 0,
      subtotal = 0,
      taxAmount = 0,
      grandTotal = 0,
      itemCount = 0,
      cartItems = [],
      action,
    } = body;

    if (!prisma) {
      return NextResponse.json({ success: true, message: 'Saved locally' });
    }

    if (action === 'CLEAR_ALL') {
      await prisma.heldOrder.deleteMany({
        where: { restaurantId },
      });
      return NextResponse.json({ success: true, message: 'All held orders cleared' });
    }

    if (action === 'DELETE' && id) {
      await prisma.heldOrder.deleteMany({
        where: { id, restaurantId },
      });
      return NextResponse.json({ success: true, message: 'Held order deleted' });
    }

    // Upsert held order
    const itemsJson = JSON.stringify(cartItems);

    const saved = await prisma.heldOrder.upsert({
      where: { id: id || `hold_${Date.now()}` },
      create: {
        id: id || `hold_${Date.now()}`,
        restaurantId,
        holdNumber,
        title: title || (carNumber ? `Car ${carNumber}` : (customerName || 'Direct Guest')),
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        carNumber: carNumber || null,
        orderType,
        cookingInstructions: cookingInstructions || null,
        paymentMethod,
        discountAmount: Number(discountAmount) || 0,
        subtotal: Number(subtotal) || 0,
        taxAmount: Number(taxAmount) || 0,
        grandTotal: Number(grandTotal) || 0,
        itemCount: Number(itemCount) || 0,
        itemsJson,
      },
      update: {
        holdNumber,
        title: title || (carNumber ? `Car ${carNumber}` : (customerName || 'Direct Guest')),
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        carNumber: carNumber || null,
        orderType,
        cookingInstructions: cookingInstructions || null,
        paymentMethod,
        discountAmount: Number(discountAmount) || 0,
        subtotal: Number(subtotal) || 0,
        taxAmount: Number(taxAmount) || 0,
        grandTotal: Number(grandTotal) || 0,
        itemCount: Number(itemCount) || 0,
        itemsJson,
      },
    });

    return NextResponse.json({ success: true, heldOrder: saved });
  } catch (err: any) {
    console.error('Save held order API error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to save held order' }, { status: 500 });
  }
}

// DELETE: Remove specific held order
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const restaurantId = searchParams.get('restaurantId') || 'rest_aapno_khano';

    if (!id) {
      return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
    }

    if (prisma) {
      await prisma.heldOrder.deleteMany({
        where: { id, restaurantId },
      });
    }

    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (err: any) {
    console.error('Delete held order API error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to delete' }, { status: 500 });
  }
}
