import { NextResponse } from 'next/server';
import { db } from '@/db';
import { categories, products } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allCategories = (await db.select().from(categories).orderBy(asc(categories.displayOrder)).all()) || [];
    const allProducts = (await db.select().from(products).all()) || [];

    const categoriesWithCount = allCategories.map((cat: any) => {
      const count = allProducts.filter(
        (p: any) => p.category && p.category.trim().toLowerCase() === cat.name.trim().toLowerCase()
      ).length;
      return {
        ...cat,
        productCount: count,
      };
    });

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Case-insensitive duplicate check
    const allCats = (await db.select().from(categories).all()) || [];
    const isDuplicate = allCats.some(
      (c: any) => c.name.toLowerCase() === cleanName.toLowerCase() || c.slug === slug
    );

    if (isDuplicate) {
      return NextResponse.json({ error: `Category "${cleanName}" already exists.` }, { status: 400 });
    }

    const id = 'cat_' + Date.now();
    const displayOrder = allCats.length + 1;

    const newCat = {
      id,
      name: cleanName,
      slug,
      displayOrder,
      createdAt: new Date().toISOString(),
    };

    await db.insert(categories).values(newCat).run();

    revalidatePath('/shop');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      category: { ...newCat, productCount: 0 },
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
