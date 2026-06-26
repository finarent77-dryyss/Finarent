import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { getRoleClaim, mapRole } from '@/lib/auth';

/**
 * POST /api/auth/sync-user
 * Upsert l'utilisateur en base à partir des données Auth0.
 * Appelé après chaque connexion (depuis le client ou le callback Auth0).
 */
export async function POST(): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { sub, email, name } = session.user as {
      sub: string;
      email: string;
      name?: string;
    };

    if (!sub || !email) {
      return NextResponse.json({ error: 'Données Auth0 incomplètes' }, { status: 400 });
    }

    const roleClaim = getRoleClaim(session.user as Record<string, unknown>);
    const role = mapRole(roleClaim);

    const user = await prisma.user.upsert({
      where: { auth0Id: sub },
      create: {
        auth0Id: sub,
        email,
        name: name ?? null,
        role,
      },
      update: {
        email,
        name: name ?? undefined,
        role,
        lastLoginAt: new Date(),
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error('sync-user error:', err);
    return NextResponse.json({ error: 'Erreur lors de la synchronisation' }, { status: 500 });
  }
}
