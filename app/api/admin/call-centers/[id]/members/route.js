import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/call-centers/[id]/members
 * Liste les membres d'un centre (manager + agents).
 */
export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const members = await prisma.callCenterMember.findMany({
    where: { callCenterId: id },
    orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });
  return NextResponse.json(members);
}

/**
 * POST /api/admin/call-centers/[id]/members
 * Ajoute un membre au centre.
 *
 * Body : { userId: string, role: 'MANAGER' | 'AGENT' }
 * Si le rôle est MANAGER : retire d'office le rôle MANAGER aux autres membres
 *   du centre (un seul manager par centre).
 */
export async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();
  const userId = String(body.userId || '').trim();
  const role = body.role === 'MANAGER' ? 'MANAGER' : 'AGENT';

  if (!userId) {
    return NextResponse.json({ error: 'Identifiant utilisateur requis' }, { status: 400 });
  }

  // Centre existe ?
  const center = await prisma.callCenter.findUnique({ where: { id }, select: { id: true } });
  if (!center) {
    return NextResponse.json({ error: 'Centre introuvable' }, { status: 404 });
  }

  // User existe ?
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  try {
    // Si MANAGER, on rétrograde les autres MANAGER en AGENT (1 seul manager par centre)
    if (role === 'MANAGER') {
      await prisma.callCenterMember.updateMany({
        where: { callCenterId: id, role: 'MANAGER', userId: { not: userId } },
        data: { role: 'AGENT' },
      });
    }

    const member = await prisma.callCenterMember.upsert({
      where: { callCenterId_userId: { callCenterId: id, userId } },
      create: { callCenterId: id, userId, role },
      update: { role, isActive: true },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/call-centers/[id]/members error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/call-centers/[id]/members?userId=xxx
 * Retire un membre du centre.
 */
export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Identifiant utilisateur requis' }, { status: 400 });
  }

  await prisma.callCenterMember.deleteMany({
    where: { callCenterId: id, userId },
  });

  return NextResponse.json({ success: true });
}
