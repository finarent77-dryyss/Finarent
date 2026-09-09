import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import { signalerClaimHistorique } from './lib/legacy-role-claim';
import type { NextRequest } from 'next/server';

const ROLE_CLAIM = 'https://finarent/role';
// Ancien namespace, conservé en repli — constat P2-4, commentaire du 9 septembre 2026.
//
// Condition de retrait : ne supprimer cette constante et son usage qu'une fois
// vérifié qu'aucun jeton ne la porte plus. Chaque lecture du repli journalise
// une ligne `[P2-4]` (cf. lib/legacy-role-claim.ts) ; quand ces lignes ont
// disparu des journaux pendant plus longtemps qu'une session Auth0, le retrait
// est sans risque. Ici, un retrait prématuré redirige vers la home toute
// personne en session portant l'ancien claim. Les trois emplacements
// (lib/auth.ts, lib/users.js, ici) doivent être retirés ensemble.
const LEGACY_ROLE_CLAIM = 'https://finassur/role';

function getRole(user: Record<string, unknown>): string | undefined {
  const actuel = user[ROLE_CLAIM] as string | undefined;
  if (actuel !== undefined && actuel !== null) return actuel;

  const historique = user[LEGACY_ROLE_CLAIM] as string | undefined;
  if (historique !== undefined && historique !== null) {
    signalerClaimHistorique(user.sub as string | undefined, 'middleware.ts');
    return historique;
  }

  return undefined;
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

  // ── /call-center : admin ou membre d'un centre d'appel ──
  if (pathname.startsWith('/call-center')) {
    if (!session?.user) {
      const loginUrl = new URL('/api/auth/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return res;
  }

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
  matcher: ['/admin/:path*', '/partner/:path*', '/insurer/:path*', '/dashboard/:path*', '/espace/:path*', '/call-center/:path*'],
};
