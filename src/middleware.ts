import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip locale handling for admin and API routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return;
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except static files and api routes
  matcher: ['/', '/(en|es)/:path*', '/((?!_next|_vercel|.*\\..*).*)'],
};
