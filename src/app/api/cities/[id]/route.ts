import { NextResponse } from 'next/server';
import { db } from '@/db';
import { cities, orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Admin: update city (name, isActive, sortOrder)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, isActive, sortOrder } = body;

    const existing = await db.select().from(cities).where(eq(cities.id, id)).get();
    if (!existing) return NextResponse.json({ error: 'City not found' }, { status: 404 });

    const updated: Partial<typeof existing> = {};
    if (name !== undefined) updated.name = String(name).trim();
    if (isActive !== undefined) updated.isActive = Boolean(isActive);
    if (sortOrder !== undefined) updated.sortOrder = Number(sortOrder);

    await db.update(cities).set(updated).where(eq(cities.id, id)).run();
    const refreshed = await db.select().from(cities).where(eq(cities.id, id)).get();

    return NextResponse.json({ success: true, city: refreshed });
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE')) {
      return NextResponse.json({ error: 'A city with that name already exists' }, { status: 409 });
    }
    console.error('City PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update city' }, { status: 500 });
  }
}

// Admin: delete city (or disable if referenced by orders)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;

    const existing = await db.select().from(cities).where(eq(cities.id, id)).get();
    if (!existing) return NextResponse.json({ error: 'City not found' }, { status: 404 });

    // Check if any orders reference this city
    const ordersWithCity = (await db
      .select()
      .from(orders)
      .where(eq(orders.deliveryCity, existing.name))
      .all()) || [];

    if (ordersWithCity.length > 0) {
      // Disable instead of hard delete to preserve order history
      await db.update(cities).set({ isActive: false }).where(eq(cities.id, id)).run();
      return NextResponse.json({
        success: true,
        disabled: true,
        message: `City "${existing.name}" has ${ordersWithCity.length} order(s) referencing it and was disabled instead of deleted to preserve order history.`,
      });
    }

    await db.delete(cities).where(eq(cities.id, id)).run();
    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error('City DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete city' }, { status: 500 });
  }
}
