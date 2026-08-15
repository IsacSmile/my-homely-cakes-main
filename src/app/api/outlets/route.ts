import { NextResponse } from 'next/server';
import { db } from '@/db';
import { outlets } from '@/db/schema';
import { asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = await db.select().from(outlets).orderBy(asc(outlets.sortOrder));
    return NextResponse.json({ success: true, outlets: list });
  } catch (error) {
    console.error('Error fetching public outlets:', error);
    return NextResponse.json({ error: 'Failed to fetch outlets' }, { status: 500 });
  }
}
