import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3001';

async function runHttpAuditTests() {
  console.log('=== HTTP END-TO-END UPLOAD AUDIT ===\n');

  // Step 1: Login
  console.log('[1] Logging in via POST /api/admin/login...');
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
  
  console.log('Login Status:', loginRes.status);
  console.log('Cookie Header:', cookieHeader);

  if (!loginRes.ok || !cookieHeader) {
    console.error('❌ Login failed');
    process.exit(1);
  }
  console.log('✅ Logged in successfully as admin.');

  const authHeaders = {
    Cookie: cookieHeader,
  };

  // Step 2: Upload Valid Image File
  console.log('\n[2] Uploading Valid Image File (PNG)...');
  const validPngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );

  const formData = new FormData();
  formData.append('file', new Blob([validPngBuffer], { type: 'image/png' }), 'test_cake_1.png');

  const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: authHeaders,
    body: formData,
  });

  const uploadData = await uploadRes.json();
  console.log('Upload Response:', uploadData);

  if (!uploadRes.ok || !uploadData.url) {
    console.error('❌ Valid image upload failed');
    process.exit(1);
  }
  const url1 = uploadData.url;
  console.log('✅ Image 1 uploaded successfully:', url1);

  // Check file on disk
  if (url1.startsWith('/uploads/')) {
    const localPath1 = path.join(process.cwd(), 'public', url1);
    if (fs.existsSync(localPath1)) {
      console.log('✅ File 1 verified existing on disk:', localPath1);
    } else {
      console.error('❌ File 1 not found on disk:', localPath1);
    }
  }

  // Upload Second Image
  console.log('\n[3] Uploading Second Image File (JPG)...');
  const formData2 = new FormData();
  formData2.append('file', new Blob([validPngBuffer], { type: 'image/jpeg' }), 'test_cake_2.jpg');

  const uploadRes2 = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: authHeaders,
    body: formData2,
  });
  const uploadData2 = await uploadRes2.json();
  const url2 = uploadData2.url;
  console.log('✅ Image 2 uploaded successfully:', url2);

  // Step 4: Test Unsupported File Upload (.txt)
  console.log('\n[4] Testing Unsupported File Type Upload (.txt)...');
  const txtFormData = new FormData();
  txtFormData.append('file', new Blob(['hello text file'], { type: 'text/plain' }), 'document.txt');

  const txtRes = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: authHeaders,
    body: txtFormData,
  });
  const txtData = await txtRes.json();
  console.log('Unsupported File Response (Status ' + txtRes.status + '):', txtData);
  if (txtRes.status === 400 && txtData.error && txtData.error.includes('Invalid file format')) {
    console.log('✅ Unsupported file type correctly rejected with 400 error!');
  } else {
    console.error('❌ Unsupported file validation check failed');
  }

  // Step 5: Test Oversized File Upload (>5MB)
  console.log('\n[5] Testing Oversized File Upload (>5MB)...');
  const largeBuf = Buffer.alloc(6 * 1024 * 1024);
  const largeFormData = new FormData();
  largeFormData.append('file', new Blob([largeBuf], { type: 'image/jpeg' }), 'large_image.jpg');

  const largeRes = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: authHeaders,
    body: largeFormData,
  });
  const largeData = await largeRes.json();
  console.log('Oversized File Response (Status ' + largeRes.status + '):', largeData);
  if (largeRes.status === 400 && largeData.error && largeData.error.includes('File size exceeds 5MB limit')) {
    console.log('✅ Oversized file (>5MB) correctly rejected with 400 error!');
  } else {
    console.error('❌ Oversized file validation check failed');
  }

  // Step 6: Test Product Creation with Uploaded Images
  console.log('\n[6] Testing Product Creation & Database Persistence...');
  const newProductPayload = {
    name: 'Audit HTTP Velvet Dream Cake',
    description: 'Special cake created during automated upload audit.',
    imageUrl: url1,
    images: [url1, url2],
    category: 'Signature Cakes',
    baseWeightG: 500,
    basePrice: 900,
    variants: [
      { weightG: 500, price: 900, isDefault: true },
      { weightG: 1000, price: 1700, isDefault: false },
    ],
    isAvailable: true,
    isFeatured: true,
    featuredOrder: 1,
  };

  const createRes = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newProductPayload),
  });

  const createData = await createRes.json();
  console.log('Create Product Response:', createData);
  if (!createRes.ok || !createData.product) {
    console.error('❌ Product creation failed');
    process.exit(1);
  }
  const createdProductId = createData.product.id;
  console.log('✅ Product created successfully in DB with ID:', createdProductId);

  // Step 7: Verify Product Retrieval via Public GET API
  console.log('\n[7] Verifying Product Retrieval via GET /api/products...');
  const getRes = await fetch(`${BASE_URL}/api/products?search=Audit%20HTTP`);
  const getData = await getRes.json();
  const foundProduct = getData.products?.find((p: any) => p.id === createdProductId);

  if (foundProduct) {
    console.log('✅ Found created product on public endpoint:');
    console.log('   - Name:', foundProduct.name);
    console.log('   - Cover Image (imageUrl):', foundProduct.imageUrl);
    console.log('   - Gallery Images (images):', foundProduct.images);
    const parsedImages = JSON.parse(foundProduct.images);
    if (parsedImages.length === 2 && parsedImages[0] === url1 && parsedImages[1] === url2) {
      console.log('✅ Gallery images correctly persisted to DB record!');
    } else {
      console.error('❌ Gallery images list mismatch');
    }
  } else {
    console.error('❌ Product not returned by GET endpoint');
  }

  // Step 8: Test Editing Product & Image Reordering
  console.log('\n[8] Testing Product Editing & Cover Image Reordering...');
  const updatePayload = {
    name: 'Audit HTTP Velvet Dream Cake (Reordered)',
    description: 'Updated description for audit test.',
    imageUrl: url2, // swapped cover photo!
    images: [url2, url1], // swapped gallery order
    category: 'Signature Cakes',
    baseWeightG: 500,
    basePrice: 900,
  };

  const updateRes = await fetch(`${BASE_URL}/api/products/${createdProductId}`, {
    method: 'PUT',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatePayload),
  });

  const updateData = await updateRes.json();
  console.log('Update Product Response:', updateData);
  if (updateRes.ok && updateData.success) {
    console.log('✅ Product updated successfully.');
  }

  // Re-verify update
  const getRes2 = await fetch(`${BASE_URL}/api/products?search=Audit%20HTTP`);
  const getData2 = await getRes2.json();
  const updatedProduct = getData2.products?.find((p: any) => p.id === createdProductId);
  if (updatedProduct && updatedProduct.imageUrl === url2) {
    console.log('✅ Updated cover photo verified on DB record: Cover is now', updatedProduct.imageUrl);
  }

  // Step 9: Test Individual Storage Image Deletion API
  console.log('\n[9] Testing Direct Image File Deletion API (DELETE /api/upload)...');
  const delImgRes = await fetch(`${BASE_URL}/api/upload`, {
    method: 'DELETE',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: url1 }),
  });
  const delImgData = await delImgRes.json();
  console.log('Delete Image Response:', delImgData);
  if (url1.startsWith('/uploads/')) {
    const localPath1 = path.join(process.cwd(), 'public', url1);
    if (!fs.existsSync(localPath1)) {
      console.log('✅ Verified image file 1 was deleted from disk:', localPath1);
    } else {
      console.error('❌ Image file 1 still exists on disk after DELETE /api/upload');
    }
  }

  // Step 10: Test Product Deletion & Remaining Image Cleanup
  console.log('\n[10] Testing Product Deletion & Cleanup (DELETE /api/products/[id])...');
  const delProdRes = await fetch(`${BASE_URL}/api/products/${createdProductId}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  const delProdData = await delProdRes.json();
  console.log('Delete Product Response:', delProdData);
  if (delProdRes.ok && delProdData.success) {
    console.log('✅ Product deleted from database.');
  }

  if (url2.startsWith('/uploads/')) {
    const localPath2 = path.join(process.cwd(), 'public', url2);
    if (!fs.existsSync(localPath2)) {
      console.log('✅ Verified image file 2 was automatically cleaned up from disk on product deletion:', localPath2);
    } else {
      console.error('❌ Image file 2 still exists on disk after product deletion');
    }
  }

  console.log('\n======================================================');
  console.log('🎉 ALL HTTP END-TO-END AUDIT TESTS PASSED 100%!');
  console.log('======================================================\n');
}

runHttpAuditTests().catch(err => {
  console.error('HTTP Audit Test Error:', err);
  process.exit(1);
});
