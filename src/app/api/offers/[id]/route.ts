import { NextResponse } from 'next/server';
import { db } from '@/db';
import { offers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const admin = getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { heading, discountPercent, isActive, startDate, endDate } = await request.json();
    const off = db.select().from(offers).where(eq(offers.id, params.id)).get();
    if (!off) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });

    db.update(offers)
      .set({
        heading: heading ? heading.trim() : off.heading,
        discountPercent: discountPercent !== undefined ? parseInt(discountPercent, 10) : off.discountPercent,
        isActive: isActive !== undefined ? Boolean(isActive) : off.isActive,
        startDate: startDate !== undefined ? startDate : off.startDate,
        endDate: endDate !== undefined ? endDate : off.endDate,
      })
      .where(eq(offers.id, params.id))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const admin = getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    db.delete(offers).where(eq(offers.id, params.id)).run();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 });
  }
}
