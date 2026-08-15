import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/db';
import { users, pointsTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'myhomelycakes_super_secret_jwt_key_trivandrum_2026';

export function signAdminToken(payload: { id: string; email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  };
  cookieStore.set('admin_token', token, options);
  cookieStore.set('mhc_admin_token', token, options);
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  cookieStore.delete('mhc_admin_token');
}

export async function removeAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  cookieStore.delete('mhc_admin_token');
}

export async function getAdminFromCookies(): Promise<{ id: string; email: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value || cookieStore.get('mhc_admin_token')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'myhomelycakes_super_secret_jwt_key_trivandrum_2026',
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      try {
        const existing = await db.select().from(users).where(eq(users.email, user.email)).get();
        if (!existing) {
          const newUserId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
          await db.insert(users).values({
            id: newUserId,
            email: user.email,
            name: user.name || user.email.split('@')[0],
            image: user.image || null,
            googleId: account?.providerAccountId || (profile as any)?.sub || null,
            pointsBalance: 50,
            createdAt: new Date().toISOString(),
          }).run();

          try {
            await db.insert(pointsTransactions).values({
              id: `pt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              userId: newUserId,
              pointsChange: 50,
              type: 'earned',
              description: 'Welcome Bonus: 50 free rewards points!',
              createdAt: new Date().toISOString(),
            }).run();
          } catch (e) {}
        } else {
          await db.update(users)
            .set({
              name: user.name || existing.name,
              image: user.image || existing.image,
              googleId: account?.providerAccountId || (profile as any)?.sub || existing.googleId,
            })
            .where(eq(users.email, user.email))
            .run();
        }
      } catch (err) {
        console.error('Error syncing user record on signIn:', err);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        try {
          const dbUser = await db.select().from(users).where(eq(users.email, user.email)).get();
          if (dbUser) {
            token.sub = dbUser.id;
          }
        } catch (e) {}
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.sub;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
  },
  pages: {
    signIn: '/orders',
    error: '/orders',
  },
};
