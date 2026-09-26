---
name: menu-manager
description: Manage restaurant dishes, categories, portion variations (Half/Full), pricing, images, and database sync for Aapno Khaano POS.
---

# Menu Manager Runbook

## Adding / Updating Dishes
1. **Images**: Store product images in `public/images/menu/` with `p-{id}-{slug}.{png|jpg|jpeg}`.
2. **Database**: Upsert into `Product` table with `restaurantId: 'rest_aapno_khano'`.
3. **Variations**:
   - If single portion: `hasVariations: false`, `variationType: 'NONE'`, set `basePrice`.
   - If half/full: `hasVariations: true`, `variationType: 'HALF_FULL'`, set `priceSmallHalf` and `priceLargeFull`.
4. **Master Menu Config**: Update `lib/menuData.ts` to keep seed data and local fallback in sync.
