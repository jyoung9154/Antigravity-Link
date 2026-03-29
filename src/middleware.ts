import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Skip auth for login page and API routes
  if (pathname === '/login' || pathname.startsWith('/api/login')) {
    return NextResponse.next();
  }

  // 2. Check for the auth cookie
  const authToken = req.cookies.get('antigravity_session');

  // 3. If no cookie, redirect to login
  if (!authToken) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - sw.js (Service Worker)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)',
  ],
};
