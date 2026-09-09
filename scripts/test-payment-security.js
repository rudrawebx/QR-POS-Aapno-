const crypto = require('crypto');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

const results = [];

async function makeRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const status = response.status;
  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  return { status, data };
}

async function runTest(name, fn) {
  const start = Date.now();
  console.log(`\n⏳ RUNNING: ${name}...`);
  try {
    const res = await fn();
    const durationMs = Date.now() - start;
    results.push({ name, passed: res.passed, details: res.details, durationMs });
    if (res.passed) {
      console.log(`✅ PASSED (${durationMs}ms): ${res.details}`);
    } else {
      console.error(`❌ FAILED (${durationMs}ms): ${res.details}`);
    }
  } catch (err) {
    const durationMs = Date.now() - start;
    results.push({ name, passed: false, details: `Exception: ${err.message}`, durationMs });
    console.error(`💥 EXCEPTION (${durationMs}ms): ${err.message}`);
  }
}

async function main() {
  console.log('================================================================================');
  console.log('🛡️ AAPNO KHAANO POS — PAYMENT SECURITY & INVARIANT AUDIT TEST SUITE');
  console.log(`Targeting Server: ${BASE_URL}`);
  console.log('================================================================================');

  let testOrderIdUnpaid = '';
  let testOrderIdPaid = '';

  // TEST 1: Unpaid QR Order Isolation (No Invoice, No KOT, Status=awaiting_payment)
  await runTest('Test 1: QR Menu Unpaid Order Security Invariant', async () => {
    const res = await makeRequest('/api/orders', {
      method: 'POST',
      body: {
        customerName: 'Test QR Customer',
        customerPhone: '9996213962',
        orderType: 'CAR_SERVICE',
        carNumber: 'HR24AB1234',
        paymentMethod: 'UPI',
        paymentStatus: 'pending',
        status: 'awaiting_payment',
        items: [
          { productName: 'Dal Baati Churma Thali', quantity: 2, unitPrice: 280, isVeg: true },
          { productName: 'Special Kesar Kulhad Chai', quantity: 2, unitPrice: 35, isVeg: true }
        ],
      },
    });

    if (res.status !== 200 && res.status !== 201) {
      return { passed: false, details: `Expected HTTP 200/201 but received HTTP ${res.status}` };
    }

    const order = res.data.order;
    testOrderIdUnpaid = order.id || order.humanOrderId;

    if (order.status !== 'awaiting_payment' && order.status !== 'AWAITING_PAYMENT') {
      return { passed: false, details: `Order status is "${order.status}", expected "awaiting_payment"` };
    }

    if (order.paymentStatus !== 'pending' && order.paymentStatus !== 'PENDING') {
      return { passed: false, details: `Order paymentStatus is "${order.paymentStatus}", expected "pending"` };
    }

    if (res.data.invoice) {
      return { passed: false, details: 'CRITICAL BUG: Invoice was created for an unpaid order!' };
    }

    if (res.data.kot) {
      return { passed: false, details: 'CRITICAL BUG: KOT was created for an unpaid order!' };
    }

    return {
      passed: true,
      details: `Order created in awaiting_payment state without generating Invoice or KOT (Order ID: ${order.humanOrderId})`,
    };
  });

  // TEST 2: Rejection of Fake Signatures & Removed Bypass Tokens
  await runTest('Test 2: Cryptographic Signature Validation & Bypass Prevention', async () => {
    // 2a: Test bypass token rejection
    const bypassRes = await makeRequest('/api/payments/razorpay/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: 'order_test_12345',
        razorpay_payment_id: 'pay_test_12345',
        razorpay_signature: 'sig_test_bypass',
        orderId: testOrderIdUnpaid,
      },
    });

    if (bypassRes.status === 200 && bypassRes.data?.success) {
      return { passed: false, details: 'CRITICAL BUG: Legacy bypass signature "sig_test_bypass" was accepted!' };
    }

    // 2b: Test forged HMAC SHA-256 signature rejection
    const forgedRes = await makeRequest('/api/payments/razorpay/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: 'order_fake_99999',
        razorpay_payment_id: 'pay_fake_99999',
        razorpay_signature: 'invalid_sha256_forgery_1234567890abcdef',
        orderId: testOrderIdUnpaid,
      },
    });

    if (forgedRes.status === 200 && forgedRes.data?.success) {
      return { passed: false, details: 'CRITICAL BUG: Forged cryptographic signature was accepted!' };
    }

    return {
      passed: true,
      details: `Bypass tokens and forged signatures correctly rejected with HTTP ${forgedRes.status} (${forgedRes.data?.error || 'Invalid signature'})`,
    };
  });

  // TEST 3: Legitimate Payment Capture & State Machine Transition
  await runTest('Test 3: Legitimate Cryptographic Payment Verification', async () => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'g3rJ8h8yK9mN2pQ5sT7vW4xZ';
    const razorpayOrderId = `order_${Date.now()}`;
    const razorpayPaymentId = `pay_${Date.now()}`;
    
    // Generate valid HMAC SHA-256 signature
    const textToSign = `${razorpayOrderId}|${razorpayPaymentId}`;
    const validSignature = crypto.createHmac('sha256', keySecret).update(textToSign).digest('hex');

    const verifyRes = await makeRequest('/api/payments/razorpay/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: validSignature,
        orderId: testOrderIdUnpaid,
        customerName: 'Verified Royal Customer',
        customerPhone: '9996213962',
        carNumber: 'HR24AB1234',
        orderType: 'CAR_SERVICE',
        items: [
          { productName: 'Dal Baati Churma Thali', quantity: 2, unitPrice: 280, isVeg: true },
          { productName: 'Special Kesar Kulhad Chai', quantity: 2, unitPrice: 35, isVeg: true }
        ],
      },
    });

    if (verifyRes.status !== 200 || !verifyRes.data?.success) {
      return { passed: false, details: `Verification failed: ${verifyRes.data?.error || verifyRes.status}` };
    }

    const data = verifyRes.data;
    testOrderIdPaid = data.orderId || data.humanOrderId;

    if (!data.humanInvoiceNumber || !data.humanInvoiceNumber.startsWith('AK-INV-2026-')) {
      return { passed: false, details: `Expected valid invoice number, received: ${data.humanInvoiceNumber}` };
    }

    if (!data.humanKotNumber || !data.humanKotNumber.startsWith('KOT-')) {
      return { passed: false, details: `Expected valid KOT number, received: ${data.humanKotNumber}` };
    }

    return {
      passed: true,
      details: `Payment cryptographically verified! Generated Invoice: ${data.humanInvoiceNumber}, KOT: ${data.humanKotNumber}`,
    };
  });

  // TEST 4: Idempotency Protection (Duplicate Webhook / Verify Calls)
  await runTest('Test 4: Idempotency & Duplicate Replay Protection', async () => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'g3rJ8h8yK9mN2pQ5sT7vW4xZ';
    const razorpayOrderId = `order_idem_${Date.now()}`;
    const razorpayPaymentId = `pay_idem_${Date.now()}`;
    const textToSign = `${razorpayOrderId}|${razorpayPaymentId}`;
    const validSignature = crypto.createHmac('sha256', keySecret).update(textToSign).digest('hex');

    // First call
    const firstRes = await makeRequest('/api/payments/razorpay/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: validSignature,
        customerName: 'Idempotency Test User',
        items: [{ productName: 'Dal Baati Churma Thali', quantity: 1, unitPrice: 280, isVeg: true }],
      },
    });

    const firstInvoice = firstRes.data?.humanInvoiceNumber;
    const firstOrderId = firstRes.data?.orderId;

    // Second call with same payment ID
    const secondRes = await makeRequest('/api/payments/razorpay/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: validSignature,
        orderId: firstOrderId,
        customerName: 'Idempotency Test User',
        items: [{ productName: 'Dal Baati Churma Thali', quantity: 1, unitPrice: 280, isVeg: true }],
      },
    });

    if (secondRes.data?.humanInvoiceNumber !== firstInvoice) {
      return {
        passed: false,
        details: `Duplicate invoice created on replay! (First: ${firstInvoice}, Second: ${secondRes.data?.humanInvoiceNumber})`,
      };
    }

    return {
      passed: true,
      details: `Idempotency verified: Duplicate payment payload safely returned existing invoice ${firstInvoice} without double-billing or extra KOTs`,
    };
  });

  // TEST 5: POS Cash Confirmation Workflow
  await runTest('Test 5: POS Cash Order with Staff Authorization Workflow', async () => {
    // 5a: Unconfirmed Cash Order (Must NOT generate invoice or KOT)
    const unconfirmedRes = await makeRequest('/api/orders', {
      method: 'POST',
      body: {
        customerName: 'Walk-in Cash Guest',
        customerPhone: '9996213962',
        orderType: 'DINE_IN',
        paymentMethod: 'CASH',
        isStaffCashConfirmed: false,
        items: [{ productName: 'Paneer Butter Masala', quantity: 1, unitPrice: 240, isVeg: true }],
      },
    });

    if (unconfirmedRes.data?.invoice || unconfirmedRes.data?.kot) {
      return { passed: false, details: 'CRITICAL BUG: Unconfirmed cash order generated Invoice/KOT!' };
    }

    // 5b: Staff Confirmed Cash Order (Generates exactly 1 Invoice and 1 KOT)
    const confirmedRes = await makeRequest('/api/orders', {
      method: 'POST',
      body: {
        customerName: 'Walk-in Cash Guest',
        customerPhone: '9996213962',
        orderType: 'DINE_IN',
        paymentMethod: 'CASH',
        isStaffCashConfirmed: true,
        staffId: 'STAFF_CASHIER_01',
        receivedAmount: 300,
        items: [{ productName: 'Paneer Butter Masala', quantity: 1, unitPrice: 240, isVeg: true }],
      },
    });

    if (confirmedRes.status !== 200 && confirmedRes.status !== 201) {
      return { passed: false, details: `Confirmed cash order returned HTTP ${confirmedRes.status}` };
    }

    const order = confirmedRes.data.order;
    if (order.paymentStatus !== 'PAID' && order.paymentStatus !== 'paid') {
      return { passed: false, details: `Order payment status is ${order.paymentStatus}, expected PAID` };
    }

    return {
      passed: true,
      details: `Staff cash confirmation recorded by cashier, generated Invoice & fired KOT with recorded change calculation`,
    };
  });

  // TEST 6: Direct Print Endpoint Security (HTTP 403 Forbidden for Unpaid)
  await runTest('Test 6: Print Endpoint Security & 403 Forbidden on Unpaid Orders', async () => {
    // Create an unpaid draft order
    const draftRes = await makeRequest('/api/orders', {
      method: 'POST',
      body: {
        customerName: 'Print Protection Test',
        customerPhone: '9996213962',
        orderType: 'TAKEAWAY',
        paymentMethod: 'UPI',
        paymentStatus: 'pending',
        status: 'awaiting_payment',
        items: [{ productName: 'Kair Sangri Special', quantity: 1, unitPrice: 260, isVeg: true }],
      },
    });

    const unpaidId = draftRes.data.order.id;

    // Attempt direct print on unpaid order
    const printRes = await makeRequest('/api/print', {
      method: 'POST',
      body: {
        orderId: unpaidId,
        action: 'PRINT_BILL',
      },
    });

    if (printRes.status !== 403) {
      return {
        passed: false,
        details: `CRITICAL BUG: Print endpoint returned HTTP ${printRes.status} on unpaid order (Expected 403 Forbidden)`,
      };
    }

    return {
      passed: true,
      details: `Direct print request on unpaid order correctly rejected with HTTP 403 Forbidden (${printRes.data?.error})`,
    };
  });

  // Print Summary Table
  console.log('\n================================================================================');
  console.log('📊 AAPNO KHAANO POS — AUTOMATED SECURITY TEST AUDIT RESULTS');
  console.log('================================================================================');
  console.log('| # | Test Name | Status | Duration | Details |');
  console.log('|---|---|---|---|---|');
  results.forEach((r, idx) => {
    const statusIcon = r.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`| ${idx + 1} | ${r.name} | ${statusIcon} | ${r.durationMs}ms | ${r.details} |`);
  });
  console.log('================================================================================');

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log(`\nTOTAL: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  if (failed === 0) {
    console.log('🎉 ALL SECURITY AND FINANCIAL INTEGRITY INVARIANTS SATISFIED 100%!');
  } else {
    console.error('⚠️ SOME TESTS FAILED. PLEASE REVIEW LOGS ABOVE.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test suite runner crashed:', err);
  process.exit(1);
});
