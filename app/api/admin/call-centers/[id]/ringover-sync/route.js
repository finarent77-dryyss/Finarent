import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/users';
import { syncAllCallCenterProspectsToRingover, getRingoverSyncStats } from '@/lib/ringover/sync-contact.js';
import { lireCorpsJsonOptionnel } from '@/lib/reponses-api';

// Bornes du lot traité en une requête. Sans plafond, `limit` partait tel quel
// dans le `take` de Prisma (une valeur non numérique faisait lever) et lançait
// une boucle d'appels HTTP séquentiels vers Ringover qui ne rendait jamais la
// main.
const LIMITE_DEFAUT = 500;
const LIMITE_MAX = 1000;
// Le lot s'arrête de lui-même passé ce délai et rend le compte rendu partiel.
const DUREE_MAX_MS = 60_000;

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const adminAccess = await isAdmin(session.user);
  if (!adminAccess) return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });

  const { id } = await params;
  const stats = await getRingoverSyncStats(id);
  return NextResponse.json(stats);
}

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const adminAccess = await isAdmin(session.user);
  if (!adminAccess) return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });

  const { id } = await params;
  const body = await lireCorpsJsonOptionnel(request);

  const limite = Math.min(Math.max(1, Math.trunc(Number(body.limit)) || LIMITE_DEFAUT), LIMITE_MAX);

  const result = await syncAllCallCenterProspectsToRingover({
    callCenterId: id,
    limit: limite,
    dureeMaxMs: DUREE_MAX_MS,
  });

  return NextResponse.json({ ok: true, ...result });
}
