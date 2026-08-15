import { NextResponse } from 'next/server';
import { db } from '@/db';
import { adminUsers, settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getAdminFromCookies, setAdminCookie, signAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const allSettings = (await db.select().from(settings).all()) || [];
  const settingsMap = allSettings.reduce((acc: Record<string, string>, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const defaultNotificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'faizdevandco@gmail.com';

  return NextResponse.json({
    email: admin.email,
    whatsapp: settingsMap.admin_whatsapp || '',
    notificationEmail: settingsMap.admin_email || defaultNotificationEmail,
    resendApiKey: settingsMap.resend_api_key || '',
    resendFromEmail: settingsMap.resend_from_email || '',
  });
}

export async function POST(request: Request) {
  const adminSession = await getAdminFromCookies();
  if (!adminSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { currentPassword, newEmail, newPassword, whatsapp, notificationEmail, resendApiKey, resendFromEmail } = await request.json();

    const admin = await db.select().from(adminUsers).where(eq(adminUsers.id, adminSession.id)).get();
    if (!admin) return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });

    const isChangingCredentials = (newEmail && newEmail.trim() !== admin.email) || (newPassword && newPassword.trim().length > 0);

    // Validate current password ONLY if updating admin credentials
    if (isChangingCredentials) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to update login credentials' }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
      }
    }

    // Validate notification email(s) syntax if passed
    if (notificationEmail !== undefined) {
      const emailList = notificationEmail
        .split(',')
        .map((e: string) => e.trim())
        .filter(Boolean);

      if (emailList.length === 0) {
        return NextResponse.json({ error: 'Notification email address cannot be empty' }, { status: 400 });
      }

      for (const emailItem of emailList) {
        if (!EMAIL_REGEX.test(emailItem)) {
          return NextResponse.json({ error: `Invalid email address format: "${emailItem}"` }, { status: 400 });
        }
      }
    }

    // Update email or password if provided
    let updatedEmail = admin.email;
    let updatedPasswordHash = admin.passwordHash;

    if (newEmail && newEmail.trim() !== admin.email) {
      updatedEmail = newEmail.trim();
    }

    if (newPassword && newPassword.trim().length >= 6) {
      updatedPasswordHash = await bcrypt.hash(newPassword.trim(), 10);
    }

    if (isChangingCredentials) {
      await db.update(adminUsers)
        .set({ email: updatedEmail, passwordHash: updatedPasswordHash })
        .where(eq(adminUsers.id, admin.id))
        .run();
    }

    // Update settings table
    if (whatsapp !== undefined) {
      const exists = await db.select().from(settings).where(eq(settings.key, 'admin_whatsapp')).get();
      if (exists) {
        await db.update(settings).set({ value: whatsapp }).where(eq(settings.key, 'admin_whatsapp')).run();
      } else {
        await db.insert(settings).values({ id: 'set_1', key: 'admin_whatsapp', value: whatsapp }).run();
      }
    }

    if (notificationEmail !== undefined) {
      const cleanEmailVal = notificationEmail
        .split(',')
        .map((e: string) => e.trim())
        .filter(Boolean)
        .join(', ');

      const exists = await db.select().from(settings).where(eq(settings.key, 'admin_email')).get();
      if (exists) {
        await db.update(settings).set({ value: cleanEmailVal }).where(eq(settings.key, 'admin_email')).run();
      } else {
        await db.insert(settings).values({ id: 'set_2', key: 'admin_email', value: cleanEmailVal }).run();
      }
    }

    if (resendApiKey !== undefined) {
      const exists = await db.select().from(settings).where(eq(settings.key, 'resend_api_key')).get();
      if (exists) {
        await db.update(settings).set({ value: resendApiKey.trim() }).where(eq(settings.key, 'resend_api_key')).run();
      } else {
        await db.insert(settings).values({ id: 'set_3', key: 'resend_api_key', value: resendApiKey.trim() }).run();
      }
    }

    if (resendFromEmail !== undefined) {
      const exists = await db.select().from(settings).where(eq(settings.key, 'resend_from_email')).get();
      if (exists) {
        await db.update(settings).set({ value: resendFromEmail.trim() }).where(eq(settings.key, 'resend_from_email')).run();
      } else {
        await db.insert(settings).values({ id: 'set_4', key: 'resend_from_email', value: resendFromEmail.trim() }).run();
      }
    }

    // Refresh JWT cookie if login email changed
    if (newEmail && newEmail.trim() !== admin.email) {
      const newToken = signAdminToken({ id: admin.id, email: updatedEmail });
      await setAdminCookie(newToken);
    }

    return NextResponse.json({ success: true, email: updatedEmail });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
