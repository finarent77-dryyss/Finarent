import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { nextInvoiceNumber } from '@/lib/invoicing/numbering';

export async function GET(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const invoices = await prisma.invoice.findMany({
    where: status && status !== 'all' ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { lines: true, payments: true } },
      user: { select: { id: true, name: true, email: true } },
      application: { select: { id: true, companyName: true } },
    },
  });

  const counts = await prisma.invoice.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  return NextResponse.json({
    items: invoices,
    counts: counts.reduce((m, c) => ({ ...m, [c.status]: c._count._all }), {}),
  });
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  const {
    clientName, clientEmail, clientPhone, clientAddress, clientPostal, clientCity, clientSiret,
    userId, applicationId, dueDate, paymentTerms, notes,
    lines = [],
  } = body;

  if (!clientName) return NextResponse.json({ error: 'clientName requis' }, { status: 400 });

  // Calcul des totaux
  let totalHT = 0, totalTVA = 0;
  for (const l of lines) {
    const lineHT = (Number(l.quantity) || 1) * (Number(l.unitPrice) || 0);
    totalHT += lineHT;
    totalTVA += lineHT * ((Number(l.vatRate) || 0) / 100);
  }
  const totalTTC = Math.round((totalHT + totalTVA) * 100) / 100;

  const invoiceNumber = await nextInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      clientName, clientEmail, clientPhone, clientAddress, clientPostal, clientCity, clientSiret,
      userId: userId || null,
      applicationId: applicationId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      paymentTerms,
      notes,
      status: 'DRAFT',
      totalHT: Math.round(totalHT * 100) / 100,
      totalTVA: Math.round(totalTVA * 100) / 100,
      totalTTC,
      lines: {
        create: lines.map((l, i) => ({
          description: l.description,
          quantity: Number(l.quantity) || 1,
          unitPrice: Number(l.unitPrice) || 0,
          vatRate: Number(l.vatRate) || 20,
          position: i,
        })),
      },
    },
    include: { lines: true, payments: true },
  });

  return NextResponse.json(invoice, { status: 201 });
}
