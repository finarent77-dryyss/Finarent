import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/users';
import { syncAllCallCenterProspectsToRingover, getRingoverSyncStats } from '@/lib/ringover/sync-contact.js';

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
  const body = await request.json().catch(() => ({}));
  const result = await syncAllCallCenterProspectsToRingover({
    callCenterId: id,
    limit: body.limit ?? 500,
  });

  return NextResponse.json({ ok: true, ...result });
}
