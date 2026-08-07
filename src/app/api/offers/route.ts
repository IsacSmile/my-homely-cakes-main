import { NextResponse } from 'next/server';
import { db } from '@/db';
import { offers } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allOffers = (await db.select().from(offers).orderBy(desc(offers.createdAt)).all()) || [];
    return NextResponse.json({ offers: allOffers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { heading, discountPercent, isActive, startDate, endDate } = await request.json();

    if (!heading || discountPercent === undefined) {
      return NextResponse.json({ error: 'Heading and discount percentage are required' }, { status: 400 });
    }

    const id = 'offer_' + Date.now();
    const newOffer = {
      id,
      heading: heading.trim(),
      discountPercent: parseInt(discountPercent, 10),
      isActive: isActive !== false,
      startDate: startDate || null,
      endDate: endDate || null,
      createdAt: new Date().toISOString(),
    };

    await db.insert(offers).values(newOffer).run();

    revalidatePath('/shop');
    revalidatePath('/');

    return NextResponse.json({ success: true, offer: newOffer });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
}
