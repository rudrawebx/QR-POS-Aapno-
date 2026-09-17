const http = require('http');

const PORT = 3001;

function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
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
            resolve({ status: res.statusCode, body: parsed || {} });
          } catch (e) {
            resolve({ status: res.statusCode, body: {}, raw: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('===============================================================');
  console.log('👑 AAPNO KHANO POS — AUTOMATED QA & VERIFICATION SUITE 👑');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`✅ PASS: [${testName}] ${details}`);
      passed++;
    } else {
      console.error(`❌ FAIL: [${testName}] ${details}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: POS Direct UPI Settlement (Staff Confirmed)
    // -------------------------------------------------------------
    const posUpiRes = await request('/api/orders', { method: 'POST' }, {
      restaurantId: 'rest_aapno_khano',
      customerName: 'Walk-in Guest',
      customerPhone: '9996213962',
      carNumber: 'HR03AF5256',
      orderType: 'CAR_SERVICE',
      paymentMethod: 'UPI',
      isStaffCashConfirmed: true,
      items: [
        { productId: 'dish_dal_baati_churma', name: 'Royal Dal Baati Churma Thali', quantity: 2, unitPrice: 350, isVeg: true },
        { productId: 'dish_special_kadhi', name: 'Marwadi Gatta Kadhi', quantity: 1, unitPrice: 180, isVeg: true },
      ],
    });

    assert(
      posUpiRes.status === 200 && posUpiRes.body?.success === true && posUpiRes.body?.order?.paymentStatus === 'PAID',
      'TEST 1: POS Direct UPI Settlement',
      `Order: ${posUpiRes.body?.humanOrderId}, Method: ${posUpiRes.body?.order?.paymentMethod}, Invoice: ${posUpiRes.body?.humanInvoiceNumber}`
    );

    assert(
      posUpiRes.body?.printReceiptData?.restaurant?.name?.includes('Aapno Khaano') &&
      posUpiRes.body?.printReceiptData?.order?.carNumber === 'HR03AF5256',
      'TEST 1.1: Thermal Receipt Data Integrity',
      `Car: ${posUpiRes.body?.printReceiptData?.order?.carNumber}, Total: ₹${posUpiRes.body?.printReceiptData?.order?.grandTotal}`
    );

    // -------------------------------------------------------------
    // TEST 2: POS "Guest without name" (Takeaway Cash Settlement)
    // -------------------------------------------------------------
    const posCashRes = await request('/api/orders', { method: 'POST' }, {
      restaurantId: 'rest_aapno_khano',
      customerName: 'Walk-in Guest',
      customerPhone: '9996213962',
      orderType: 'TAKEAWAY',
      paymentMethod: 'CASH',
      isStaffCashConfirmed: true,
      items: [
        { productId: 'dish_paneer_tikka', name: 'Tandoori Paneer Tikka', quantity: 1, unitPrice: 220, isVeg: true },
      ],
    });

    assert(
      posCashRes.status === 200 && posCashRes.body?.order?.customerName === 'Walk-in Guest' && posCashRes.body?.kot !== null,
      'TEST 2: POS Guest without Name + Takeaway',
      `Guest: ${posCashRes.body?.order?.customerName}, KOT: ${posCashRes.body?.kot?.humanKotNumber}`
    );

    // -------------------------------------------------------------
    // TEST 3: POS Dine-in with Card / EDC Machine Settlement
    // -------------------------------------------------------------
    const posCardRes = await request('/api/orders', { method: 'POST' }, {
      restaurantId: 'rest_aapno_khano',
      customerName: 'Rajesh Sharma',
      customerPhone: '9876543210',
      carNumber: 'Table 4',
      orderType: 'DINE_IN',
      paymentMethod: 'CARD',
      isStaffCashConfirmed: true,
      items: [
        { productId: 'dish_kesar_kheer', name: 'Royal Kesar Badam Kheer', quantity: 2, unitPrice: 120, isVeg: true },
      ],
    });

    assert(
      posCardRes.status === 200 && posCardRes.body?.order?.paymentMethod === 'CARD' && posCardRes.body?.order?.status === 'CONFIRMED',
      'TEST 3: POS Dine-In Card Settlement',
      `Invoice: ${posCardRes.body?.humanInvoiceNumber}, Status: ${posCardRes.body?.order?.status}`
    );

    // -------------------------------------------------------------
    // TEST 4: Public QR Menu Order Security (Strict No Invoice before Payment)
    // -------------------------------------------------------------
    const publicQrRes = await request('/api/orders', { method: 'POST' }, {
      restaurantId: 'rest_aapno_khano',
      customerName: 'Mobile QR Customer',
      customerPhone: '9996213962',
      carNumber: 'RJ14CA1234',
      orderType: 'CAR_SERVICE',
      paymentMethod: 'UPI',
      isStaffCashConfirmed: false, // Public customer from phone
      items: [
        { productId: 'dish_dal_baati_churma', name: 'Royal Dal Baati Churma Thali', quantity: 1, unitPrice: 350, isVeg: true },
      ],
    });

    assert(
      publicQrRes.status === 200 &&
      publicQrRes.body?.status === 'awaiting_payment' &&
      publicQrRes.body?.paymentStatus === 'pending' &&
      !publicQrRes.body?.invoice &&
      !publicQrRes.body?.kot,
      'TEST 4: Public QR Order Security Check',
      `Status: ${publicQrRes.body?.status} (Strictly No Invoice/KOT generated)`
    );

    // -------------------------------------------------------------
    // TEST 5: Customer QR Direct UPI Verification (GPay/PhonePe scan to 9996213962m@pnb)
    // -------------------------------------------------------------
    const qrVerifyRes = await request('/api/payments/razorpay/verify', { method: 'POST' }, {
      restaurantSlug: 'aapno-khano',
      razorpay_order_id: 'upi_direct_' + Date.now(),
      razorpay_payment_id: 'UPI_PNB_' + Date.now(),
      razorpay_signature: 'sig_upi_direct_verified',
      customerName: 'Mobile QR Customer',
      customerPhone: '9996213962',
      carNumber: 'RJ14CA1234',
      orderType: 'CAR_SERVICE',
      paymentMethod: 'UPI_DIRECT',
      items: [
        { productId: 'dish_dal_baati_churma', productName: 'Royal Dal Baati Churma Thali', quantity: 1, unitPrice: 350, isVeg: true },
      ],
    });

    assert(
      qrVerifyRes.status === 200 && qrVerifyRes.body?.success === true && qrVerifyRes.body?.order?.paymentStatus === 'PAID',
      'TEST 5: QR Direct UPI Instant Verification & Bill Generation',
      `Order: ${qrVerifyRes.body?.humanOrderId}, Invoice: ${qrVerifyRes.body?.humanInvoiceNumber}, KOT: ${qrVerifyRes.body?.humanKotNumber}`
    );

    // -------------------------------------------------------------
    // TEST 6: Real-time Live Orders Registry Verification
    // -------------------------------------------------------------
    const liveOrdersRes = await request('/api/orders?range=TODAY');
    const hasLatestOrder = qrVerifyRes.body?.humanOrderId
      ? liveOrdersRes.body?.orders?.some((o) => o.humanOrderId === qrVerifyRes.body.humanOrderId)
      : false;

    assert(
      liveOrdersRes.status === 200 && hasLatestOrder,
      'TEST 6: Real-time Live Orders Registry',
      `Found verified QR order ${qrVerifyRes.body?.humanOrderId} in Live Feed (Total live today: ${liveOrdersRes.body?.orders?.length || 0})`
    );

    console.log('\n===============================================================');
    console.log(`🎯 QA RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
    console.log('===============================================================\n');
  } catch (err) {
    console.error('Fatal test execution error:', err);
  }
}

runTests();
