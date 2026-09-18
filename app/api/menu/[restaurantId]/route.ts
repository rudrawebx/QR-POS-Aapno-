import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MASTER_AAPNO_KHANO_CATEGORIES, getMergedCategories } from '@/lib/menuData';
import { memoryCache, CacheKeys } from '@/lib/cache';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params;
    const cacheKey = CacheKeys.menu(restaurantId || 'aapno-khano');

    // ⚡ INSTANT IN-MEMORY CACHE HIT (<1ms)
    const cachedCategories = memoryCache.get<any[]>(cacheKey);
    if (cachedCategories && cachedCategories.length > 0) {
      return NextResponse.json(
        { categories: cachedCategories, cached: true },
        { headers: CACHE_HEADERS }
      );
    }

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

    const merged = getMergedCategories(categories);
    // Cache for 5 minutes
    memoryCache.set(cacheKey, merged, 300);

    return NextResponse.json({ categories: merged }, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('Menu fetch error:', error);
    const fallback = getMergedCategories(MASTER_AAPNO_KHANO_CATEGORIES);
    return NextResponse.json({ categories: fallback }, { headers: CACHE_HEADERS });
  }
}

