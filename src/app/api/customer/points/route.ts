import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { users, pointsTransactions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const email = session.user.email;
    const userList = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!userList || userList.length === 0) {
      return NextResponse.json({ success: true, pointsBalance: 50, transactions: [] });
    }

    const dbUser = userList[0];

    // If existing user has 0 points and no transactions recorded, grant Welcome Bonus of 50 points
    let currentBalance = dbUser.pointsBalance || 0;
    const txList = await db
      .select()
      .from(pointsTransactions)
      .where(eq(pointsTransactions.userId, dbUser.id))
      .orderBy(desc(pointsTransactions.createdAt))
      .limit(50);

    if (currentBalance === 0 && (!txList || txList.length === 0)) {
      currentBalance = 50;
      try {
        await db.update(users).set({ pointsBalance: 50 }).where(eq(users.id, dbUser.id)).run();
        const txId = `pt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await db.insert(pointsTransactions).values({
          id: txId,
          userId: dbUser.id,
          pointsChange: 50,
          type: 'earned',
          description: 'Welcome Bonus: 50 free rewards points!',
          createdAt: new Date().toISOString(),
        }).run();
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      pointsBalance: currentBalance,
      transactions: txList || [],
    });
  } catch (error) {
    console.error('Error fetching customer points:', error);
    return NextResponse.json({ error: 'Failed to fetch customer points' }, { status: 500 });
  }
}
