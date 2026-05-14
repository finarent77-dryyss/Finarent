import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const { id } = await params;
  const prospect = await prisma.prospect.findUnique({
    where: { id },
    include: {
      events: { orderBy: { createdAt: 'desc' } },
      _count: { select: { events: true } },
    },
  });
  if (!prospect) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(prospect);
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const { id } = await params;
  const body = await request.json();
  const allowed = ['status', 'notes', 'assignedToId', 'email', 'phone', 'name', 'company'];
  const data = {};
  for (const k of allowed) if (body[k] !== undefined) data[k] = body[k];
  if (data.status && !['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'].includes(data.status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  }
  const prospect = await prisma.prospect.update({ where: { id }, data });
  return NextResponse.json(prospect);
}

export async function DELETE(_request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const { id } = await params;
  await prisma.prospect.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
