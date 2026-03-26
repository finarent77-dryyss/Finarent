import { getSession as auth0GetSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { prisma } from './prisma';
import type { User } from '@prisma/client';

const ROLE_CLAIM = 'https://finassur/role';

export type AuthResult = {
  auth0User: Record<string, unknown>;
  dbUser: User;
};

/** Récupère la session Auth0 courante */
export async function getSession() {
  return auth0GetSession();
}

/** Extrait le claim de rôle du token Auth0 */
export function getRoleClaim(auth0User: Record<string, unknown>): string {
  return (auth0User[ROLE_CLAIM] as string) ?? 'client';
}

/** Mappe le claim rôle Auth0 vers le rôle Prisma */
export function mapRole(roleClaim: string): 'CLIENT' | 'ADMIN' | 'PARTNER' | 'INSURER' {
  if (roleClaim === 'admin') return 'ADMIN';
  if (roleClaim === 'partner') return 'PARTNER';
  if (roleClaim === 'insurer') return 'INSURER';
  return 'CLIENT';
}

/**
 * Vérifie l'authentification.
 * Retourne { auth0User, dbUser } ou répond 401/404.
 */
export async function requireAuth(): Promise<AuthResult | NextResponse> {
  const session = await auth0GetSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { auth0Id: session.user.sub as string },
  });

  if (!dbUser) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  return { auth0User: session.user as Record<string, unknown>, dbUser };
}

/**
 * Vérifie le rôle ADMIN.
 * Retourne { auth0User, dbUser } ou répond 401/403.
 */
export async function requireAdmin(): Promise<AuthResult | NextResponse> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;

  if (result.dbUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 });
  }

  return result;
}

/**
 * Vérifie le rôle PARTNER ou ADMIN.
 * Retourne { auth0User, dbUser } ou répond 401/403.
 */
export async function requirePartner(): Promise<AuthResult | NextResponse> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;

  if (result.dbUser.role !== 'PARTNER' && result.dbUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès partenaire requis' }, { status: 403 });
  }

  return result;
}

/**
 * Vérifie le rôle INSURER ou ADMIN.
 * Retourne { auth0User, dbUser } ou répond 401/403.
 */
export async function requireInsurer(): Promise<AuthResult | NextResponse> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;

  if (result.dbUser.role !== 'INSURER' && result.dbUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès assureur requis' }, { status: 403 });
  }

  return result;
}

/** Helper pour vérifier si un résultat est une NextResponse d'erreur */
export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
