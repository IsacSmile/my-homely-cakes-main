import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { creditPointsForOrder, reversePointsForOrder } from '@/lib/points';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { status, consumerStatus } = body;

    const updates: Record<string, any> = {};

    const validInternalStatuses = ['new', 'contacted', 'confirmed', 'completed', 'cancelled'];
    const validConsumerStatuses = ['received', 'processing', 'baking', 'packed', 'dispatched', 'delivered', 'cancelled'];

    if (status) {
      if (!validInternalStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid internal order status' }, { status: 400 });
      }
      updates.status = status;
    }

    if (consumerStatus) {
      if (!validConsumerStatuses.includes(consumerStatus)) {
        return NextResponse.json({ error: 'Invalid consumer order status' }, { status: 400 });
      }
      updates.consumerStatus = consumerStatus;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid status fields provided' }, { status: 400 });
    }

    await db.update(orders)
      .set(updates)
      .where(eq(orders.id, resolvedParams.id));

    // Handle points crediting / reversal based on status changes
    if (status === 'completed' || consumerStatus === 'delivered') {
      await creditPointsForOrder(resolvedParams.id);
    } else if (status === 'cancelled' || consumerStatus === 'cancelled') {
      await reversePointsForOrder(resolvedParams.id);
    }

    revalidatePath('/admin-manage/orders');
    revalidatePath('/admin-manage/overview');
    revalidatePath('/orders');

    return NextResponse.json({ success: true, ...updates });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resolvedParams = await params;
    await reversePointsForOrder(resolvedParams.id);
    await db.delete(orders).where(eq(orders.id, resolvedParams.id)).run();

    revalidatePath('/admin-manage/orders');
    revalidatePath('/admin-manage/overview');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
