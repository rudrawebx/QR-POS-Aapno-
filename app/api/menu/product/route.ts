import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import { invalidateMenuCache } from '@/lib/cache';

// 1. CREATE DISH (Strictly Tenant-Isolated)
export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.restaurantId) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }
    if (!['SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden. Insufficient permissions.' }, { status: 403 });
    }

    const data = await request.json();
    const restaurantId = session.restaurantId;

    const {
      name,
      shortName,
      sku,
      categoryId,
      subcategoryId,
      kitchenStationId,
      basePrice,
      discountPrice,
      hasVariations,
      variationType,
      priceSmallHalf,
      priceMedium,
      priceLargeFull,
      gstRate,
      taxCategory,
      description,
      imageUrl,
      isVeg,
      isVegan,
      isJain,
      isGlutenFree,
      spiceLevel,
      preparationTimeMinutes,
      isAvailable,
      isBestseller,
      isRecommended,
      isFeatured,
      displayOrder,
    } = data;

    if (!name || basePrice === undefined || basePrice === '') {
      return NextResponse.json({ error: 'Food Item Name and Selling Price are required' }, { status: 400 });
    }

    const slug =
      String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + `-${Date.now().toString(36)}`;

    // Verify category belongs to THIS restaurant
    let targetCat = categoryId
      ? await prisma.category.findFirst({ where: { id: categoryId, restaurantId, isArchived: false } })
      : null;

    if (!targetCat) {
      targetCat = await prisma.category.findFirst({ where: { restaurantId, isArchived: false } });
    }
    if (!targetCat) {
      targetCat = await prisma.category.create({
        data: {
          restaurantId,
          name: 'General Menu',
          slug: `general-${Date.now().toString(36)}`,
        },
      });
    }

    const restInfo = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { qsrNumber: true },
    });
    const skuPrefix = restInfo?.qsrNumber || 'SKU';

    const product = await prisma.product.create({
      data: {
        restaurantId,
        categoryId: targetCat.id,
        subcategoryId: subcategoryId || null,
        kitchenStationId: kitchenStationId || null,
        name: String(name).trim(),
        shortName: shortName || String(name).trim(),
        sku: sku?.trim() || `${skuPrefix}-${Date.now().toString(36).toUpperCase()}`,
        slug,
        description: description || '',
        imageUrl: imageUrl?.trim() || null, // Optional image
        basePrice: parseFloat(basePrice),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        hasVariations: Boolean(hasVariations),
        variationType: variationType || 'NONE',
        priceSmallHalf: priceSmallHalf ? parseFloat(priceSmallHalf) : null,
        priceMedium: priceMedium ? parseFloat(priceMedium) : null,
        priceLargeFull: priceLargeFull ? parseFloat(priceLargeFull) : null,
        gstRate: gstRate !== undefined ? parseFloat(gstRate) : 5.0,
        taxCategory: taxCategory || 'GST_5',
        isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
        isVegan: Boolean(isVegan),
        isJain: Boolean(isJain),
        isGlutenFree: Boolean(isGlutenFree),
        spiceLevel: spiceLevel !== undefined ? parseInt(spiceLevel) : 1,
        preparationTimeMinutes: preparationTimeMinutes ? parseInt(preparationTimeMinutes) : 15,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        isBestseller: Boolean(isBestseller),
        isRecommended: Boolean(isRecommended),
        isFeatured: Boolean(isFeatured),
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        isArchived: false,
      },
      include: { category: true },
    });

    await prisma.auditLog.create({
      data: {
        restaurantId,
        userId: session.userId,
        userName: session.name,
        action: 'MENU_ITEM_CREATED',
        entity: 'Product',
        entityId: product.id,
        notes: `Created item "${product.name}" (₹${product.basePrice})`,
      },
    }).catch(() => {});

    invalidateMenuCache(restaurantId);
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create food item' }, { status: 500 });
  }
}

// 2. UPDATE DISH (Strictly Tenant-Isolated)
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
    const {
      id,
      name,
      shortName,
      sku,
      categoryId,
      subcategoryId,
      kitchenStationId,
      basePrice,
      discountPrice,
      hasVariations,
      variationType,
      priceSmallHalf,
      priceMedium,
      priceLargeFull,
      gstRate,
      taxCategory,
      description,
      imageUrl,
      isVeg,
      isVegan,
      isJain,
      isGlutenFree,
      spiceLevel,
      preparationTimeMinutes,
      isAvailable,
      isBestseller,
      isRecommended,
      isFeatured,
      isArchived,
      displayOrder,
    } = data;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Food item not found' }, { status: 404 });
    }
    if (session.role !== 'SUPER_ADMIN' && existing.restaurantId !== session.restaurantId) {
      return NextResponse.json({ error: 'Forbidden: Cross-tenant access denied' }, { status: 403 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (shortName !== undefined) updateData.shortName = shortName;
    if (sku !== undefined) updateData.sku = sku;
    if (categoryId !== undefined) {
      const cat = await prisma.category.findFirst({ where: { id: categoryId, restaurantId: existing.restaurantId } });
      if (cat) updateData.categoryId = cat.id;
    }
    if (subcategoryId !== undefined) updateData.subcategoryId = subcategoryId || null;
    if (kitchenStationId !== undefined) updateData.kitchenStationId = kitchenStationId || null;
    if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? parseFloat(discountPrice) : null;
    if (hasVariations !== undefined) updateData.hasVariations = Boolean(hasVariations);
    if (variationType !== undefined) updateData.variationType = variationType;
    if (priceSmallHalf !== undefined) updateData.priceSmallHalf = priceSmallHalf ? parseFloat(priceSmallHalf) : null;
    if (priceMedium !== undefined) updateData.priceMedium = priceMedium ? parseFloat(priceMedium) : null;
    if (priceLargeFull !== undefined) updateData.priceLargeFull = priceLargeFull ? parseFloat(priceLargeFull) : null;
    if (gstRate !== undefined) updateData.gstRate = parseFloat(gstRate);
    if (taxCategory !== undefined) updateData.taxCategory = taxCategory;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl?.trim() || null;
    if (isVeg !== undefined) updateData.isVeg = Boolean(isVeg);
    if (isVegan !== undefined) updateData.isVegan = Boolean(isVegan);
    if (isJain !== undefined) updateData.isJain = Boolean(isJain);
    if (isGlutenFree !== undefined) updateData.isGlutenFree = Boolean(isGlutenFree);
    if (spiceLevel !== undefined) updateData.spiceLevel = parseInt(spiceLevel);
    if (preparationTimeMinutes !== undefined) updateData.preparationTimeMinutes = parseInt(preparationTimeMinutes);
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);
    if (isBestseller !== undefined) updateData.isBestseller = Boolean(isBestseller);
    if (isRecommended !== undefined) updateData.isRecommended = Boolean(isRecommended);
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (isArchived !== undefined) updateData.isArchived = Boolean(isArchived);
    if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder);

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    await prisma.auditLog.create({
      data: {
        restaurantId: existing.restaurantId,
        userId: session.userId,
        userName: session.name,
        action: 'MENU_ITEM_UPDATED',
        entity: 'Product',
        entityId: product.id,
        notes: `Updated item "${product.name}"`,
      },
    }).catch(() => {});

    invalidateMenuCache(existing.restaurantId);
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update food item' }, { status: 500 });
  }
}

// 3. DELETE / ARCHIVE DISH (Strictly Tenant-Isolated)
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
    const permanent = searchParams.get('permanent') === 'true';

    if (!id) return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Food item not found' }, { status: 404 });
    }
    if (session.role !== 'SUPER_ADMIN' && existing.restaurantId !== session.restaurantId) {
      return NextResponse.json({ error: 'Forbidden: Cross-tenant access denied' }, { status: 403 });
    }

    if (permanent) {
      await prisma.productModifierGroup.deleteMany({ where: { productId: id } });
      await prisma.product.delete({ where: { id } });
    } else {
      await prisma.product.update({
        where: { id },
        data: { isArchived: true, isAvailable: false },
      });
    }

    invalidateMenuCache(existing.restaurantId);
    return NextResponse.json({ success: true, message: 'Product archived successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete food item' }, { status: 500 });
  }
}
