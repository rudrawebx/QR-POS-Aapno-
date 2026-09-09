import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, getCurrentSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getCurrentSession();
    const restaurantId = searchParams.get('restaurantId') || session?.restaurantId;

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 });
    }

    const staff = await prisma.user.findMany({
      where: {
        restaurantId,
        // Exclude root SUPER_ADMIN from restaurant staff list
        role: { not: 'SUPER_ADMIN' },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        pinCode: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { role: 'asc' },
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Staff fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    let restaurantId = session?.restaurantId;
    if (!restaurantId) {
      const rest = await prisma.restaurant.findFirst();
      restaurantId = rest?.id;
    }

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant context required' }, { status: 400 });
    }

    const { name, email, phone, role, password, pinCode } = await request.json();

    // CRITICAL SECURITY RULE: NEVER ALLOW CREATING SUPER_ADMIN VIA NORMAL UI/API
    if (role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: '403 Forbidden — Cannot create Super Admin account' },
        { status: 403 }
      );
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        restaurantId,
        branchId: session?.branchId || null,
        name,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        role: role || 'WAITER',
        passwordHash: hashPassword(password || 'staff123'),
        pinCode: pinCode || '1234',
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Create staff error:', error);
    return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, role, isActive, pinCode, name, phone, password } = await request.json();

    // CRITICAL SECURITY RULE: REJECT ESCALATION TO SUPER_ADMIN
    if (role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: '403 Forbidden — Cannot escalate to Super Admin account' },
        { status: 403 }
      );
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Protect root Super Admin from demotion or suspension
    if (targetUser.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: '403 Forbidden — Root Super Admin account cannot be modified via staff API' },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (pinCode) updateData.pinCode = pinCode;
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (password) updateData.passwordHash = hashPassword(password);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Update staff error:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Protect root Super Admin from deletion
    if (targetUser.role === 'SUPER_ADMIN' || targetUser.email === 'admin@restro.com') {
      return NextResponse.json(
        { error: '403 Forbidden — Root Super Admin account cannot be deleted' },
        { status: 403 }
      );
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Delete staff error:', error);
    return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 });
  }
}
