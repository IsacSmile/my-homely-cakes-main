import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
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
    const excludeFeatured = searchParams.get('excludeFeatured') === 'true';

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

    const isProductFeatured = (p: any): boolean => {
      if (!p) return false;
      const val = p.isFeatured;
      return val === true || val === 1 || val === '1' || val === 'true';
    };

    const isProductAvailable = (p: any): boolean => {
      if (!p) return false;
      const val = p.isAvailable;
      return val === true || val === 1 || val === '1' || val === 'true' || val === undefined;
    };

    if (featured) {
      allProducts = allProducts.filter((p: any) => isProductAvailable(p) && isProductFeatured(p));
      allProducts.sort((a: any, b: any) => (a.featuredOrder || 0) - (b.featuredOrder || 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      allProducts = allProducts.filter((p: any) => isProductAvailable(p));
      if (excludeFeatured) {
        allProducts = allProducts.filter((p: any) => !isProductFeatured(p));
      }
      allProducts.sort((a: any, b: any) => {
        const orderA = Number(a.displayPosition || a.homeSectionOrder || 0);
        const orderB = Number(b.displayPosition || b.homeSectionOrder || 0);
        if (orderA > 0 && orderB > 0) {
          if (orderA !== orderB) return orderA - orderB;
        } else if (orderA > 0) {
          return -1;
        } else if (orderB > 0) {
          return 1;
        }
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
    const { name, description, imageUrl, images, category, baseWeightG, basePrice, variants, isAvailable, isFeatured, featuredOrder, homeSectionOrder, displayPosition, discountPercentage, promoBadge } = body;

    if (!name || !description || (!imageUrl && (!images || images.length === 0)) || !category || !basePrice) {
      return NextResponse.json({ error: 'Missing required product fields (Name, Description, Image, Category, Base Price)' }, { status: 400 });
    }

    const galleryImages = Array.isArray(images) && images.length > 0 ? images : [imageUrl];
    const mainImageUrl = imageUrl || galleryImages[0];

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
    const id = 'cake_' + Date.now();
    const posVal = Number(displayPosition !== undefined ? displayPosition : (homeSectionOrder || 0)) || 0;

    if (posVal > 0) {
      const allProds = await db.select().from(products);
      for (const p of allProds) {
        const pPos = Number(p.displayPosition || p.homeSectionOrder || 0);
        if (pPos >= posVal) {
          await db.update(products)
            .set({ displayPosition: pPos + 1, homeSectionOrder: pPos + 1 })
            .where(eq(products.id, p.id))
            .run();
        }
      }
    }

    const parsedDiscount = discountPercentage !== undefined && discountPercentage !== null && discountPercentage !== '' ? parseInt(discountPercentage, 10) : null;
    const cleanPromoBadge = promoBadge && typeof promoBadge === 'string' && promoBadge.trim() ? promoBadge.trim() : null;

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
      featuredOrder: isFeatured ? (Number(featuredOrder) || Date.now()) : 0,
      homeSectionOrder: posVal,
      displayPosition: posVal,
      discountPercentage: parsedDiscount !== null && !isNaN(parsedDiscount) ? parsedDiscount : null,
      promoBadge: cleanPromoBadge,
      orderCount: 0,
      createdAt: new Date().toISOString(),
    };

    await db.insert(products).values(newProduct).run();

    revalidatePath('/shop');
    revalidatePath('/');

    const allProducts = await db.select().from(products);

    return NextResponse.json({ success: true, product: newProduct, allProducts });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
