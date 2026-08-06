import { NextResponse } from 'next/server';
import { db } from '@/db';
import { searchLogs, clickLogs } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const { type, query, productId } = await request.json();

    if (type === 'search' && query) {
      db.insert(searchLogs).values({
        id: 'srch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        query: query.trim(),
        createdAt: new Date().toISOString(),
      }).run();
    } else if (type === 'click' && productId) {
      db.insert(clickLogs).values({
        id: 'clk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        productId,
        createdAt: new Date().toISOString(),
      }).run();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
  }
}
