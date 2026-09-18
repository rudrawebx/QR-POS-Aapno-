import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import { invalidateMenuCache } from '@/lib/cache';


export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isArchived: false },
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
    const data = await request.json();
    const { name, description, icon, isVegCategory, displayOrder, imageUrl } = data;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    let restaurantId = session?.restaurantId;
    if (!restaurantId) {
      const rest = await prisma.restaurant.findFirst();
      restaurantId = rest?.id;
    }

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant context not found' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${Date.now().toString(36)}`;

    const category = await prisma.category.create({
      data: {
        restaurantId,
        name,
        slug,
        description: description || '',
        icon: icon || 'Utensils',
        isVegCategory: isVegCategory !== undefined ? Boolean(isVegCategory) : true,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        imageUrl: imageUrl || null,
        isActive: true,
        isArchived: false,
      },
    });

    invalidateMenuCache(restaurantId);
    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { id, name, description, icon, isVegCategory, displayOrder, isActive, imageUrl } = data;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (isVegCategory !== undefined) updateData.isVegCategory = Boolean(isVegCategory);
    if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    invalidateMenuCache();
    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });

    // Soft-archive category so child dishes and invoices are not destroyed
    await prisma.category.update({
      where: { id },
      data: { isArchived: true, isActive: false },
    });

    invalidateMenuCache();
    return NextResponse.json({ success: true, message: 'Category archived' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Failed to archive category' }, { status: 500 });
  }
}
