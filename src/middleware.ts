import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // 1. Get the Authorization header from the request
  const basicAuth = req.headers.get('authorization');

  // 2. Fetch the required credentials from environment variables
  // Defaults added for local development convenience if env vars are missing
  const user = process.env.AUTH_USER || 'antigravity';
  const pwd = process.env.AUTH_PASS || 'link';

  // 3. Check if basic auth header exists and matches
  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    // btoa is base64 decoder in browser, Node has Buffer but atob is available in Edge Runtime
    const [providedUser, providedPwd] = atob(authValue).split(':');

    if (providedUser === user && providedPwd === pwd) {
      return NextResponse.next(); // Success
    }
  }

  // 4. Request Authentication if failed or not provided
  return new NextResponse('Secure Area. Authentication Required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Antigravity Link Secure Area"',
    },
  });
}

// 5. Apply this middleware to all routes except static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.ts/json (to allow PWA installation prompts before login if necessary, though it's safer to protect it)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
