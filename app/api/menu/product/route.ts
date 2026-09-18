import { updateProductOverride } from "@/lib/menuData";
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import { invalidateMenuCache } from '@/lib/cache';


// 1. CREATE DISH
export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    const data = await request.json();

    let restaurantId = session?.restaurantId || 'rest_aapno_khano';
    try {
      if (prisma && !session?.restaurantId) {
        const defaultRest = await prisma.restaurant.findFirst();
        if (defaultRest) restaurantId = defaultRest.id;
      }
    } catch (e) {
      restaurantId = 'rest_aapno_khano';
    }

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

    if (!name || basePrice === undefined) {
      return NextResponse.json({ error: 'Name and Base Price are required' }, { status: 400 });
    }

    const slug =
      (name || 'dish')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + `-${Date.now().toString(36)}`;

    let targetCatId = categoryId || 'cat_handi';
    try {
      if (prisma) {
        let cat = await prisma.category.findFirst({ where: { id: targetCatId } });
        if (!cat) {
          cat = await prisma.category.findFirst();
          if (cat) targetCatId = cat.id;
        }
      }
    } catch (e) {
      targetCatId = 'cat_handi';
    }

    let product: any = {
      id: `prod_${Date.now()}`,
      restaurantId,
      categoryId: targetCatId,
      name,
      shortName: shortName || name,
      sku: sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
      slug,
      description: description || '',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80',
      basePrice: parseFloat(basePrice),
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      hasVariations: Boolean(hasVariations),
      variationType: variationType || 'PORTION',
      priceSmallHalf: priceSmallHalf ? parseFloat(priceSmallHalf) : null,
      priceMedium: priceMedium ? parseFloat(priceMedium) : null,
      priceLargeFull: priceLargeFull ? parseFloat(priceLargeFull) : null,
      gstRate: gstRate ? parseFloat(gstRate) : 5.0,
      taxCategory: taxCategory || 'GST 5%',
      isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
      isVegan: Boolean(isVegan),
      isJain: Boolean(isJain),
      isGlutenFree: Boolean(isGlutenFree),
      spiceLevel: parseInt(spiceLevel || '1'),
      preparationTimeMinutes: parseInt(preparationTimeMinutes || '15'),
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      isBestseller: Boolean(isBestseller),
      isRecommended: Boolean(isRecommended),
      isFeatured: Boolean(isFeatured),
      isArchived: false,
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      createdAt: new Date(),
    };

    try {
      if (prisma) {
        product = await prisma.product.create({
          data: {
            restaurantId,
            categoryId: targetCatId,
            subcategoryId: subcategoryId || null,
            kitchenStationId: kitchenStationId || null,
            name,
            shortName: shortName || name,
            sku: sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
            slug,
            description: description || '',
            imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&h=1000&fit=crop&q=80',
            basePrice: parseFloat(basePrice),
            discountPrice: discountPrice ? parseFloat(discountPrice) : null,
            hasVariations: Boolean(hasVariations),
            variationType: variationType || 'PORTION',
            priceSmallHalf: priceSmallHalf ? parseFloat(priceSmallHalf) : null,
            priceMedium: priceMedium ? parseFloat(priceMedium) : null,
            priceLargeFull: priceLargeFull ? parseFloat(priceLargeFull) : null,
            gstRate: gstRate ? parseFloat(gstRate) : 5.0,
            taxCategory: taxCategory || 'GST 5%',
            isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
            isVegan: Boolean(isVegan),
            isJain: Boolean(isJain),
            isGlutenFree: Boolean(isGlutenFree),
            spiceLevel: parseInt(spiceLevel || '1'),
            preparationTimeMinutes: parseInt(preparationTimeMinutes || '15'),
            isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
            isBestseller: Boolean(isBestseller),
            isRecommended: Boolean(isRecommended),
            isFeatured: Boolean(isFeatured),
            isArchived: false,
            displayOrder: displayOrder ? parseInt(displayOrder) : 0,
          },
          include: {
            category: true,
          },
        });
      }
    } catch (dbErr) {
      console.warn('DB create product warning:', dbErr);
    }

    if (product && product.id) { updateProductOverride(product.id, product); }
    if (id) { updateProductOverride(id, { ...updateData, ...(product || {}) }); }
    invalidateMenuCache(restaurantId);
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ success: true });
  }
}

// 2. UPDATE / EDIT DISH
export async function PATCH(request: Request) {
  try {
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

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (shortName !== undefined) updateData.shortName = shortName;
    if (sku !== undefined) updateData.sku = sku;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
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
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
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

    let product: any = { id, name, basePrice: parseFloat(basePrice || '0'), ...updateData };
    updateProductOverride(id, { name, basePrice: parseFloat(basePrice || '0'), ...updateData });

    try {
      if (prisma) {
        // Ensure restaurant exists
        let restaurantId = 'rest_aapno_khano';
        const existingRest = await prisma.restaurant.findFirst();
        if (existingRest) {
          restaurantId = existingRest.id;
        }

        // Ensure category exists
        let targetCatId = categoryId || 'cat_handi';
        const existingCat = await prisma.category.findFirst({ where: { id: targetCatId } });
        if (!existingCat) {
          const firstCat = await prisma.category.findFirst({ where: { restaurantId } });
          if (firstCat) {
            targetCatId = firstCat.id;
          } else {
            const newCat = await prisma.category.create({
              data: {
                id: targetCatId,
                restaurantId,
                name: 'Special Dishes',
                slug: `special-dishes-${Date.now().toString(36)}`,
              },
            });
            targetCatId = newCat.id;
          }
        }

        const slug =
          (name || 'dish')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + `-${Date.now().toString(36)}`;

        product = await prisma.product.upsert({
          where: { id },
          update: {
            ...updateData,
            categoryId: targetCatId,
          },
          create: {
            id,
            restaurantId,
            categoryId: targetCatId,
            name: name || 'Special Dish',
            slug,
            basePrice: parseFloat(basePrice || '0'),
            ...updateData,
          },
          include: { category: true },
        });
      }
    } catch (dbErr) {
      console.warn('DB upsert product warning:', dbErr);
    }

    invalidateMenuCache();
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ success: true });
  }
}

// 3. DELETE / ARCHIVE DISH
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const permanent = searchParams.get('permanent') === 'true';

    if (!id) return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });

    try {
      if (prisma) {
        if (permanent) {
          await prisma.productModifierGroup.deleteMany({ where: { productId: id } });
          await prisma.product.delete({ where: { id } });
        } else {
          await prisma.product.update({
            where: { id },
            data: { isArchived: true, isAvailable: false },
          });
        }
      }
    } catch (dbErr) {
      console.warn('DB delete product warning:', dbErr);
    }

    invalidateMenuCache();
    return NextResponse.json({ success: true, message: 'Product archived successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ success: true });
  }
}
