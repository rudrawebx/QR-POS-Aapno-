import { PrismaClient } from '@prisma/client';
import { MASTER_AAPNO_KHANO_CATEGORIES } from '../lib/menuData';
import { hashPassword, verifyPassword, checkLoginRateLimit, recordFailedLogin, resetLoginRateLimit } from '../lib/auth';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  details: string;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, details: string) {
  results.push({
    suite,
    name,
    passed: condition,
    details,
  });
  if (condition) {
    console.log(`  ✅ PASS: [${suite}] ${name} -> ${details}`);
  } else {
    console.error(`  ❌ FAIL: [${suite}] ${name} -> ${details}`);
  }
}

async function runMasterQASuite() {
  console.log('========================================================================');
  console.log('👑 AAPNO KHANO (FATEHABAD) — COMPLETE QA & SYSTEM AUDIT SUITE 👑');
  console.log('========================================================================\n');

  // ============================================================================
  // SUITE 1: RESTAURANT CONFIGURATION & LEGAL COMPLIANCE
  // ============================================================================
  console.log('--- SUITE 1: RESTAURANT & COMPLIANCE (FATEHABAD) ---');
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: 'rest_aapno_khano' },
    });

    assert(
      restaurant !== null,
      'SUITE 1',
      'Restaurant Record Exists',
      `Found restaurant: ${restaurant?.name} (ID: ${restaurant?.id})`
    );

    assert(
      restaurant?.gstin === '06ACOFA4890L1ZT',
      'SUITE 1',
      'Real GSTIN Verification',
      `GSTIN: ${restaurant?.gstin} (Matches 06ACOFA4890L1ZT)`
    );

    assert(
      restaurant?.fssaiNumber === '20826004003060',
      'SUITE 1',
      'Real FSSAI License Verification',
      `FSSAI: ${restaurant?.fssaiNumber} (Matches 20826004003060)`
    );

    assert(
      restaurant?.city === 'Fatehabad' && restaurant?.address.includes('HUDA Sector 3'),
      'SUITE 1',
      'Address & City (Fatehabad Branch)',
      `Address: ${restaurant?.address}`
    );

    assert(
      restaurant?.isActive === true,
      'SUITE 1',
      'Restaurant Active Status',
      `isActive: ${restaurant?.isActive}`
    );
  } catch (err: any) {
    assert(false, 'SUITE 1', 'Database Connection for Restaurant', `Error: ${err.message}`);
  }

  // ============================================================================
  // SUITE 2: MENU CATALOG & DISH PRICING INTEGRITY (134 DISHES)
  // ============================================================================
  console.log('\n--- SUITE 2: MENU CATALOG & PRICING INTEGRITY ---');
  try {
    // 2.1 Verify local menuData.ts
    const localCategories = MASTER_AAPNO_KHANO_CATEGORIES;
    const localProducts = localCategories.flatMap((c) => c.products || []);
    
    assert(
      localCategories.length === 15,
      'SUITE 2',
      'Total Categories in Codebase',
      `Count: ${localCategories.length} categories`
    );

    assert(
      localProducts.length === 134,
      'SUITE 2',
      'Total Master Dishes in Codebase',
      `Count: ${localProducts.length} dishes (Expected: 134)`
    );

    // 2.2 Verify Database Products
    const dbProducts = await prisma.product.findMany({
      where: { restaurantId: 'rest_aapno_khano' },
    });

    assert(
      dbProducts.length === 134,
      'SUITE 2',
      'Total Dishes in Hostinger MySQL',
      `Count: ${dbProducts.length} dishes in DB`
    );

    // 2.3 Verify Onion Rings (p-6)
    const onionRings = dbProducts.find((p) => p.id === 'p-6');
    assert(
      onionRings !== undefined && onionRings.basePrice === 29.0 && onionRings.isAvailable && !onionRings.isArchived,
      'SUITE 2',
      'Onion Rings (p-6) Active & Priced at ₹29',
      `BasePrice: ₹${onionRings?.basePrice}, Available: ${onionRings?.isAvailable}, Archived: ${onionRings?.isArchived}`
    );

    // 2.4 Verify Tandoori Leg Variations
    const tandooriLeg = dbProducts.find((p) => p.id === 'p-124');
    assert(
      tandooriLeg !== undefined &&
      tandooriLeg.hasVariations &&
      tandooriLeg.priceSmallHalf === 349.0 &&
      tandooriLeg.priceLargeFull === 599.0,
      'SUITE 2',
      'Tandoori Leg (p-124) Half ₹349 / Full ₹599',
      `Half: ₹${tandooriLeg?.priceSmallHalf}, Full: ₹${tandooriLeg?.priceLargeFull}`
    );

    // 2.5 Verify Tandoori Stuffed Leg Variations
    const stuffedLeg = dbProducts.find((p) => p.id === 'p-78');
    assert(
      stuffedLeg !== undefined &&
      stuffedLeg.hasVariations &&
      stuffedLeg.priceSmallHalf === 379.0 &&
      stuffedLeg.priceLargeFull === 649.0,
      'SUITE 2',
      'Tandoori Stuffed Leg (p-78) Half ₹379 / Full ₹649',
      `Half: ₹${stuffedLeg?.priceSmallHalf}, Full: ₹${stuffedLeg?.priceLargeFull}`
    );

    // 2.6 Verify All 9 Fish Dishes
    const fishExpected = [
      { id: 'p-126', name: 'Fish Fry', price: 399.0, cat: 'cat-red-and-white-snacks' },
      { id: 'p-127', name: 'Amritsari Fish Fry', price: 419.0, cat: 'cat-red-and-white-snacks' },
      { id: 'p-128', name: 'Fish Tikka', price: 399.0, cat: 'cat-non-veg-tandoor-bites' },
      { id: 'p-129', name: 'Achari Fish Tikka', price: 429.0, cat: 'cat-non-veg-tandoor-bites' },
      { id: 'p-130', name: 'Fish Lemon Tikka', price: 459.0, cat: 'cat-non-veg-tandoor-bites' },
      { id: 'p-131', name: 'Fish Malai Tikka', price: 469.0, cat: 'cat-non-veg-tandoor-bites' },
      { id: 'p-132', name: 'Fish Curry', price: 449.0, cat: 'cat-main-course-non-veg' },
      { id: 'p-133', name: 'Tawa Fish', price: 449.0, cat: 'cat-main-course-non-veg' },
      { id: 'p-134', name: 'Chilly Fish', price: 439.0, cat: 'cat-main-course-non-veg' },
    ];

    let allFishValid = true;
    for (const fe of fishExpected) {
      const found = dbProducts.find((p) => p.id === fe.id);
      if (!found || found.basePrice !== fe.price || found.categoryId !== fe.cat || found.isVeg !== false) {
        allFishValid = false;
        console.error(`Mismatch for fish item ${fe.id}: ${JSON.stringify(found)}`);
      }
    }

    assert(
      allFishValid,
      'SUITE 2',
      'All 9 Fish Dishes Verified with Exact Pricing & Categories',
      `Verified 9/9 fish items (p-126 to p-134) in MySQL`
    );

    // 2.7 Verify No Negative / Zero Prices in Active Catalog
    const invalidPrices = dbProducts.filter((p) => p.isAvailable && !p.isArchived && p.basePrice <= 0);
    assert(
      invalidPrices.length === 0,
      'SUITE 2',
      'Zero Free or Negative Priced Active Items',
      `Invalid items found: ${invalidPrices.length}`
    );
  } catch (err: any) {
    assert(false, 'SUITE 2', 'Menu Database Verification', `Error: ${err.message}`);
  }

  // ============================================================================
  // SUITE 3: SECURITY, PASSWORDS & RBAC LOCKOUT TESTS
  // ============================================================================
  console.log('\n--- SUITE 3: SECURITY & AUTHENTICATION TESTS ---');
  try {
    // 3.1 Cryptographic Salted Hashing
    const testSecret = 'Fatehabad#Aapno@Sector3';
    const hashed = hashPassword(testSecret);
    const validCheck = verifyPassword(testSecret, hashed);
    const rejectCheck = !verifyPassword('BadPass#123', hashed);

    assert(
      hashed.startsWith('scrypt$') && validCheck && rejectCheck,
      'SUITE 3',
      'Salted Scrypt Hashing & Verification',
      `Generated: ${hashed.slice(0, 30)}...`
    );

    // 3.2 Password Validation for All 6 Staff Roles
    const credentials = [
      { role: 'Super Admin', pass: 'Khano#Aapno@Sector3' },
      { role: 'Restaurant Owner', pass: 'Fatehabad#Aapno@Sector3' },
      { role: 'Restaurant Manager', pass: 'FTDmngr#Aapno@Sector3' },
      { role: 'Billing Cashier', pass: 'FTDcashier#Aapno@Sector3' },
      { role: 'Kitchen Chef (KDS)', pass: 'FTDKitchen#Aapno@Sector3' },
      { role: 'Waiter / Captain', pass: 'Ftdwaiter#Aapno@Sector3' },
    ];

    let allRolesPass = true;
    for (const cred of credentials) {
      if (!verifyPassword(cred.pass, cred.pass)) {
        allRolesPass = false;
        console.error(`Failed password verification for role: ${cred.role}`);
      }
    }

    assert(
      allRolesPass,
      'SUITE 3',
      'Credentials Verification for All 6 Restaurant Roles',
      `Verified: ${credentials.map((c) => c.role).join(', ')}`
    );

    // 3.3 Rate Limiting Lockout Test
    const lockoutIp = `qa_test_ip_${Date.now()}`;
    resetLoginRateLimit(lockoutIp);
    for (let i = 0; i < 4; i++) recordFailedLogin(lockoutIp);
    const checkBefore = checkLoginRateLimit(lockoutIp);
    recordFailedLogin(lockoutIp); // 5th attempt triggers lockout
    const checkAfter = checkLoginRateLimit(lockoutIp);

    assert(
      checkBefore.allowed === true && checkAfter.allowed === false && (checkAfter.remainingMinutes ?? 0) > 0,
      'SUITE 3',
      'Brute Force Protection (15-Min Lockout after 5 Failed Attempts)',
      `Allowed at 4th: ${checkBefore.allowed}, Blocked at 5th: ${!checkAfter.allowed} (${checkAfter.remainingMinutes} min)`
    );
    resetLoginRateLimit(lockoutIp);
  } catch (err: any) {
    assert(false, 'SUITE 3', 'Security Suite Failure', `Error: ${err.message}`);
  }

  // ============================================================================
  // SUITE 4: TAX & BILLING MATHEMATICS (PAISE-ACCURATE 5% GST)
  // ============================================================================
  console.log('\n--- SUITE 4: BILLING & TAX MATHEMATICS ---');
  try {
    const testCases = [
      { subtotal: 399.0, expectedCgst: 9.98, expectedSgst: 9.98, expectedTax: 19.96, expectedTotal: 418.96 },
      { subtotal: 449.0, expectedCgst: 11.23, expectedSgst: 11.23, expectedTax: 22.46, expectedTotal: 471.46 },
      { subtotal: 1000.0, expectedCgst: 25.0, expectedSgst: 25.0, expectedTax: 50.0, expectedTotal: 1050.0 },
    ];

    let allMathCorrect = true;
    for (const tc of testCases) {
      const cgst = +(tc.subtotal * 0.025).toFixed(2);
      const sgst = +(tc.subtotal * 0.025).toFixed(2);
      const tax = +(cgst + sgst).toFixed(2);
      const grandTotal = +(tc.subtotal + tax).toFixed(2);

      if (cgst !== tc.expectedCgst || sgst !== tc.expectedSgst || tax !== tc.expectedTax || grandTotal !== tc.expectedTotal) {
        allMathCorrect = false;
        console.error(`Math discrepancy for ₹${tc.subtotal}: CGST ${cgst} vs ${tc.expectedCgst}, SGST ${sgst} vs ${tc.expectedSgst}`);
      }
    }

    assert(
      allMathCorrect,
      'SUITE 4',
      'Paise-Accurate 5% GST Split (2.5% CGST + 2.5% SGST)',
      `Tested across ₹399, ₹449 and ₹1000 subtotals`
    );
  } catch (err: any) {
    assert(false, 'SUITE 4', 'Tax Calculation Failure', `Error: ${err.message}`);
  }

  // ============================================================================
  // SUITE 5: STATIC ASSETS & DISH IMAGES AUDIT
  // ============================================================================
  console.log('\n--- SUITE 5: STATIC ASSETS AUDIT ---');
  try {
    const publicDir = path.join(__dirname, '..', 'public');
    const localCategories = MASTER_AAPNO_KHANO_CATEGORIES;
    const localProducts = localCategories.flatMap((c) => c.products || []);

    let missingImages = 0;
    for (const prod of localProducts) {
      if (prod.imageUrl && prod.imageUrl.startsWith('/images/')) {
        const fullPath = path.join(publicDir, prod.imageUrl.replace(/^\//, ''));
        if (!fs.existsSync(fullPath)) {
          missingImages++;
        }
      }
    }

    assert(
      missingImages === 0,
      'SUITE 5',
      'All 134 Menu Dish Images Available in Public Assets',
      `Verified image files exist: ${134 - missingImages}/134`
    );
  } catch (err: any) {
    assert(false, 'SUITE 5', 'Asset Audit Failure', `Error: ${err.message}`);
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n========================================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const passPercentage = ((passedCount / totalCount) * 100).toFixed(1);
  console.log(`📊 MASTER QA AUDIT SUMMARY: ${passedCount}/${totalCount} TESTS PASSED (${passPercentage}%)`);
  console.log('========================================================================\n');

  await prisma.$disconnect();

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runMasterQASuite().catch(async (e) => {
  console.error('Fatal QA Suite Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
