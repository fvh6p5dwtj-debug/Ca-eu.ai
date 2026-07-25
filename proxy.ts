import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Optimistic auth check only: Proxy runs on every matched (and prefetched)
// request, so it just verifies the session cookie is present and never touches
// the database. The `token` cookie is set by app/api/auth/login; full
// validation stays in the API routes (e.g. /api/auth/me) via getUserByToken.
export function proxy(req: NextRequest) {
  const hasSession = req.cookies.has('token');

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
