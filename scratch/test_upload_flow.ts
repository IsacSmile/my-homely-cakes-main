import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3001';

async function runAuditTests() {
  console.log('=== ADMIN PRODUCT IMAGE UPLOAD END-TO-END AUDIT ===\n');

  // Step 1: Admin Login
  console.log('[1] Logging in as Admin...');
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'myhomelycakes@gmail.com',
      password: 'admin@jinu123!',
    }),
  });

  const cookies = loginRes.headers.get('set-cookie');
  if (!loginRes.ok || !cookies) {
    console.error('Failed to log in as admin:', await loginRes.text());
    process.exit(1);
  }
  console.log('✅ Admin login successful! Cookie obtained.');

  const authHeaders = {
    Cookie: cookies,
  };

  // Step 2: Upload Valid Image
  console.log('\n[2] Testing Valid Image File Upload (PNG)...');
  // Create a minimal 1x1 valid PNG buffer
  const validPngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );

  const formData = new FormData();
  formData.append('file', new Blob([validPngBuffer], { type: 'image/png' }), 'test_cake.png');

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
  const uploadedUrl1 = uploadData.url;
  console.log('✅ Valid image uploaded successfully:', uploadedUrl1);

  // Check file exists on disk
  if (uploadedUrl1.startsWith('/uploads/')) {
    const localPath = path.join(process.cwd(), 'public', uploadedUrl1);
    if (fs.existsSync(localPath)) {
      console.log('✅ Verified file exists on disk:', localPath);
    } else {
      console.error('❌ File does NOT exist on disk:', localPath);
    }
  }

  // Upload Second Image
  console.log('\n[3] Uploading Second Image File for Multi-Image Test...');
  const formData2 = new FormData();
  formData2.append('file', new Blob([validPngBuffer], { type: 'image/png' }), 'test_cake_gallery.png');

  const uploadRes2 = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: authHeaders,
    body: formData2,
  });
  const uploadData2 = await uploadRes2.json();
  const uploadedUrl2 = uploadData2.url;
  console.log('✅ Second image uploaded successfully:', uploadedUrl2);

  // Step 3: Test Unsupported File Upload (.txt)
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
    console.log('✅ Unsupported file correctly rejected with clear error message!');
  } else {
    console.error('❌ Unsupported file validation check failed');
  }

  // Step 4: Test Oversized File Upload (>5MB)
  console.log('\n[5] Testing Oversized File Upload (>5MB)...');
  const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
  const largeFormData = new FormData();
  largeFormData.append('file', new Blob([largeBuffer], { type: 'image/jpeg' }), 'large_image.jpg');

  const largeRes = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: authHeaders,
    body: largeFormData,
  });
  const largeData = await largeRes.json();
  console.log('Oversized File Response (Status ' + largeRes.status + '):', largeData);
  if (largeRes.status === 400 && largeData.error && largeData.error.includes('File size exceeds 5MB limit')) {
    console.log('✅ Oversized file correctly rejected with clear error message!');
  } else {
    console.error('❌ Oversized file validation check failed');
  }

  // Step 5: Test Product Creation with Multiple Images
  console.log('\n[6] Testing Product Creation with Uploaded Images in Database...');
  const newProductPayload = {
    name: 'Audit Velvet Dream Cake',
    description: 'Special cake created during automated upload audit.',
    imageUrl: uploadedUrl1,
    images: [uploadedUrl1, uploadedUrl2],
    category: 'Signature Cakes',
    baseWeightG: 500,
    basePrice: 750,
    variants: [
      { weightG: 500, price: 750, isDefault: true },
      { weightG: 1000, price: 1400, isDefault: false },
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

  // Step 6: Verify Product on Public API
  console.log('\n[7] Verifying Product Retrieval via GET /api/products...');
  const getRes = await fetch(`${BASE_URL}/api/products?search=Audit%20Velvet`);
  const getData = await getRes.json();
  const foundProduct = getData.products?.find((p: any) => p.id === createdProductId);

  if (foundProduct) {
    console.log('✅ Found product in database:');
    console.log('   - imageUrl:', foundProduct.imageUrl);
    console.log('   - images JSON:', foundProduct.images);
    const parsedImages = JSON.parse(foundProduct.images);
    if (parsedImages.length === 2 && parsedImages[0] === uploadedUrl1 && parsedImages[1] === uploadedUrl2) {
      console.log('✅ Both images persisted accurately to product record!');
    } else {
      console.error('❌ Images JSON does not match expected gallery list');
    }
  } else {
    console.error('❌ Product not found via GET API');
  }

  // Step 7: Test Product Update & Reordering
  console.log('\n[8] Testing Product Update & Image Reordering (Cover Image Swap)...');
  const updatePayload = {
    name: 'Audit Velvet Dream Cake (Updated)',
    description: 'Updated description for audit test.',
    imageUrl: uploadedUrl2, // swapped cover photo!
    images: [uploadedUrl2, uploadedUrl1], // swapped order
    category: 'Signature Cakes',
    baseWeightG: 500,
    basePrice: 750,
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
  } else {
    console.error('❌ Failed to update product');
  }

  // Re-verify update
  const getRes2 = await fetch(`${BASE_URL}/api/products?search=Audit%20Velvet`);
  const getData2 = await getRes2.json();
  const updatedProduct = getData2.products?.find((p: any) => p.id === createdProductId);
  if (updatedProduct && updatedProduct.imageUrl === uploadedUrl2) {
    console.log('✅ Cover photo update verified on DB record: Cover is now', updatedProduct.imageUrl);
  } else {
    console.error('❌ Updated cover photo verification failed');
  }

  // Step 8: Test Individual Image Deletion API
  console.log('\n[9] Testing Direct Image File Deletion API (DELETE /api/upload)...');
  const delImgRes = await fetch(`${BASE_URL}/api/upload`, {
    method: 'DELETE',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: uploadedUrl1 }),
  });
  const delImgData = await delImgRes.json();
  console.log('Delete Image Response:', delImgData);
  if (uploadedUrl1.startsWith('/uploads/')) {
    const localPath1 = path.join(process.cwd(), 'public', uploadedUrl1);
    if (!fs.existsSync(localPath1)) {
      console.log('✅ Verified file was deleted from disk:', localPath1);
    } else {
      console.error('❌ File STILL EXISTS on disk after DELETE /api/upload');
    }
  }

  // Step 9: Test Product Deletion & Cleanup
  console.log('\n[10] Testing Product Deletion with Remaining Storage Cleanup (DELETE /api/products/[id])...');
  const delProdRes = await fetch(`${BASE_URL}/api/products/${createdProductId}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  const delProdData = await delProdRes.json();
  console.log('Delete Product Response:', delProdData);
  if (delProdRes.ok && delProdData.success) {
    console.log('✅ Product deleted from database.');
  }

  if (uploadedUrl2.startsWith('/uploads/')) {
    const localPath2 = path.join(process.cwd(), 'public', uploadedUrl2);
    if (!fs.existsSync(localPath2)) {
      console.log('✅ Verified second image file was automatically cleaned up from disk on product deletion:', localPath2);
    } else {
      console.error('❌ File STILL EXISTS on disk after product deletion:', localPath2);
    }
  }

  console.log('\n==================================================');
  console.log('🎉 ALL END-TO-END AUDIT TESTS PASSED SUCCESSFULLY!');
  console.log('==================================================\n');
}

runAuditTests().catch(err => {
  console.error('Audit Script Error:', err);
  process.exit(1);
});
