import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { getAdminFromCookies } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const featured = searchParams.get('featured') === 'true';

    let allProducts = (await db.select().from(products)) || [];

    if (category && category !== 'All') {
      allProducts = allProducts.filter((p: any) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      allProducts = allProducts.filter((p: any) => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (featured) {
      allProducts.sort((a: any, b: any) => b.orderCount - a.orderCount);
    } else {
      allProducts = allProducts.filter((p: any) => Boolean(p.isAvailable));
      allProducts.sort((a: any, b: any) => {
        const numA = parseInt(a.id.replace(/\D/g, '') || '0', 10);
        const numB = parseInt(b.id.replace(/\D/g, '') || '0', 10);
        return numB - numA || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    const totalCount = allProducts.length;
    const paginatedProducts = allProducts.slice(offset, offset + limit);

    return NextResponse.json({
      products: paginatedProducts,
      totalCount,
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { name, description, imageUrl, images, category, baseWeightG, basePrice, variants, isAvailable, isFeatured, featuredOrder } = body;

    if (!name || !description || (!imageUrl && (!images || images.length === 0)) || !category || !basePrice) {
      return NextResponse.json({ error: 'Missing required product fields (Name, Description, Image, Category, Base Price)' }, { status: 400 });
    }

    const galleryImages = Array.isArray(images) && images.length > 0 ? images : [imageUrl];
    const mainImageUrl = imageUrl || galleryImages[0];

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
    const id = 'cake_' + Date.now();

    const newProduct = {
      id,
      name: name.trim(),
      slug,
      description: description.trim(),
      imageUrl: mainImageUrl.trim(),
      images: JSON.stringify(galleryImages),
      category: category.trim(),
      baseWeightG: parseInt(baseWeightG || '500', 10),
      basePrice: parseInt(basePrice, 10),
      variants: typeof variants === 'string' ? variants : JSON.stringify(variants || [500, 1000, 2000]),
      isAvailable: isAvailable !== false,
      isFeatured: Boolean(isFeatured),
      featuredOrder: Number(featuredOrder) || 0,
      orderCount: 0,
      createdAt: new Date().toISOString(),
    };

    await db.insert(products).values(newProduct).run();

    revalidatePath('/shop');
    revalidatePath('/');

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
