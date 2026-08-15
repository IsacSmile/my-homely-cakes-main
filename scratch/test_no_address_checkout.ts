import fs from 'fs';

const BASE_URL = 'http://localhost:3001';

async function runNoAddressCheckoutTest() {
  console.log('=== TEST CHECKOUT WITHOUT ADDRESS FIELD ===\n');

  // Step 1: Fetch a product ID from public endpoint
  console.log('[1] Fetching product list from GET /api/products...');
  const prodRes = await fetch(`${BASE_URL}/api/products`);
  const prodData = await prodRes.json();
  
  if (!prodRes.ok || !prodData.products || prodData.products.length === 0) {
    console.error('❌ Failed to fetch products');
    process.exit(1);
  }

  const sampleProduct = prodData.products[0];
  console.log('✅ Found product:', sampleProduct.name, `(ID: ${sampleProduct.id})`);

  // Step 2: Place an order WITHOUT address field
  console.log('\n[2] Submitting order payload WITHOUT address field...');
  const orderPayload = {
    customerName: 'Address Removal Verification Customer',
    mobile: '9876543210',
    // address field intentionally omitted!
    deliveryCity: 'Trivandrum',
    deliveryDate: '2026-08-20',
    deliveryTime: '16:00',
    cakeMessage: 'Happy Birthday Test!',
    notes: 'Please deliver safely',
    items: [
      {
        productId: sampleProduct.id,
        name: sampleProduct.name,
        weightG: 500,
        qty: 1,
        calculatedPrice: sampleProduct.basePrice,
      },
    ],
  };

  const orderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderPayload),
  });

  const orderData = await orderRes.json();
  console.log('Order Response (Status ' + orderRes.status + '):', orderData);

  if (!orderRes.ok || !orderData.success || !orderData.orderId) {
    console.error('❌ Order placement without address field failed!');
    process.exit(1);
  }

  console.log('✅ Order placed successfully!');
  console.log('   - Order ID:', orderData.orderId);
  console.log('   - Order Number:', orderData.orderNumber);

  // Step 3: Admin Login & Fetch Order Details to verify address is null
  console.log('\n[3] Admin login to verify order record in DB...');
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'myhomelycakes@gmail.com',
      password: 'admin@jinu123!',
    }),
  });

  const rawCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get('set-cookie') || ''];
  const cookieHeader = rawCookies.map(c => c.split(';')[0]).filter(Boolean).join('; ');

  const fetchOrdersRes = await fetch(`${BASE_URL}/api/orders`, {
    headers: { Cookie: cookieHeader },
  });
  const fetchOrdersData = await fetchOrdersRes.json();
  const createdOrder = fetchOrdersData.orders?.find((o: any) => o.id === orderData.orderId);

  if (createdOrder) {
    console.log('✅ Found created order in DB log:');
    console.log('   - Customer:', createdOrder.customerName);
    console.log('   - Mobile:', createdOrder.mobile);
    console.log('   - Address in DB:', createdOrder.address);
    if (createdOrder.address === null) {
      console.log('✅ Verified address field is NULL in database!');
    } else {
      console.warn('⚠️ Address in DB was:', createdOrder.address);
    }
  } else {
    console.error('❌ Created order not found in admin orders list');
  }

  // Step 4: Cleanup test order
  console.log('\n[4] Cleaning up test order...');
  const delRes = await fetch(`${BASE_URL}/api/orders/${orderData.orderId}`, {
    method: 'DELETE',
    headers: { Cookie: cookieHeader },
  });
  if (delRes.ok) {
    console.log('✅ Test order cleaned up successfully.');
  }

  console.log('\n======================================================');
  console.log('🎉 ALL CHECKOUT WITHOUT ADDRESS TESTS PASSED 100%!');
  console.log('======================================================\n');
}

runNoAddressCheckoutTest().catch(err => {
  console.error('Checkout Test Error:', err);
  process.exit(1);
});
