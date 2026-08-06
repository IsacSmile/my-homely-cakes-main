import { NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allCategories = db.select().from(categories).orderBy(asc(categories.displayOrder)).all();
    return NextResponse.json({ categories: allCategories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = 'cat_' + Date.now();

    const existing = db.select().from(categories).where(eq(categories.slug, slug)).get();
    if (existing) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
    }

    const allCats = db.select().from(categories).all();
    const displayOrder = allCats.length + 1;

    const newCat = {
      id,
      name: cleanName,
      slug,
      displayOrder,
      createdAt: new Date().toISOString(),
    };

    db.insert(categories).values(newCat).run();

    return NextResponse.json({ success: true, category: newCat });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
