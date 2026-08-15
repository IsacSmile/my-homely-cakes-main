import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value || request.cookies.get('mhc_admin_token')?.value;
  const path = request.nextUrl.pathname;

  // Protect admin routes except login page itself
  if (path.startsWith('/admin-manage') && path !== '/admin-manage') {
    if (!token) {
      return NextResponse.redirect(new URL('/admin-manage', request.url));
    }
  }

  // If already logged in and visiting login page, redirect to overview
  if (path === '/admin-manage' && token) {
    return NextResponse.redirect(new URL('/admin-manage/overview', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin-manage/:path*'],
};
