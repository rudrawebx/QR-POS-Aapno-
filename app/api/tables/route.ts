import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId') || session?.restaurantId || 'rest_aapno_khano';

    const tables = await prisma.table.findMany({
      where: { restaurantId },
      orderBy: { tableNumber: 'asc' },
      include: {
        floorZone: true,
        qrCode: true,
        orders: {
          where: {
            status: { in: ['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'] },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            items: true,
          },
        },
      },
    });

    const floorZones = await prisma.floorZone.findMany({
      where: { restaurantId },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ tables, floorZones });
  } catch (error) {
    console.error('Tables fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tableNumber, name, capacity, floorZoneId } = await request.json();

    const token = `qr_${session.restaurantSlug || 'rest'}_table_${tableNumber}_${Date.now().toString(36)}`;

    const table = await prisma.table.create({
      data: {
        restaurantId: session.restaurantId,
        branchId: session.branchId,
        tableNumber,
        name: name || `Table ${tableNumber}`,
        capacity: parseInt(capacity || '4'),
        floorZoneId: floorZoneId || null,
        qrCodeToken: token,
        status: 'AVAILABLE',
      },
    });

    await prisma.qrCode.create({
      data: {
        restaurantId: session.restaurantId,
        branchId: session.branchId,
        tableId: table.id,
        token,
        scanCount: 0,
      },
    });

    return NextResponse.json({ success: true, table });
  } catch (error) {
    console.error('Create table error:', error);
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, name, capacity, assignedWaiterId } = await request.json();

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (name !== undefined) updateData.name = name;
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    if (assignedWaiterId !== undefined) updateData.assignedWaiterId = assignedWaiterId;

    const table = await prisma.table.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, table });
  } catch (error) {
    console.error('Update table error:', error);
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing table ID' }, { status: 400 });

    await prisma.table.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Table deleted' });
  } catch (error) {
    console.error('Delete table error:', error);
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
  }
}
