import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cookie names that indicate a signed-in session. The app's own login flow
// (app/api/auth/login) sets `token`; NextAuth, if used, sets its session cookie.
const SESSION_COOKIES = [
  'token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

// Optimistic auth check only: Proxy runs on every matched (and prefetched)
// request, so it just verifies a session cookie is present and never touches
// the database. Full validation stays in the API routes (e.g. /api/auth/me),
// which look the token up via getUserByToken.
export function proxy(req: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => req.cookies.has(name));

  if (!hasSession) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/chat/:path*'],
};
