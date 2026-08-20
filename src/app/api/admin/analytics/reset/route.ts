import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products, searchLogs, clickLogs } from '@/db/schema';
import { getAdminFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { scope } = body || {};

    if (!scope || !['top_orders', 'most_clicked', 'searched_terms', 'all_three'].includes(scope)) {
      return NextResponse.json({ error: 'Invalid or missing analytics reset scope' }, { status: 400 });
    }

    if (scope === 'top_orders' || scope === 'all_three') {
      // Reset product order counters without touching actual orders
      await db.update(products).set({ orderCount: 0 }).run();
    }

    if (scope === 'searched_terms' || scope === 'all_three') {
      // Clear search query logs
      await db.delete(searchLogs).run();
    }

    if (scope === 'most_clicked' || scope === 'all_three') {
      // Clear product click logs
      await db.delete(clickLogs).run();
    }

    return NextResponse.json({
      success: true,
      scope,
      message: `Analytics for ${scope} successfully cleared.`,
    });
  } catch (error) {
    console.error('Error resetting analytics:', error);
    return NextResponse.json({ error: 'Failed to reset analytics metrics' }, { status: 500 });
  }
}
