import { NextResponse } from 'next/server';
import { db } from '@/db';
import { emailSignups } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { getAdminFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const subscribers = (await db.select().from(emailSignups).orderBy(desc(emailSignups.createdAt)).all()) || [];
    return NextResponse.json({ subscribers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}
