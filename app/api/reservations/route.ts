import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getCurrentSession();
    const restaurantId = searchParams.get('restaurantId') || session?.restaurantId;

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 });
    }

    const reservations = await prisma.reservation.findMany({
      where: { restaurantId },
      include: { table: true },
      orderBy: { reservationDate: 'desc' },
    });

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error('Reservations fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      restaurantId,
      branchId,
      tableId,
      customerName,
      customerPhone,
      customerEmail,
      guestCount,
      reservationDate,
      reservationTime,
      specialRequests,
    } = data;

    const reservation = await prisma.reservation.create({
      data: {
        restaurantId,
        branchId: branchId || null,
        tableId: tableId || null,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        guestCount: parseInt(guestCount || '2'),
        reservationDate: new Date(reservationDate || Date.now()),
        reservationTime: reservationTime || '19:30',
        specialRequests: specialRequests || null,
        status: 'CONFIRMED',
      },
    });

    return NextResponse.json({ success: true, reservation });
  } catch (error) {
    console.error('Create reservation error:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, tableId } = await request.json();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (tableId) updateData.tableId = tableId;

    const reservation = await prisma.reservation.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, reservation });
  } catch (error) {
    console.error('Update reservation error:', error);
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}
