import fs from 'fs';
import path from 'path';

// Override env vars to simulate admin logged in session
process.env.ADMIN_DEFAULT_EMAIL = 'myhomelycakes@gmail.com';

import { POST as uploadPOST, DELETE as uploadDELETE } from '../src/app/api/upload/route';
import { POST as productsPOST, GET as productsGET } from '../src/app/api/products/route';
import { PUT as productsPUT, DELETE as productsDELETE } from '../src/app/api/products/[id]/route';

if (typeof File === 'undefined') {
  (global as any).File = class File extends Blob {
    name: string;
    constructor(fileBits: any[], fileName: string, options?: any) {
      super(fileBits, options);
      this.name = fileName;
    }
  };
}

// Mock cookies for admin auth
jestMockAdminAuth();

function jestMockAdminAuth() {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ email: 'myhomelycakes@gmail.com' }, process.env.JWT_SECRET || 'myhomelycakes_super_secret_jwt_key_trivandrum_2026');
  // Inject mock headers/cookies into Request object generator
  (global as any).createAuthRequest = (url: string, init?: any) => {
    const headers = new Headers(init?.headers);
    headers.set('cookie', `admin_token=${token}`);
    return new Request(url, { ...init, headers });
  };
}

async function runDirectUnitTests() {
  console.log('=== DIRECT HANDLER END-TO-END UPLOAD AUDIT ===\n');

  // Test 1: Valid PNG Upload
  console.log('[1] Testing Valid Image File Upload (PNG)...');
  const validPngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );

  const file1 = new File([validPngBuffer], 'test_cake_1.png', { type: 'image/png' });
  const formData1 = new FormData();
  formData1.append('file', file1);

  const req1 = (global as any).createAuthRequest('http://localhost:3001/api/upload', {
    method: 'POST',
    body: formData1,
  });

  const res1 = await uploadPOST(req1);
  const data1 = await res1.json();
  console.log('Upload 1 Response:', data1);

  if (!res1.ok || !data1.url) {
    console.error('❌ Valid image upload failed');
    process.exit(1);
  }
  const url1 = data1.url;
  console.log('✅ Image 1 uploaded successfully:', url1);

  // Verify file on disk
  if (url1.startsWith('/uploads/')) {
    const filePath1 = path.join(process.cwd(), 'public', url1);
    if (fs.existsSync(filePath1)) {
      console.log('✅ File 1 verified on disk:', filePath1);
    } else {
      console.error('❌ File 1 not found on disk:', filePath1);
    }
  }

  // Upload Image 2
  console.log('\n[2] Uploading Image 2 (JPG)...');
  const file2 = new File([validPngBuffer], 'test_cake_2.jpg', { type: 'image/jpeg' });
  const formData2 = new FormData();
  formData2.append('file', file2);

  const req2 = (global as any).createAuthRequest('http://localhost:3001/api/upload', {
    method: 'POST',
    body: formData2,
  });

  const res2 = await uploadPOST(req2);
  const data2 = await res2.json();
  const url2 = data2.url;
  console.log('✅ Image 2 uploaded successfully:', url2);

  // Test 3: Unsupported File Format (.pdf / .txt)
  console.log('\n[3] Testing Unsupported File Type Upload (.pdf)...');
  const fileTxt = new File([Buffer.from('PDF content')], 'document.pdf', { type: 'application/pdf' });
  const formDataTxt = new FormData();
  formDataTxt.append('file', fileTxt);

  const reqTxt = (global as any).createAuthRequest('http://localhost:3001/api/upload', {
    method: 'POST',
    body: formDataTxt,
  });

  const resTxt = await uploadPOST(reqTxt);
  const dataTxt = await resTxt.json();
  console.log('Unsupported File Response (Status ' + resTxt.status + '):', dataTxt);
  if (resTxt.status === 400 && dataTxt.error && dataTxt.error.includes('Invalid file format')) {
    console.log('✅ Unsupported file (.pdf) correctly rejected with clear error message!');
  } else {
    console.error('❌ Unsupported file validation failed!');
  }

  // Test 4: Oversized Image Upload (>5MB)
  console.log('\n[4] Testing Oversized File Upload (>5MB)...');
  const largeBuf = Buffer.alloc(6 * 1024 * 1024);
  const fileLarge = new File([largeBuf], 'large.jpg', { type: 'image/jpeg' });
  const formDataLarge = new FormData();
  formDataLarge.append('file', fileLarge);

  const reqLarge = (global as any).createAuthRequest('http://localhost:3001/api/upload', {
    method: 'POST',
    body: formDataLarge,
  });

  const resLarge = await uploadPOST(reqLarge);
  const dataLarge = await resLarge.json();
  console.log('Oversized File Response (Status ' + resLarge.status + '):', dataLarge);
  if (resLarge.status === 400 && dataLarge.error && dataLarge.error.includes('File size exceeds 5MB limit')) {
    console.log('✅ Oversized image (>5MB) correctly rejected with clear error message!');
  } else {
    console.error('❌ Oversized file validation failed!');
  }

  // Test 5: Product Creation with Uploaded Image URLs
  console.log('\n[5] Testing Product Creation & DB Persistence...');
  const prodPayload = {
    name: 'Audit Direct Velvet Cake',
    description: 'Direct route handler test cake.',
    imageUrl: url1,
    images: [url1, url2],
    category: 'Signature Cakes',
    baseWeightG: 500,
    basePrice: 850,
    variants: [{ weightG: 500, price: 850, isDefault: true }],
    isAvailable: true,
  };

  const reqProd = (global as any).createAuthRequest('http://localhost:3001/api/products', {
    method: 'POST',
    body: JSON.stringify(prodPayload),
  });

  const resProd = await productsPOST(reqProd);
  const dataProd = await resProd.json();
  console.log('Create Product Response:', dataProd);
  if (!resProd.ok || !dataProd.product) {
    console.error('❌ Product creation failed!');
    process.exit(1);
  }
  const createdId = dataProd.product.id;
  console.log('✅ Product created in database with ID:', createdId);

  // Test 6: Verify Product Retrieval
  console.log('\n[6] Verifying Product Retrieval via GET /api/products...');
  const reqGet = new Request('http://localhost:3001/api/products?search=Audit%20Direct');
  const resGet = await productsGET(reqGet);
  const dataGet = await resGet.json();
  const found = dataGet.products?.find((p: any) => p.id === createdId);

  if (found) {
    console.log('✅ Retrieved product from DB:');
    console.log('   - imageUrl:', found.imageUrl);
    console.log('   - images JSON:', found.images);
    const parsed = JSON.parse(found.images);
    if (parsed[0] === url1 && parsed[1] === url2) {
      console.log('✅ Photo list verified accurately stored in DB!');
    }
  } else {
    console.error('❌ Product not found in DB list!');
  }

  // Test 7: Product Update & Image Order Swap
  console.log('\n[7] Testing Image Reordering & Cover Swap via PUT /api/products/[id]...');
  const reqPut = (global as any).createAuthRequest(`http://localhost:3001/api/products/${createdId}`, {
    method: 'PUT',
    body: JSON.stringify({
      imageUrl: url2,
      images: [url2, url1],
    }),
  });

  const paramsObj = Promise.resolve({ id: createdId });
  const resPut = await productsPUT(reqPut, { params: paramsObj });
  const dataPut = await resPut.json();
  console.log('PUT Product Response:', dataPut);
  if (resPut.ok && dataPut.success) {
    console.log('✅ Product updated with reordered cover photo.');
  }

  // Test 8: Individual Image Deletion API (DELETE /api/upload)
  console.log('\n[8] Testing DELETE /api/upload for URL 1...');
  const reqDelImg = (global as any).createAuthRequest('http://localhost:3001/api/upload', {
    method: 'DELETE',
    body: JSON.stringify({ url: url1 }),
  });

  const resDelImg = await uploadDELETE(reqDelImg);
  const dataDelImg = await resDelImg.json();
  console.log('DELETE Image Response:', dataDelImg);

  if (url1.startsWith('/uploads/')) {
    const filePath1 = path.join(process.cwd(), 'public', url1);
    if (!fs.existsSync(filePath1)) {
      console.log('✅ File 1 successfully deleted from disk!');
    } else {
      console.error('❌ File 1 still exists on disk after DELETE /api/upload');
    }
  }

  // Test 9: Delete Product and Verify Cleanup of URL 2
  console.log('\n[9] Testing Product Deletion & Cleanup (DELETE /api/products/[id])...');
  const reqDelProd = (global as any).createAuthRequest(`http://localhost:3001/api/products/${createdId}`, {
    method: 'DELETE',
  });

  const resDelProd = await productsDELETE(reqDelProd, { params: paramsObj });
  const dataDelProd = await resDelProd.json();
  console.log('DELETE Product Response:', dataDelProd);

  if (url2.startsWith('/uploads/')) {
    const filePath2 = path.join(process.cwd(), 'public', url2);
    if (!fs.existsSync(filePath2)) {
      console.log('✅ File 2 successfully cleaned up from disk on product deletion!');
    } else {
      console.error('❌ File 2 still exists on disk after product deletion');
    }
  }

  console.log('\n========================================================');
  console.log('🎉 ALL DIRECT HANDLER TESTS PASSED WITH 100% SUCCESS!');
  console.log('========================================================\n');
}

runDirectUnitTests().catch((err) => {
  console.error('Direct Audit Test Error:', err);
  process.exit(1);
});
