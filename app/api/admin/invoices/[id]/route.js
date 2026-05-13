import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      lines: { orderBy: { position: 'asc' } },
      payments: { orderBy: { paidAt: 'desc' } },
      creditNotes: true,
      user: { select: { id: true, name: true, email: true } },
      application: { select: { id: true, companyName: true } },
    },
  });

  if (!invoice) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const { id } = await params;
  const body = await request.json();

  // Champs autorisés en update
  const allowed = ['status', 'clientName', 'clientEmail', 'clientPhone', 'clientAddress',
    'clientPostal', 'clientCity', 'clientSiret', 'dueDate', 'paymentTerms', 'notes',
    'sentAt', 'sentTo', 'paymentMethod', 'archivedAt'];
  const data = {};
  for (const k of allowed) {
    if (k in body) data[k] = body[k];
  }
  if (data.dueDate) data.dueDate = new Date(data.dueDate);
  if (data.sentAt) data.sentAt = new Date(data.sentAt);

  const invoice = await prisma.invoice.update({
    where: { id },
    data,
    include: { lines: true, payments: true },
  });
  return NextResponse.json(invoice);
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const { id } = await params;

  const inv = await prisma.invoice.findUnique({ where: { id } });
  if (!inv) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
  if (inv.status !== 'DRAFT') {
    return NextResponse.json({ error: 'Seules les factures en brouillon peuvent être supprimées' }, { status: 400 });
  }
  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
