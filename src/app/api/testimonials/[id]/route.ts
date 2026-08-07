import { NextResponse } from 'next/server';
import { db } from '@/db';
import { testimonials } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const existing = await db.select().from(testimonials).where(eq(testimonials.id, id)).get();
    if (!existing) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    // Handle Reorder action
    if (body.action === 'reorder') {
      const { direction } = body;
      const allTestimonials = ((await db.select().from(testimonials).all()) || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder);
      const index = allTestimonials.findIndex((t: any) => t.id === id);

      if (index !== -1) {
        let swapIndex = -1;
        if (direction === 'up' && index > 0) swapIndex = index - 1;
        if (direction === 'down' && index < allTestimonials.length - 1) swapIndex = index + 1;

        if (swapIndex !== -1) {
          const target = allTestimonials[swapIndex];
          await db.update(testimonials).set({ sortOrder: target.sortOrder }).where(eq(testimonials.id, existing.id)).run();
          await db.update(testimonials).set({ sortOrder: existing.sortOrder }).where(eq(testimonials.id, target.id)).run();
        }
      }

      return NextResponse.json({ success: true });
    }

    // Edit Review Details Action
    const { name, location, cakeName, rating, quote } = body;

    const nameParts = (name || existing.name).trim().split(' ');
    const initials = nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : (name || existing.name).substring(0, 2).toUpperCase();

    await db.update(testimonials)
      .set({
        name: name ? name.trim() : existing.name,
        location: location ? location.trim() : existing.location,
        cakeName: cakeName ? cakeName.trim() : existing.cakeName,
        rating: rating !== undefined ? Number(rating) : existing.rating,
        quote: quote ? quote.trim() : existing.quote,
        initials,
      })
      .where(eq(testimonials.id, id))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const existing = await db.select().from(testimonials).where(eq(testimonials.id, id)).get();
    if (!existing) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    await db.delete(testimonials).where(eq(testimonials.id, id)).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
