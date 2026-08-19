import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function shiftProductPositions(targetProductId: string, newPos: number, oldPos: number) {
  if (newPos === oldPos) return;

  const allProds = await db.select().from(products);

  if (newPos === 0 && oldPos > 0) {
    for (const p of allProds) {
      if (p.id === targetProductId) continue;
      const pos = Number(p.displayPosition || p.homeSectionOrder || 0);
      if (pos > oldPos) {
        const updatedPos = pos - 1;
        await db.update(products)
          .set({ displayPosition: updatedPos, homeSectionOrder: updatedPos })
          .where(eq(products.id, p.id))
          .run();
      }
    }
    return;
  }

  if (newPos > 0) {
    for (const p of allProds) {
      if (p.id === targetProductId) continue;
      const pos = Number(p.displayPosition || p.homeSectionOrder || 0);
      if (pos <= 0) continue;

      if (oldPos > 0) {
        if (newPos < oldPos) {
          if (pos >= newPos && pos < oldPos) {
            const updatedPos = pos + 1;
            await db.update(products)
              .set({ displayPosition: updatedPos, homeSectionOrder: updatedPos })
              .where(eq(products.id, p.id))
              .run();
          }
        } else if (newPos > oldPos) {
          if (pos > oldPos && pos <= newPos) {
            const updatedPos = pos - 1;
            await db.update(products)
              .set({ displayPosition: updatedPos, homeSectionOrder: updatedPos })
              .where(eq(products.id, p.id))
              .run();
          }
        }
      } else {
        if (pos >= newPos) {
          const updatedPos = pos + 1;
          await db.update(products)
            .set({ displayPosition: updatedPos, homeSectionOrder: updatedPos })
            .where(eq(products.id, p.id))
            .run();
        }
      }
    }
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { name, description, imageUrl, images, category, baseWeightG, basePrice, variants, isAvailable, isFeatured, featuredOrder, homeSectionOrder, displayPosition } = body;

    const prod = await db.select().from(products).where(eq(products.id, resolvedParams.id)).get();
    if (!prod) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const galleryImages = Array.isArray(images) && images.length > 0
      ? images
      : (imageUrl ? [imageUrl] : (prod.images ? JSON.parse(prod.images) : [prod.imageUrl]));

    const mainImageUrl = imageUrl || galleryImages[0] || prod.imageUrl;

    const oldPos = Number(prod.displayPosition || prod.homeSectionOrder || 0);
    const posVal = displayPosition !== undefined ? Number(displayPosition) : (homeSectionOrder !== undefined ? Number(homeSectionOrder) : oldPos);

    if (posVal !== oldPos) {
      await shiftProductPositions(resolvedParams.id, posVal, oldPos);
    }

    let fOrder = featuredOrder !== undefined ? Number(featuredOrder) : prod.featuredOrder;
    if (isFeatured !== undefined && Boolean(isFeatured) !== Boolean(prod.isFeatured)) {
      fOrder = isFeatured ? Date.now() : 0;
    }

    await db.update(products)
      .set({
        name: name ? name.trim() : prod.name,
        description: description ? description.trim() : prod.description,
        imageUrl: mainImageUrl,
        images: JSON.stringify(galleryImages),
        category: category ? category.trim() : prod.category,
        baseWeightG: baseWeightG !== undefined ? parseInt(baseWeightG, 10) : prod.baseWeightG,
        basePrice: basePrice !== undefined ? parseInt(basePrice, 10) : prod.basePrice,
        variants: variants ? (typeof variants === 'string' ? variants : JSON.stringify(variants)) : prod.variants,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : prod.isAvailable,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : prod.isFeatured,
        featuredOrder: fOrder,
        homeSectionOrder: posVal,
        displayPosition: posVal,
      })
      .where(eq(products.id, resolvedParams.id))
      .run();

    revalidatePath('/shop');
    revalidatePath('/');

    const updatedProduct = await db.select().from(products).where(eq(products.id, resolvedParams.id)).get();
    const allProducts = await db.select().from(products);

    return NextResponse.json({ success: true, product: updatedProduct, allProducts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resolvedParams = await params;
    const body = await request.json();
    const prod = await db.select().from(products).where(eq(products.id, resolvedParams.id)).get();
    if (!prod) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const updates: Partial<typeof prod> = {};
    if (body.isFeatured !== undefined) {
      const newFeatured = Boolean(body.isFeatured);
      updates.isFeatured = newFeatured;
      updates.featuredOrder = newFeatured ? Date.now() : 0;
    }
    if (body.featuredOrder !== undefined) updates.featuredOrder = Number(body.featuredOrder);
    
    if (body.displayPosition !== undefined || body.homeSectionOrder !== undefined) {
      const oldPos = Number(prod.displayPosition || prod.homeSectionOrder || 0);
      const posVal = body.displayPosition !== undefined ? Number(body.displayPosition) : Number(body.homeSectionOrder);
      if (posVal !== oldPos) {
        await shiftProductPositions(resolvedParams.id, posVal, oldPos);
      }
      updates.displayPosition = posVal;
      updates.homeSectionOrder = posVal;
    }
    if (body.isAvailable !== undefined) updates.isAvailable = Boolean(body.isAvailable);

    await db.update(products)
      .set(updates)
      .where(eq(products.id, resolvedParams.id))
      .run();

    revalidatePath('/shop');
    revalidatePath('/');

    const allProducts = await db.select().from(products);
    return NextResponse.json({ success: true, allProducts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to patch product' }, { status: 500 });
  }
}

import fs from 'fs';
import path from 'path';
import { del } from '@vercel/blob';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resolvedParams = await params;
    const prod = await db.select().from(products).where(eq(products.id, resolvedParams.id)).get();

    if (prod) {
      const urlsToDelete: string[] = [];
      if (prod.imageUrl) urlsToDelete.push(prod.imageUrl);
      if (prod.images) {
        try {
          const parsed = JSON.parse(prod.images);
          if (Array.isArray(parsed)) {
            parsed.forEach(u => { if (typeof u === 'string' && u) urlsToDelete.push(u); });
          }
        } catch {}
      }

      for (const url of new Set(urlsToDelete)) {
        if (url.startsWith('/uploads/')) {
          const filename = path.basename(url);
          const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
          if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch {}
          }
        } else if (process.env.BLOB_READ_WRITE_TOKEN && url.includes('public.blob.vercel-storage.com')) {
          try { await del(url); } catch {}
        }
      }
      const oldPos = Number(prod.displayPosition || prod.homeSectionOrder || 0);
      if (oldPos > 0) {
        await shiftProductPositions(resolvedParams.id, 0, oldPos);
      }
    }

    await db.delete(products).where(eq(products.id, resolvedParams.id)).run();

    revalidatePath('/shop');
    revalidatePath('/');

    const allProducts = await db.select().from(products);
    return NextResponse.json({ success: true, allProducts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

