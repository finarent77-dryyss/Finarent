import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAdminActivity } from '@/lib/admin-activity-log';

export async function GET(_request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const { id } = await params;
  const prospect = await prisma.prospect.findUnique({
    where: { id },
    include: {
      events: { orderBy: { createdAt: 'desc' } },
      callCenter: { select: { id: true, name: true, code: true } },
      assignedAgent: { select: { id: true, name: true, email: true } },
      _count: { select: { events: true } },
    },
  });
  if (!prospect) return NextResponse.json({ error: 'Prospect introuvable' }, { status: 404 });
  return NextResponse.json(prospect);
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const { id } = await params;
  const body = await request.json();
  const allowed = ['status', 'notes', 'assignedToId', 'email', 'phone', 'name', 'company', 'callCenterId', 'assignedAgentId'];
  const data = {};
  for (const k of allowed) if (body[k] !== undefined) data[k] = body[k];
  if (data.status && !['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'].includes(data.status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  }
  // Normalise les chaînes vides en null pour les FK (désassignation)
  if (data.callCenterId === '') data.callCenterId = null;
  if (data.assignedAgentId === '') data.assignedAgentId = null;
  const prospect = await prisma.prospect.update({
    where: { id },
    data,
    include: {
      callCenter: { select: { id: true, name: true, code: true } },
      assignedAgent: { select: { id: true, name: true, email: true } },
    },
  });

  // Journalise les (ré)assignations centre / agent
  if (data.callCenterId !== undefined || data.assignedAgentId !== undefined) {
    await logAdminActivity({
      actorId: auth.dbUser?.id,
      module: 'crm',
      action: 'PROSPECT_ASSIGNED',
      entityType: 'Prospect',
      entityId: id,
      summary: `Prospect ${prospect.name || prospect.email || id} → ${prospect.callCenter?.name || 'aucun centre'}${prospect.assignedAgent ? ` / ${prospect.assignedAgent.name || prospect.assignedAgent.email}` : ''}`,
      details: { callCenterId: prospect.callCenterId, assignedAgentId: prospect.assignedAgentId },
      request,
    });
  }

  return NextResponse.json(prospect);
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const { id } = await params;
  const existing = await prisma.prospect.findUnique({ where: { id }, select: { name: true, email: true } });
  await prisma.prospect.delete({ where: { id } });
  await logAdminActivity({
    actorId: auth.dbUser?.id,
    module: 'crm',
    action: 'PROSPECT_DELETED',
    entityType: 'Prospect',
    entityId: id,
    summary: `Prospect supprimé : ${existing?.name || existing?.email || id}`,
    request,
  });
  return NextResponse.json({ ok: true });
}
