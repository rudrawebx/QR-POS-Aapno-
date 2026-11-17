import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import { invalidateMenuCache } from '@/lib/cache';

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || !session.restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      where: { restaurantId: session.restaurantId, isArchived: false },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: { select: { products: { where: { isArchived: false } } } },
      },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Fetch categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!['SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    const { name, description, icon, isVegCategory, displayOrder, imageUrl } = data;

    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const restaurantId = session.restaurantId;
    const slug =
      String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + `-${Date.now().toString(36)}`;

    const category = await prisma.category.create({
      data: {
        restaurantId,
        name: String(name).trim(),
        slug,
        description: description || '',
        icon: icon || 'Utensils',
        isVegCategory: isVegCategory !== undefined ? Boolean(isVegCategory) : true,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        imageUrl: imageUrl?.trim() || null,
        isActive: true,
        isArchived: false,
      },
    });

    await prisma.auditLog.create({
      data: {
        restaurantId,
        userId: session.userId,
        userName: session.name,
        action: 'MENU_CATEGORY_CREATED',
        entity: 'Category',
        entityId: category.id,
        notes: `Created category: ${category.name}`,
      },
    }).catch(() => {});

    invalidateMenuCache(restaurantId);
    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!['SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    const { id, name, description, icon, isVegCategory, displayOrder, isActive, imageUrl } = data;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    if (session.role !== 'SUPER_ADMIN' && existing.restaurantId !== session.restaurantId) {
      return NextResponse.json({ error: 'Forbidden: Cross-tenant access denied' }, { status: 403 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (isVegCategory !== undefined) updateData.isVegCategory = Boolean(isVegCategory);
    if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl?.trim() || null;

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    invalidateMenuCache(existing.restaurantId);
    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!['SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    if (session.role !== 'SUPER_ADMIN' && existing.restaurantId !== session.restaurantId) {
      return NextResponse.json({ error: 'Forbidden: Cross-tenant access denied' }, { status: 403 });
    }

    await prisma.category.update({
      where: { id },
      data: { isArchived: true, isActive: false },
    });

    invalidateMenuCache(existing.restaurantId);
    return NextResponse.json({ success: true, message: 'Category archived' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Failed to archive category' }, { status: 500 });
  }
}
