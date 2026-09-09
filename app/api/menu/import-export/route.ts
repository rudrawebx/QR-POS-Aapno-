import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

// 1. EXPORT MENU
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    const products = await prisma.product.findMany({
      where: { isArchived: false },
      include: {
        category: true,
        kitchenStation: true,
      },
      orderBy: { displayOrder: 'asc' },
    });

    if (format === 'json') {
      return NextResponse.json({ products });
    }

    // CSV format
    const headers = [
      'SKU',
      'Name',
      'ShortName',
      'Category',
      'BasePrice',
      'DiscountPrice',
      'IsVeg',
      'HasVariations',
      'PriceSmallHalf',
      'PriceLargeFull',
      'GSTRate',
      'PrepTimeMins',
      'SpiceLevel',
      'IsBestseller',
      'IsAvailable',
      'KitchenStation',
      'Description',
    ];

    const rows = products.map((p) => [
      `"${p.sku || ''}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${(p.shortName || p.name).replace(/"/g, '""')}"`,
      `"${p.category.name.replace(/"/g, '""')}"`,
      p.basePrice,
      p.discountPrice ?? '',
      p.isVeg ? 'TRUE' : 'FALSE',
      p.hasVariations ? 'TRUE' : 'FALSE',
      p.priceSmallHalf ?? '',
      p.priceLargeFull ?? '',
      p.gstRate,
      p.preparationTimeMinutes,
      p.spiceLevel,
      p.isBestseller ? 'TRUE' : 'FALSE',
      p.isAvailable ? 'TRUE' : 'FALSE',
      `"${p.kitchenStation?.name || ''}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="aapno_khano_menu_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error('Menu export error:', error);
    return NextResponse.json({ error: 'Failed to export menu' }, { status: 500 });
  }
}

// 2. IMPORT MENU
export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    let restaurantId = session?.restaurantId;
    if (!restaurantId) {
      const rest = await prisma.restaurant.findFirst();
      restaurantId = rest?.id;
    }

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant context missing' }, { status: 400 });
    }

    const { items } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No menu items provided for import' }, { status: 400 });
    }

    const errors: string[] = [];
    let importedCount = 0;

    // Pre-fetch categories and stations
    const categories = await prisma.category.findMany({ where: { restaurantId, isArchived: false } });
    const stations = await prisma.kitchenStation.findMany({ where: { restaurantId } });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name || item.basePrice === undefined) {
        errors.push(`Row ${i + 1}: Name and base price are required`);
        continue;
      }

      // Find or create category
      let category = categories.find((c) => c.name.toLowerCase() === (item.category || '').toLowerCase().trim());
      if (!category) {
        const catName = item.category || 'Specialties';
        category = await prisma.category.create({
          data: {
            restaurantId,
            name: catName,
            slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${Date.now().toString(36)}`,
            isVegCategory: item.isVeg !== false,
          },
        });
        categories.push(category);
      }

      // Match station
      const station = stations.find((s) => s.name.toLowerCase() === (item.kitchenStation || '').toLowerCase().trim());

      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${Date.now().toString(36)}-${i}`;

      await prisma.product.create({
        data: {
          restaurantId,
          categoryId: category.id,
          kitchenStationId: station ? station.id : null,
          name: item.name,
          shortName: item.shortName || item.name,
          sku: item.sku || `SKU-${Date.now().toString(36).toUpperCase()}-${i}`,
          slug,
          description: item.description || '',
          imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600',
          basePrice: parseFloat(item.basePrice),
          discountPrice: item.discountPrice ? parseFloat(item.discountPrice) : null,
          hasVariations: Boolean(item.hasVariations),
          variationType: item.variationType || (item.hasVariations ? 'HALF_FULL' : 'NONE'),
          priceSmallHalf: item.priceSmallHalf ? parseFloat(item.priceSmallHalf) : null,
          priceLargeFull: item.priceLargeFull ? parseFloat(item.priceLargeFull) : null,
          gstRate: item.gstRate ? parseFloat(item.gstRate) : 5.0,
          isVeg: item.isVeg !== undefined ? Boolean(item.isVeg) : true,
          spiceLevel: item.spiceLevel ? parseInt(item.spiceLevel) : 1,
          preparationTimeMinutes: item.preparationTimeMinutes ? parseInt(item.preparationTimeMinutes) : 15,
          isAvailable: item.isAvailable !== undefined ? Boolean(item.isAvailable) : true,
          isBestseller: Boolean(item.isBestseller),
        },
      });

      importedCount++;
    }

    return NextResponse.json({
      success: true,
      importedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Menu import error:', error);
    return NextResponse.json({ error: 'Failed to import menu items' }, { status: 500 });
  }
}
