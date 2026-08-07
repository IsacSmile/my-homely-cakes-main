import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, products, searchLogs, clickLogs, emailSignups } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const allOrders = db.select().from(orders).orderBy(desc(orders.createdAt)).all();
    const allProducts = db.select().from(products).all();
    const allSearchLogs = db.select().from(searchLogs).all();
    const allClickLogs = db.select().from(clickLogs).all();
    const allSubscribers = db.select().from(emailSignups).all();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let todayOrdersCount = 0;
    let weekOrdersCount = 0;
    let monthOrdersCount = 0;
    let monthRevenue = 0;

    for (const o of allOrders) {
      const time = new Date(o.createdAt).getTime();
      if (time >= startOfToday) todayOrdersCount++;
      if (time >= startOfWeek) weekOrdersCount++;
      if (time >= startOfMonth) {
        monthOrdersCount++;
        if (o.status !== 'cancelled') {
          monthRevenue += o.totalAmount;
        }
      }
    }

    // Top Most-Ordered Products (weekly / total)
    const topProducts = [...allProducts]
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        orderCount: p.orderCount,
        price: p.basePrice,
        imageUrl: p.imageUrl,
      }));

    // Most-Searched Queries Aggregation
    const searchCounts: Record<string, number> = {};
    for (const log of allSearchLogs) {
      const q = log.query.toLowerCase().trim();
      searchCounts[q] = (searchCounts[q] || 0) + 1;
    }
    const topSearches = Object.entries(searchCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([query, count]) => ({ query, count }));

    // Most-Clicked Products Aggregation
    const clickCounts: Record<string, number> = {};
    for (const log of allClickLogs) {
      clickCounts[log.productId] = (clickCounts[log.productId] || 0) + 1;
    }
    const topClicks = Object.entries(clickCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, count]) => {
        const prod = allProducts.find((p: any) => p.id === productId);
        return {
          productId,
          name: prod ? prod.name : 'Unknown Product',
          count,
        };
      });

    const newOrdersBadgeCount = allOrders.filter((o: any) => o.status === 'new').length;

    return NextResponse.json({
      stats: {
        todayOrdersCount,
        weekOrdersCount,
        monthOrdersCount,
        monthRevenue,
        subscribersCount: allSubscribers.length,
        newOrdersBadgeCount,
        totalProductsCount: allProducts.length,
      },
      topProducts,
      topSearches,
      topClicks,
      recentOrders: allOrders.slice(0, 10),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard metrics' }, { status: 500 });
  }
}
