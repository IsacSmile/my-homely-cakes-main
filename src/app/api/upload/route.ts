import { NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { getAdminFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // File validation: type and size (max 5MB)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid file format. Please upload JPG, PNG, or WebP images.' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit. Please upload a smaller image.' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const originalExt = path.extname(file.name) || '.jpg';
    const filename = `cake_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${originalExt}`;

    // 1. If Vercel Blob token is configured, upload to Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, fileBuffer, {
        access: 'public',
        contentType: file.type,
      });
      return NextResponse.json({ success: true, url: blob.url });
    }

    // 2. Production Vercel Fallback without Blob Token: Return Base64 Data URL
    if (process.env.VERCEL) {
      const base64Data = fileBuffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64Data}`;
      return NextResponse.json({ success: true, url: dataUrl });
    }

    // 3. Local Development Fallback: save to /public/uploads/ directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, fileBuffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to upload image' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // 1. Local file deletion (/uploads/...)
    if (url.startsWith('/uploads/')) {
      const filename = path.basename(url);
      const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return NextResponse.json({ success: true });
    }

    // 2. Vercel Blob deletion
    if (process.env.BLOB_READ_WRITE_TOKEN && url.includes('public.blob.vercel-storage.com')) {
      await del(url);
      return NextResponse.json({ success: true });
    }

    // External URL or base64 URL - nothing to clean up on disk
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('File deletion error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete image file' }, { status: 500 });
  }
}

