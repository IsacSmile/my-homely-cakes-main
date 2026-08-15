import { db } from '@/db';
import { users, orders, pointsTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Calculates points earned for a given order total paid.
 * Earn rate: 5 points for every ₹100 spent.
 */
export function calculatePointsEarned(paidAmount: number): number {
  if (!paidAmount || paidAmount <= 0) return 0;
  return Math.floor(paidAmount / 100) * 5;
}

/**
 * Calculates discount amount in INR for a given points count.
 * Redemption rate: 100 points = ₹50 discount.
 */
export function calculatePointsDiscount(points: number): number {
  if (!points || points < 100) return 0;
  return Math.floor(points / 100) * 50;
}

/**
 * Automatically credits points for an order when marked "completed" or "delivered".
 * Ensures points are credited only once and only for authenticated users.
 */
export async function creditPointsForOrder(orderId: string): Promise<{ success: boolean; pointsEarned?: number }> {
  try {
    const orderList = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!orderList || orderList.length === 0) return { success: false };
    const order = orderList[0];

    // Don't award points if guest order, already credited, or total paid is 0
    if (!order.userId || order.pointsCredited) return { success: false };

    // Calculate points on the actual total paid
    const earned = calculatePointsEarned(order.totalAmount);
    if (earned <= 0) {
      await db.update(orders).set({ pointsCredited: true, pointsEarned: 0 }).where(eq(orders.id, orderId));
      return { success: true, pointsEarned: 0 };
    }

    // Get current user points
    const userList = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
    if (!userList || userList.length === 0) return { success: false };
    const user = userList[0];

    const newBalance = (user.pointsBalance || 0) + earned;

    // Update user points balance
    await db.update(users)
      .set({ pointsBalance: newBalance })
      .where(eq(users.id, order.userId));

    // Log transaction
    const txId = `pt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.insert(pointsTransactions).values({
      id: txId,
      userId: order.userId,
      orderId: order.id,
      pointsChange: earned,
      type: 'earned',
      description: `Earned ${earned} points from Order #${order.orderNumber}`,
      createdAt: new Date().toISOString(),
    });

    // Mark order as credited
    await db.update(orders)
      .set({
        pointsCredited: true,
        pointsEarned: earned,
      })
      .where(eq(orders.id, orderId));

    return { success: true, pointsEarned: earned };
  } catch (error) {
    console.error('Error crediting points for order:', error);
    return { success: false };
  }
}

/**
 * Reverses points when an order is cancelled or refunded.
 * If points were earned, deducts them.
 * If points were redeemed, refunds them back to user.
 */
export async function reversePointsForOrder(orderId: string): Promise<{ success: boolean }> {
  try {
    const orderList = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!orderList || orderList.length === 0) return { success: false };
    const order = orderList[0];
    if (!order.userId) return { success: false };

    const userList = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
    if (!userList || userList.length === 0) return { success: false };
    const user = userList[0];

    let currentBalance = user.pointsBalance || 0;

    // 1. Reverse earned points if already credited
    if (order.pointsCredited && (order.pointsEarned || 0) > 0) {
      const pointsToDeduct = order.pointsEarned;
      currentBalance = Math.max(0, currentBalance - pointsToDeduct);

      await db.update(users)
        .set({ pointsBalance: currentBalance })
        .where(eq(users.id, order.userId));

      const txId = `pt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await db.insert(pointsTransactions).values({
        id: txId,
        userId: order.userId,
        orderId: order.id,
        pointsChange: -pointsToDeduct,
        type: 'reversed',
        description: `Reversed ${pointsToDeduct} earned points from cancelled Order #${order.orderNumber}`,
        createdAt: new Date().toISOString(),
      });

      await db.update(orders)
        .set({ pointsCredited: false, pointsEarned: 0 })
        .where(eq(orders.id, orderId));
    }

    // 2. Refund redeemed points if any were used on this cancelled order
    if ((order.pointsRedeemed || 0) > 0) {
      const pointsToRefund = order.pointsRedeemed;
      currentBalance += pointsToRefund;

      await db.update(users)
        .set({ pointsBalance: currentBalance })
        .where(eq(users.id, order.userId));

      const txId = `pt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await db.insert(pointsTransactions).values({
        id: txId,
        userId: order.userId,
        orderId: order.id,
        pointsChange: pointsToRefund,
        type: 'reversed',
        description: `Refunded ${pointsToRefund} redeemed points from cancelled Order #${order.orderNumber}`,
        createdAt: new Date().toISOString(),
      });

      await db.update(orders)
        .set({ pointsRedeemed: 0, pointsDiscountAmount: 0 })
        .where(eq(orders.id, orderId));
    }

    return { success: true };
  } catch (error) {
    console.error('Error reversing points for order:', error);
    return { success: false };
  }
}
