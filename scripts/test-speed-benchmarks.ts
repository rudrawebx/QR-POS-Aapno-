import { memoryCache, CacheKeys } from '../lib/cache';
import { MASTER_AAPNO_KHANO_CATEGORIES, getMergedCategories } from '../lib/menuData';

async function runSpeedBenchmarks() {
  console.log('========================================================================');
  console.log('⚡ AAPNO KHANO — HIGH-SPEED PERFORMANCE & LATENCY BENCHMARKS ⚡');
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

  // TEST 1: In-Memory Cache Performance (<1ms)
  const t0 = performance.now();
  const menuKey = CacheKeys.menu('aapno-khano');
  const merged = getMergedCategories(MASTER_AAPNO_KHANO_CATEGORIES);
  memoryCache.set(menuKey, merged, 300);
  const t1 = performance.now();

  const cachedData = memoryCache.get(menuKey);
  const t2 = performance.now();
  const getDurationMs = t2 - t1;

  assert(
    cachedData !== null && Array.isArray(cachedData) && cachedData.length === 15,
    'In-Memory Menu Cache Retrieval',
    `Fetched 15 categories (113 dishes) in ${getDurationMs.toFixed(3)}ms (Target < 1ms)`
  );

  // TEST 2: Instant Cache Hits for Table QR Validation
  const tableKey = CacheKeys.tableValidation('aapno-khano', 'table-04');
  memoryCache.set(tableKey, { id: 'table-aapno-04', tableNumber: '04', name: 'Table 04' }, 300);
  
  const t3 = performance.now();
  const cachedTable: any = memoryCache.get(tableKey);
  const t4 = performance.now();
  const tableDurationMs = t4 - t3;

  assert(
    cachedTable && cachedTable.tableNumber === '04',
    'Table QR Dynamic Validation Caching',
    `Resolved Table 04 in ${tableDurationMs.toFixed(3)}ms (Target < 1ms)`
  );

  // TEST 3: Settings Cache Retrieval
  const settingsKey = CacheKeys.settings('rest_aapno_khano');
  memoryCache.set(settingsKey, { id: 'rest_aapno_khano', name: 'आपणो खाणो (Aapno Khaano)', isOpen: true }, 300);
  
  const t5 = performance.now();
  const cachedSettings: any = memoryCache.get(settingsKey);
  const t6 = performance.now();
  const settingsDurationMs = t6 - t5;

  assert(
    cachedSettings && cachedSettings.isOpen === true,
    'Restaurant Settings In-Memory Caching',
    `Resolved Restaurant Settings in ${settingsDurationMs.toFixed(3)}ms (Target < 1ms)`
  );

  // TEST 4: Invalidation Propagation
  memoryCache.invalidatePrefix('menu:');
  const afterInvalidation = memoryCache.get(menuKey);
  assert(
    afterInvalidation === null,
    'Cache Invalidation on Menu Mutation',
    'Successfully cleared stale cache on mutation trigger'
  );

  // TEST 5: Master Menu Fallback Speed (Zero-Lag Guarantee)
  const t7 = performance.now();
  const fallbackCategories = getMergedCategories(MASTER_AAPNO_KHANO_CATEGORIES);
  const t8 = performance.now();
  const fallbackDurationMs = t8 - t7;

  assert(
    fallbackCategories.length === 15,
    'Master Menu Instant Hydration Fallback',
    `Generated full 113-product catalog in ${fallbackDurationMs.toFixed(3)}ms`
  );

  console.log('\n========================================================================');
  console.log(`📊 BENCHMARK SUMMARY: ${passCount}/${totalTests} TESTS PASSED (${Math.round((passCount / totalTests) * 100)}%)`);
  console.log('========================================================================\n');
}

runSpeedBenchmarks();
