import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdminFromCookies } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { reversePointsForOrder } from '@/lib/points';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    const session = await getServerSession(authOptions);
    const admin = await getAdminFromCookies();

    // Fetch the order from database
    const orderList = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (orderList.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    const order = orderList[0];

    // Check authorization: must be admin OR owner of the order via email/session
    const isOwner = session?.user?.email && order.customerEmail && session.user.email.toLowerCase() === order.customerEmail.toLowerCase();
    if (!admin && !isOwner && !session?.user) {
      return NextResponse.json({ error: 'Unauthorized to cancel this order' }, { status: 401 });
    }

    // Check if order is already cancelled or delivered
    if (order.consumerStatus === 'cancelled' || order.status === 'cancelled') {
      return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 });
    }

    // Update order status to cancelled
    await db.update(orders)
      .set({
        status: 'cancelled',
        consumerStatus: 'cancelled',
      })
      .where(eq(orders.id, orderId));

    // Reverse any earned or redeemed points for this order
    await reversePointsForOrder(orderId);

    revalidatePath('/admin-manage/orders');
    revalidatePath('/admin-manage/overview');
    revalidatePath('/orders');

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
  }
}
