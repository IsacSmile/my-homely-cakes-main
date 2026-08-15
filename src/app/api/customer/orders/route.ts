import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { orders, users } from '@/db/schema';
import { eq, or, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const email = session.user.email;
    const dbUser = await db.select().from(users).where(eq(users.email, email)).get();

    let userOrders = [];
    if (dbUser) {
      userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, dbUser.id))
        .orderBy(desc(orders.createdAt))
        .all();
    }

    return NextResponse.json({ success: true, orders: userOrders });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json({ error: 'Failed to fetch customer orders' }, { status: 500 });
  }
}
