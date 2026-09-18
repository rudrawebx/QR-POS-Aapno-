import { getMergedCategories, updateProductOverride } from '../lib/menuData';
import { memoryCache, invalidateMenuCache, CacheKeys } from '../lib/cache';

async function testManualImageUpdate() {
  console.log('========================================================================');
  console.log('🖼️ AAPNO KHANO — MANUAL DISH IMAGE UPDATE & PERSISTENCE TEST 🖼️');
  console.log('========================================================================\n');

  let passCount = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail: string) {
    totalTests++;
    if (condition) {
      passCount++;
      console.log(`✅ PASS: ${testName} — ${detail}`);
    } else {
      console.error(`❌ FAIL: ${testName} — ${detail}`);
    }
  }

  // TEST 1: Image override updates in-memory registry and merges cleanly
  const testDishId = 'p-43';
  const customImageUrl = '/images/menu/dish-custom-test-matar-paneer.png';
  
  updateProductOverride(testDishId, {
    imageUrl: customImageUrl,
    name: 'Matar Paneer Royal Handi',
  });

  const merged = getMergedCategories();
  const categoryWithDish = merged.find((c: any) => (c.products || []).some((p: any) => p.id === testDishId));
  const updatedDish = categoryWithDish?.products?.find((p: any) => p.id === testDishId);

  assert(
    updatedDish?.imageUrl === customImageUrl,
    'Manual Image Override in getMergedCategories',
    `Product ${testDishId} image mapped to: ${updatedDish?.imageUrl}`
  );

  assert(
    updatedDish?.name === 'Matar Paneer Royal Handi',
    'Dish Name Update in getMergedCategories',
    `Product ${testDishId} name updated to: ${updatedDish?.name}`
  );

  // TEST 2: DB Categories Merge with Overrides
  const simulatedDbCategories = [
    {
      id: 'cat_wok_veg',
      name: 'The Main Affair From the Wok and Handi — Veg',
      products: [
        {
          id: 'p-43',
          name: 'Matar Paneer Special DB',
          basePrice: 195.0,
          imageUrl: '/images/menu/db-saved-photo.png',
        },
      ],
    },
  ];

  const mergedWithDb = getMergedCategories(simulatedDbCategories);
  const dbCat = mergedWithDb.find((c: any) => c.id === 'cat_wok_veg');
  const dbProd = dbCat?.products?.find((p: any) => p.id === 'p-43');

  assert(
    dbProd && dbProd.id === 'p-43',
    'DB Category & Product Merge Integrity',
    `Retrieved merged DB product with basePrice: ₹${dbProd?.basePrice}`
  );

  // TEST 3: Cache Invalidation after Image Update
  const cacheKey = CacheKeys.menu('aapno-khano');
  memoryCache.set(cacheKey, [{ id: 'old_cache' }], 300);
  assert(memoryCache.get(cacheKey) !== null, 'Cache Pre-condition', 'Cache populated');

  invalidateMenuCache('aapno-khano');
  assert(memoryCache.get(cacheKey) === null, 'Cache Invalidation on Image Save', 'Stale cache purged');

  console.log('\n========================================================================');
  console.log(`📊 TEST SUMMARY: ${passCount}/${totalTests} TESTS PASSED (${Math.round((passCount / totalTests) * 100)}%)`);
  console.log('========================================================================\n');
}

testManualImageUpdate();
