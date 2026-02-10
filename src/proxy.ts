import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin auth check — runs on the edge (no serverless cold starts)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('admin_token');
    if (!adminToken || adminToken.value !== process.env.ADMIN_PIN) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return;
  }

  // Skip locale handling for admin login and API routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return;
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except static files and api routes
  matcher: ['/', '/(en|es)/:path*', '/((?!_next|_vercel|.*\\..*).*)'],
};
