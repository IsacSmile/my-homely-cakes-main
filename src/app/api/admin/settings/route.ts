import { NextResponse } from 'next/server';
import { db } from '@/db';
import { adminUsers, settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getAdminFromCookies, setAdminCookie, signAdminToken } from '@/lib/auth';

export async function GET() {
  const admin = getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const allSettings = db.select().from(settings).all();
  const settingsMap = allSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  return NextResponse.json({
    email: admin.email,
    whatsapp: settingsMap.admin_whatsapp || '',
    notificationEmail: settingsMap.admin_email || '',
  });
}

export async function POST(request: Request) {
  const adminSession = getAdminFromCookies();
  if (!adminSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { currentPassword, newEmail, newPassword, whatsapp, notificationEmail } = await request.json();

    const admin = db.select().from(adminUsers).where(eq(adminUsers.id, adminSession.id)).get();
    if (!admin) return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });

    // Validate current password
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required to save changes' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
    }

    // Update email or password if provided
    let updatedEmail = admin.email;
    let updatedPasswordHash = admin.passwordHash;

    if (newEmail && newEmail !== admin.email) {
      updatedEmail = newEmail.trim();
    }

    if (newPassword && newPassword.trim().length >= 6) {
      updatedPasswordHash = await bcrypt.hash(newPassword.trim(), 10);
    }

    db.update(adminUsers)
      .set({ email: updatedEmail, passwordHash: updatedPasswordHash })
      .where(eq(adminUsers.id, admin.id))
      .run();

    // Update settings table
    if (whatsapp !== undefined) {
      const exists = db.select().from(settings).where(eq(settings.key, 'admin_whatsapp')).get();
      if (exists) {
        db.update(settings).set({ value: whatsapp }).where(eq(settings.key, 'admin_whatsapp')).run();
      } else {
        db.insert(settings).values({ id: 'set_1', key: 'admin_whatsapp', value: whatsapp }).run();
      }
    }

    if (notificationEmail !== undefined) {
      const exists = db.select().from(settings).where(eq(settings.key, 'admin_email')).get();
      if (exists) {
        db.update(settings).set({ value: notificationEmail }).where(eq(settings.key, 'admin_email')).run();
      } else {
        db.insert(settings).values({ id: 'set_2', key: 'admin_email', value: notificationEmail }).run();
      }
    }

    // Refresh JWT cookie if email changed
    const newToken = signAdminToken({ id: admin.id, email: updatedEmail });
    setAdminCookie(newToken);

    return NextResponse.json({ success: true, email: updatedEmail });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
