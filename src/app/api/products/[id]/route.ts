import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { name, description, imageUrl, images, category, baseWeightG, basePrice, variants, isAvailable } = body;

    const prod = await db.select().from(products).where(eq(products.id, resolvedParams.id)).get();
    if (!prod) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const galleryImages = Array.isArray(images) && images.length > 0
      ? images
      : (imageUrl ? [imageUrl] : (prod.images ? JSON.parse(prod.images) : [prod.imageUrl]));

    const mainImageUrl = imageUrl || galleryImages[0] || prod.imageUrl;

    await db.update(products)
      .set({
        name: name ? name.trim() : prod.name,
        description: description ? description.trim() : prod.description,
        imageUrl: mainImageUrl,
        images: JSON.stringify(galleryImages),
        category: category ? category.trim() : prod.category,
        baseWeightG: baseWeightG ? parseInt(baseWeightG, 10) : prod.baseWeightG,
 basePrice: basePrice ? parseInt(basePrice, 10) : prod.basePrice,
        variants: variants ? (typeof variants === 'string' ? variants : JSON.stringify(variants)) : prod.variants,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : prod.isAvailable,
      })
      .where(eq(products.id, resolvedParams.id))
      .run();

    revalidatePath('/shop');
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resolvedParams = await params;
    await db.delete(products).where(eq(products.id, resolvedParams.id)).run();

    revalidatePath('/shop');
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
