import { NextResponse } from 'next/server';
import { db } from '@/db';
import { cities } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET cities — admin gets all (including inactive), public gets only active
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === '1';

    // If admin requesting all, verify authentication
    let isAdmin = false;
    if (showAll) {
      const admin = await getAdminFromCookies();
      isAdmin = !!admin;
    }

    const allCities = (await db
      .select()
      .from(cities)
      .orderBy(asc(cities.sortOrder), asc(cities.name))
      .all()) || [];

    // Return all cities to authenticated admin, only active to public
    const filteredCities = (isAdmin && showAll) ? allCities : allCities.filter((c: any) => c.isActive);
    const activeCities = filteredCities;

    // Ensure Trivandrum is always first if present
    const sorted = [
      ...activeCities.filter((c: any) => c.name.toLowerCase() === 'trivandrum'),
      ...activeCities.filter((c: any) => c.name.toLowerCase() !== 'trivandrum'),
    ];

    return NextResponse.json({ cities: sorted });
  } catch (error) {
    console.error('Cities GET error:', error);
    // Fallback to just Trivandrum
    return NextResponse.json({
      cities: [{ id: 'city_trivandrum', name: 'Trivandrum', isActive: true, sortOrder: 0 }],
    });
  }
}

// Admin only: create a new city
export async function POST(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { name, isActive = true, sortOrder = 0 } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'City name is required' }, { status: 400 });
    }

    const id = 'city_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    await db.insert(cities).values({
      id,
      name: name.trim(),
      isActive: Boolean(isActive),
      sortOrder: Number(sortOrder) || 0,
      createdAt: now,
    }).run();

    const created = await db.select().from(cities).where(eq(cities.id, id)).get();
    return NextResponse.json({ success: true, city: created });
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE')) {
      return NextResponse.json({ error: 'A city with that name already exists' }, { status: 409 });
    }
    console.error('City POST error:', error);
    return NextResponse.json({ error: 'Failed to add city' }, { status: 500 });
  }
}
