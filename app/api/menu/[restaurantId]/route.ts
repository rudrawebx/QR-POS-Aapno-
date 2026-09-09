import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MASTER_AAPNO_KHANO_CATEGORIES, getMergedCategories } from '@/lib/menuData';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params;

    // Resolve restaurant by ID or slug
    let restId = restaurantId;
    if (restaurantId === 'aapno-khano' || restaurantId === 'skdahiya1007' || restaurantId === 'default') {
      try {
        const foundRest = await prisma.restaurant.findFirst({
          where: {
            OR: [
              { slug: 'aapno-khano' },
              { uniqueUsername: 'skdahiya1007' },
            ],
          },
        });
        if (foundRest) {
          restId = foundRest.id;
        }
      } catch (err) {
        console.warn('DB lookup failed, will use fallback menu:', err);
      }
    }

    const includeConfig = {
      products: {
        where: { isArchived: false },
        orderBy: { displayOrder: 'asc' as const },
        include: {
          kitchenStation: true,
          productModifierGroups: {
            include: {
              modifierGroup: {
                include: {
                  modifiers: {
                    where: { isAvailable: true },
                    orderBy: { displayOrder: 'asc' as const },
                  },
                },
              },
            },
          },
        },
      },
    };

    let categories: any[] = [];
    try {
      categories = await prisma.category.findMany({
        where: {
          restaurantId: restId,
          isActive: true,
          isArchived: false,
        },
        orderBy: { displayOrder: 'asc' },
        include: includeConfig,
      });

      // If restaurant has no categories yet, try fetching all active categories
      if (!categories || categories.length === 0) {
        categories = await prisma.category.findMany({
          where: {
            isActive: true,
            isArchived: false,
          },
          orderBy: { displayOrder: 'asc' },
          include: includeConfig,
        });
      }
    } catch (dbErr) {
      console.warn('Prisma categories query failed, using master menu fallback:', dbErr);
      categories = [];
    }

    // GUARANTEE: NEVER return an empty menu — always fallback to MASTER_AAPNO_KHANO_CATEGORIES
    if (!categories || categories.length === 0) {
      categories = MASTER_AAPNO_KHANO_CATEGORIES;
    }

    return NextResponse.json({ categories: getMergedCategories(categories) });
  } catch (error) {
    console.error('Menu fetch error:', error);
    return NextResponse.json({ categories: getMergedCategories(MASTER_AAPNO_KHANO_CATEGORIES) });
  }
}
