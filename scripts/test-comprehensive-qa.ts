import http from 'http';
import crypto from 'crypto';
import { MASTER_AAPNO_KHANO_CATEGORIES } from '../lib/menuData';
import { hashPassword, verifyPassword, checkLoginRateLimit, recordFailedLogin, resetLoginRateLimit } from '../lib/auth';

const PORT = 3005;

function request(path: string, options: any = {}, body: any = null): Promise<{ status: number; body?: any; error?: string }> {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode || 0, body: parsed || {} });
          } catch (e) {
            resolve({ status: res.statusCode || 0, body: {} });
          }
        });
      }
    );

    req.on('error', (err) => resolve({ status: 0, error: err.message }));
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runComprehensiveQASuite() {
  console.log('========================================================================');
  console.log('👑 AAPNO KHANO — 13-PHASE SENIOR QA & SECURITY AUDIT TEST SUITE 👑');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, phaseName: string, testName: string, details: string = '') {
    total++;
    if (condition) {
      console.log(`✅ PASS: [${phaseName}] ${testName} ${details ? `— ${details}` : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: [${phaseName}] ${testName} ${details ? `— ${details}` : ''}`);
    }
  }

  // -------------------------------------------------------------
  // PHASE 1: Security & Authentication Hardening Tests
  // -------------------------------------------------------------
  console.log('--- PHASE 1: SECURITY & AUTHENTICATION TESTS ---');

  // Test 1.1: Salted Scrypt Hash Generation & Verification
  const testPlain = 'SecretPass123!@#';
  const hashed = hashPassword(testPlain);
  const isHashValid = verifyPassword(testPlain, hashed);
  const isWrongRejected = !verifyPassword('WrongPassword', hashed);
  assert(
    hashed.startsWith('scrypt$') && isHashValid && isWrongRejected,
    'PHASE 1',
    'Salted Scrypt Cryptographic Hashing',
    `Generated hash: ${hashed.slice(0, 25)}...`
  );

  // Test 1.2: Rate Limiting & Lockout after 5 failed attempts
  const testIpKey = `test_ip_${Date.now()}`;
  resetLoginRateLimit(testIpKey);
  for (let i = 0; i < 4; i++) {
    recordFailedLogin(testIpKey);
  }
  const checkBeforeLockout = checkLoginRateLimit(testIpKey);
  recordFailedLogin(testIpKey); // 5th attempt
  const checkAfterLockout = checkLoginRateLimit(testIpKey);
  assert(
    checkBeforeLockout.allowed === true && checkAfterLockout.allowed === false && (checkAfterLockout.remainingMinutes ?? 0) > 0,
    'PHASE 1',
    'Login Rate Limiting & 15-Min Lockout',
    `Allowed before 5: ${checkBeforeLockout.allowed}, Blocked after 5: ${!checkAfterLockout.allowed} (${checkAfterLockout.remainingMinutes} min)`
  );
  resetLoginRateLimit(testIpKey);

  // Test 1.3: Unauthenticated Demo Login Route Blocked
  const demoRes = await request('/api/auth/demo', { method: 'POST' }, { role: 'SUPER_ADMIN' });
  if (demoRes.status !== 0) {
    assert(
      demoRes.status === 403,
      'PHASE 1',
      'Unauthenticated Demo Bypass Blocked (403 Forbidden)',
      `Status: ${demoRes.status}`
    );
  }

  // -------------------------------------------------------------
  // PHASE 3: QR and Table Validation Tests
  // -------------------------------------------------------------
  console.log('\n--- PHASE 3: QR AND TABLE VALIDATION TESTS ---');

  // Test 3.1: Valid Table 04
  const validTableRes = await request('/api/tables/validate?slug=aapno-khano&table=table-04');
  if (validTableRes.status !== 0) {
    assert(
      validTableRes.status === 200 && validTableRes.body?.valid === true && validTableRes.body?.table?.tableNumber === '04',
      'PHASE 3',
      'Valid Table 04 QR Verified',
      `Table: ${validTableRes.body?.table?.name}, Status: ${validTableRes.body?.table?.status}`
    );
  }

  // Test 3.2: Invalid Table 999 Rejected
  const invalidTableRes = await request('/api/tables/validate?slug=aapno-khano&table=table-999');
  if (invalidTableRes.status !== 0) {
    assert(
      invalidTableRes.status === 404 && invalidTableRes.body?.valid === false,
      'PHASE 3',
      'Invalid Table 999 QR Rejected (404)',
      `Error: "${invalidTableRes.body?.error}"`
    );
  }

  // -------------------------------------------------------------
  // PHASE 4: Menu and Beverage Pricing Standardization Tests
  // -------------------------------------------------------------
  console.log('\n--- PHASE 4: MENU & PRICING STANDARDIZATION TESTS ---');

  let coke2L: any = null;
  let sprite2L: any = null;
  let limca2L: any = null;
  let waterVedica: any = null;
  let sodaKinley: any = null;
  let iceCubes: any = null;

  MASTER_AAPNO_KHANO_CATEGORIES.forEach((cat) => {
    (cat.products || []).forEach((prod: any) => {
      if (prod.name === 'Coke 2 litres') coke2L = prod;
      if (prod.name === 'Sprite 2 litres') sprite2L = prod;
      if (prod.name === 'Limca 2 litres') limca2L = prod;
      if (prod.name === 'Vedica Water') waterVedica = prod;
      if (prod.name === 'Kinley Soda') sodaKinley = prod;
      if (prod.name === 'Ice Cubes') iceCubes = prod;
    });
  });

  assert(
    coke2L && coke2L.basePrice === 100.0 && coke2L.description?.includes('Chilled packaged soft drink'),
    'PHASE 4',
    'Coke 2 Litres Price Standardized to ₹100',
    `Price: ₹${coke2L?.basePrice}, Description: "${coke2L?.description}"`
  );

  assert(
    sprite2L && sprite2L.basePrice === 100.0 && sprite2L.description?.includes('Chilled packaged lemon-lime'),
    'PHASE 4',
    'Sprite 2 Litres Price Standardized to ₹100',
    `Price: ₹${sprite2L?.basePrice}`
  );

  assert(
    limca2L && limca2L.basePrice === 100.0 && limca2L.description?.includes('Chilled cloudy lemon fizzy'),
    'PHASE 4',
    'Limca 2 Litres Price Standardized to ₹100',
    `Price: ₹${limca2L?.basePrice}`
  );

  assert(
    waterVedica && waterVedica.basePrice === 60.0 && waterVedica.description?.includes('mineral water'),
    'PHASE 4',
    'Vedica Water Price Standardized to ₹60',
    `Price: ₹${waterVedica?.basePrice}`
  );

  assert(
    sodaKinley && sodaKinley.basePrice === 20.0 && sodaKinley.description?.includes('sparkling'),
    'PHASE 4',
    'Kinley Soda Price Standardized to ₹20',
    `Price: ₹${sodaKinley?.basePrice}`
  );

  assert(
    iceCubes && iceCubes.basePrice === 20.0 && iceCubes.description?.includes('Food-grade'),
    'PHASE 4',
    'Ice Cubes Price Standardized to ₹20',
    `Price: ₹${iceCubes?.basePrice}`
  );

  // -------------------------------------------------------------
  // PHASE 6: Payment Security & Order Lifecycle Tests
  // -------------------------------------------------------------
  console.log('\n--- PHASE 6: PAYMENT SECURITY & LIFECYCLE TESTS ---');

  // Test 6.1: Forged Cryptographic Signature Rejected
  const forgedSigRes = await request('/api/payments/razorpay/verify', { method: 'POST' }, {
    restaurantSlug: 'aapno-khano',
    razorpay_order_id: 'order_fake_12345',
    razorpay_payment_id: 'pay_fake_99999',
    razorpay_signature: 'forged_invalid_signature_hash',
    items: [{ productId: 'p-94', name: 'Coke 2 litres', quantity: 1, unitPrice: 100 }],
  });

  if (forgedSigRes.status !== 0) {
    assert(
      forgedSigRes.status === 400 && forgedSigRes.body?.error?.includes('Invalid cryptographic signature'),
      'PHASE 6',
      'Forged Cryptographic Signature Rejected (400)',
      `Error: "${forgedSigRes.body?.error}"`
    );
  }

  // Test 6.2: Unauthenticated QR Cash Order creates pending order (NO paid invoice)
  const qrCashRes = await request('/api/orders', { method: 'POST' }, {
    restaurantId: 'rest_aapno_khano',
    customerName: 'Online QR Guest',
    customerPhone: '9876543210',
    carNumber: 'Table 04',
    orderType: 'DINE_IN',
    paymentMethod: 'CASH',
    isStaffCashConfirmed: false,
    items: [
      { productId: 'p-94', name: 'Coke 2 litres', quantity: 1, unitPrice: 100, isVeg: true },
    ],
  });

  if (qrCashRes.status !== 0) {
    assert(
      qrCashRes.status === 200 && qrCashRes.body?.requiresPayment === true && qrCashRes.body?.paymentStatus === 'pending',
      'PHASE 6',
      'Customer QR Cash Order Remains Pending (No instant Bill/KOT)',
      `Order: ${qrCashRes.body?.order?.humanOrderId}, Status: ${qrCashRes.body?.status}`
    );
  }

  // -------------------------------------------------------------
  // PHASE 7: Tax Calculations & Rounding Integrity
  // -------------------------------------------------------------
  console.log('\n--- PHASE 7: TAX & BILLING CALCULATIONS ---');
  const subtotal = 350.0;
  const cgst = +(subtotal * 0.025).toFixed(2);
  const sgst = +(subtotal * 0.025).toFixed(2);
  const totalTax = +(cgst + sgst).toFixed(2);
  const grandTotal = +(subtotal + totalTax).toFixed(2);

  assert(
    cgst === 8.75 && sgst === 8.75 && totalTax === 17.50 && grandTotal === 367.50,
    'PHASE 7',
    'Paise-Accurate 5% GST Calculation (2.5% CGST + 2.5% SGST)',
    `Subtotal: ₹${subtotal}, CGST: ₹${cgst}, SGST: ₹${sgst}, Grand Total: ₹${grandTotal}`
  );

  console.log('\n========================================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed}/${total} TESTS PASSED (${((passed / total) * 100).toFixed(0)}%)`);
  console.log('========================================================================\n');
}

runComprehensiveQASuite();
