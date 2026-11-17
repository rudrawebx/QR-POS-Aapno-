import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MASTER_AAPNO_KHANO_CATEGORIES, getMergedCategories } from '@/lib/menuData';
import { memoryCache, CacheKeys } from '@/lib/cache';

const CACHE_HEADERS = {
  'Cache-Control': 'no-store',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params;
    const { searchParams } = new URL(request.url);
    const bypassCache = searchParams.has('t') || searchParams.get('fresh') === '1';
    const cacheKey = CacheKeys.menu(restaurantId || 'aapno-khano');

    // ⚡ INSTANT IN-MEMORY CACHE HIT (<1ms) unless fresh requested
    if (!bypassCache) {
      const cachedCategories = memoryCache.get<any[]>(cacheKey);
      if (cachedCategories && cachedCategories.length > 0) {
        return NextResponse.json(
          { categories: cachedCategories, cached: true },
          { headers: CACHE_HEADERS }
        );
      }
    }

    // Resolve restaurant by ID or slug
    let restId = restaurantId;
    try {
      const foundRest = await prisma.restaurant.findFirst({
        where: {
          OR: [
            { id: restaurantId },
            { slug: restaurantId.toLowerCase() },
            { uniqueUsername: restaurantId.toLowerCase() },
          ],
        },
      });
      if (foundRest) {
        restId = foundRest.id;
      }
    } catch (err) {
      console.warn('DB restaurant lookup failed:', err);
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

      // If restaurant has no categories yet and is master, try fetching all active categories
      const isMasterTenant = restId === 'rest_aapno_khano' || restId === 'aapno-khano' || restId === 'default';
      if ((!categories || categories.length === 0) && isMasterTenant) {
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

    const isMasterTenant = restId === 'rest_aapno_khano' || restId === 'aapno-khano' || restId === 'default';

    // GUARANTEE: NEVER return an empty menu for master tenant — always fallback to MASTER_AAPNO_KHANO_CATEGORIES
    if ((!categories || categories.length === 0) && isMasterTenant) {
      categories = MASTER_AAPNO_KHANO_CATEGORIES;
    }

    const merged = getMergedCategories(categories, !isMasterTenant);
    // Cache for 5 minutes
    memoryCache.set(cacheKey, merged, 300);

    return NextResponse.json({ categories: merged }, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('Menu fetch error:', error);
    const fallback = getMergedCategories(MASTER_AAPNO_KHANO_CATEGORIES);
    return NextResponse.json({ categories: fallback }, { headers: CACHE_HEADERS });
  }
}

