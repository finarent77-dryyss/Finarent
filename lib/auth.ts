import { getSession as auth0GetSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { prisma } from './prisma';
import { signalerClaimHistorique } from './legacy-role-claim';
import { partenaireRattache } from './acces-dossier';
import type { User } from '@prisma/client';

const ROLE_CLAIM = 'https://finarent/role';
// Ancien namespace, conservé en repli — constat P2-4, commentaire du 9 septembre 2026.
//
// Condition de retrait : ne supprimer cette constante et son usage qu'une fois
// vérifié qu'aucun jeton ne la porte plus. La mesure est en place : chaque
// lecture du repli journalise une ligne `[P2-4]` (cf. lib/legacy-role-claim.ts).
// Quand aucune de ces lignes n'apparaît plus pendant une durée supérieure à la
// durée de vie d'une session Auth0, le retrait est sans risque. Retirer avant,
// c'est faire retomber en CLIENT toute session ouverte avant la bascule de
// l'Action Auth0 — les trois emplacements (ici, lib/users.js, middleware.ts)
// doivent être retirés ensemble.
const LEGACY_ROLE_CLAIM = 'https://finassur/role';

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
  const actuel = auth0User[ROLE_CLAIM] as string | undefined;
  if (actuel !== undefined && actuel !== null) return actuel;

  const historique = auth0User[LEGACY_ROLE_CLAIM] as string | undefined;
  if (historique !== undefined && historique !== null) {
    signalerClaimHistorique(auth0User.sub as string | undefined, 'lib/auth.ts');
    return historique;
  }

  return 'client';
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
 * Vérifie le rôle PARTNER ou ADMIN **et** le rattachement effectif à une société.
 *
 * Le seul contrôle de rôle ne suffisait pas : `User.partnerId` est nullable et
 * l'administration permet de promouvoir un compte en PARTNER avant de le
 * rattacher. Les routes construisaient alors le filtre `{ partnerId: null }`,
 * c'est-à-dire l'ensemble des dossiers **non encore attribués** — avec les
 * pièces jointes et l'identité des clients. Un rôle sans rattachement n'ouvre
 * donc plus rien : il est refusé ici, avant toute lecture de la base.
 *
 * Retourne { auth0User, dbUser } ou répond 401/403.
 */
export async function requirePartner(): Promise<AuthResult | NextResponse> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;

  if (result.dbUser.role !== 'PARTNER' && result.dbUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès partenaire requis' }, { status: 403 });
  }

  if (!partenaireRattache(result.dbUser)) {
    return NextResponse.json(
      { error: 'Compte partenaire non rattaché à une société : accès refusé.' },
      { status: 403 },
    );
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
