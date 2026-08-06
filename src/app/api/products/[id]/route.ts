import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const admin = getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { name, description, imageUrl, category, baseWeightG, basePrice, variants, isAvailable } = body;

    const prod = db.select().from(products).where(eq(products.id, params.id)).get();
    if (!prod) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    db.update(products)
      .set({
        name: name ? name.trim() : prod.name,
        description: description ? description.trim() : prod.description,
        imageUrl: imageUrl ? imageUrl.trim() : prod.imageUrl,
        category: category ? category.trim() : prod.category,
        baseWeightG: baseWeightG ? parseInt(baseWeightG, 10) : prod.baseWeightG,
        basePrice: basePrice ? parseInt(basePrice, 10) : prod.basePrice,
        variants: variants ? (typeof variants === 'string' ? variants : JSON.stringify(variants)) : prod.variants,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : prod.isAvailable,
      })
      .where(eq(products.id, params.id))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const admin = getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    db.delete(products).where(eq(products.id, params.id)).run();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
