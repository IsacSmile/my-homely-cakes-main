import { NextResponse } from 'next/server';
import { db } from '@/db';
import { emailSignups } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.select().from(emailSignups).where(eq(emailSignups.email, cleanEmail)).get();

    if (!existing) {
      db.insert(emailSignups).values({
        id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        email: cleanEmail,
        createdAt: new Date().toISOString(),
      }).run();
    }

    return NextResponse.json({ success: true, message: 'Subscribed successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
