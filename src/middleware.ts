import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getRedirectUrl(targetPath: string, request: NextRequest): URL {
  // 1. Check for standard reverse-proxy forwarded headers (Apache / Nginx / GoDaddy cPanel)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';

  if (forwardedHost) {
    const host = forwardedHost.split(',')[0].trim();
    return new URL(targetPath, `${forwardedProto}://${host}`);
  }

  // 2. If running behind a reverse proxy that set Host to an internal loopback address in production
  const host = request.headers.get('host') || request.nextUrl.host;
  const isInternalHost = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('0.0.0.0');

  if (isInternalHost && process.env.NODE_ENV === 'production') {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://myhomelycakes.com';
    return new URL(targetPath, baseUrl);
  }

  // 3. Fallback: use request.nextUrl (for local development or standard hosting)
  const url = request.nextUrl.clone();
  url.pathname = targetPath;
  url.search = '';
  return url;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value || request.cookies.get('mhc_admin_token')?.value;
  const path = request.nextUrl.pathname;

  // Protect admin routes except login page itself
  if (path.startsWith('/admin-manage') && path !== '/admin-manage') {
    if (!token) {
      return NextResponse.redirect(getRedirectUrl('/admin-manage', request));
    }
  }

  // If already logged in and visiting login page, redirect to overview
  if (path === '/admin-manage' && token) {
    return NextResponse.redirect(getRedirectUrl('/admin-manage/overview', request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin-manage/:path*'],
};

