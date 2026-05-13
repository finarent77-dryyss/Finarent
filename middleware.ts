import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROLE_CLAIM = 'https://finarent/role';
// Ancien namespace : fallback tant que l'Action Auth0 émet encore l'ancien claim.
const LEGACY_ROLE_CLAIM = 'https://finassur/role';

function getRole(user: Record<string, unknown>): string | undefined {
  return (user[ROLE_CLAIM] as string) ?? (user[LEGACY_ROLE_CLAIM] as string);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass : routes publiques et assets
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const session = await getSession(request, res);

  // ── /admin : ADMIN uniquement ──────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!session?.user) {
      const loginUrl = new URL('/api/auth/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const role = getRole(session.user as Record<string, unknown>);
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return res;
  }

  // ── /partner : PARTNER ou ADMIN ────────────────────────
  if (pathname.startsWith('/partner')) {
    if (!session?.user) {
      const loginUrl = new URL('/api/auth/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const role = getRole(session.user as Record<string, unknown>);
    if (role !== 'partner' && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return res;
  }

  // ── /insurer : INSURER ou ADMIN ──────────────────────
  if (pathname.startsWith('/insurer')) {
    if (!session?.user) {
      const loginUrl = new URL('/api/auth/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const role = getRole(session.user as Record<string, unknown>);
    if (role !== 'insurer' && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return res;
  }

  // ── /dashboard + /espace : authentification requise ────
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/espace')) {
    if (!session?.user) {
      const loginUrl = new URL('/api/auth/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return res;
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/partner/:path*', '/insurer/:path*', '/dashboard/:path*', '/espace/:path*'],
};
