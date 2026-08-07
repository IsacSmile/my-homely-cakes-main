import { NextResponse } from 'next/server';
import { db } from '@/db';
import { categories, products } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, displayOrder, action } = body;

    const existingCat = db.select().from(categories).where(eq(categories.id, id)).get();
    if (!existingCat) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Action: Reorder up/down
    if (action === 'reorder') {
      const allCats = db.select().from(categories).orderBy(asc(categories.displayOrder)).all();
      const currentIndex = allCats.findIndex((c: any) => c.id === id);

      if (currentIndex !== -1) {
        let targetIndex = currentIndex;
        if (displayOrder === 'up' && currentIndex > 0) {
          targetIndex = currentIndex - 1;
        } else if (displayOrder === 'down' && currentIndex < allCats.length - 1) {
          targetIndex = currentIndex + 1;
        }

        if (targetIndex !== currentIndex) {
          // Swap display orders
          const tempOrder = allCats[currentIndex].displayOrder;
          allCats[currentIndex].displayOrder = allCats[targetIndex].displayOrder;
          allCats[targetIndex].displayOrder = tempOrder;

          db.update(categories)
            .set({ displayOrder: allCats[currentIndex].displayOrder })
            .where(eq(categories.id, allCats[currentIndex].id))
            .run();

          db.update(categories)
            .set({ displayOrder: allCats[targetIndex].displayOrder })
            .where(eq(categories.id, allCats[targetIndex].id))
            .run();
        }
      }

      return NextResponse.json({ success: true });
    }

    // Action: Edit Name
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name cannot be empty' }, { status: 400 });
    }

    const cleanName = name.trim();
    const newSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check duplicate name on other categories
    const allOtherCats = db.select().from(categories).all().filter((c: any) => c.id !== id);
    const isDuplicate = allOtherCats.some((c: any) => c.name.toLowerCase() === cleanName.toLowerCase());
    if (isDuplicate) {
      return NextResponse.json({ error: `Category "${cleanName}" already exists.` }, { status: 400 });
    }

    const oldName = existingCat.name;

    // Update Category record
    db.update(categories)
      .set({ name: cleanName, slug: newSlug })
      .where(eq(categories.id, id))
      .run();

    // Re-link / update all products using the old category name so site stays 100% in sync
    const affectedProducts = db.select().from(products).all().filter(
      (p: any) => p.category && p.category.trim().toLowerCase() === oldName.trim().toLowerCase()
    );

    for (const p of affectedProducts) {
      db.update(products)
        .set({ category: cleanName })
        .where(eq(products.id, p.id))
        .run();
    }

    return NextResponse.json({
      success: true,
      category: { ...existingCat, name: cleanName, slug: newSlug },
      updatedProductsCount: affectedProducts.length,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const cat = db.select().from(categories).where(eq(categories.id, id)).get();
    if (!cat) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Ensure 'Uncategorized' fallback category exists
    const fallbackCategoryName = 'Uncategorized';
    let fallbackCat = db.select().from(categories).where(eq(categories.name, fallbackCategoryName)).get();
    if (!fallbackCat) {
      fallbackCat = {
        id: 'cat_uncategorized',
        name: fallbackCategoryName,
        slug: 'uncategorized',
        displayOrder: 999,
        createdAt: new Date().toISOString(),
      };
      db.insert(categories).values(fallbackCat).run();
    }

    // Find products assigned to deleted category
    const affectedProducts = db.select().from(products).all().filter(
      (p: any) => p.category && p.category.trim().toLowerCase() === cat.name.trim().toLowerCase()
    );

    // Reassign affected products to 'Uncategorized' fallback
    for (const p of affectedProducts) {
      db.update(products)
        .set({ category: fallbackCategoryName })
        .where(eq(products.id, p.id))
        .run();
    }

    // Delete category
    db.delete(categories).where(eq(categories.id, id)).run();

    return NextResponse.json({
      success: true,
      reassignedProductsCount: affectedProducts.length,
      fallbackCategory: fallbackCategoryName,
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
