import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();
  const { amount, paymentMethod, reference, notes, paidAt } = body;

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
  }
  if (!paymentMethod) {
    return NextResponse.json({ error: 'Méthode requise' }, { status: 400 });
  }

  // Création + recalcul status en transaction
  const result = await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id },
      include: { payments: true },
    });
    if (!invoice) throw new Error('Facture introuvable');

    const payment = await tx.invoicePayment.create({
      data: {
        invoiceId: id,
        amount: Number(amount),
        paymentMethod,
        reference,
        notes,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
      },
    });

    const newPaidAmount = invoice.payments.reduce((s, p) => s + p.amount, 0) + Number(amount);
    let newStatus = invoice.status;
    let paidAtAll = invoice.paidAt;
    if (newPaidAmount >= invoice.totalTTC) {
      newStatus = 'PAID';
      paidAtAll = paidAtAll || new Date();
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIAL';
    }

    const updated = await tx.invoice.update({
      where: { id },
      data: { paidAmount: newPaidAmount, status: newStatus, paidAt: paidAtAll },
      include: { lines: true, payments: { orderBy: { paidAt: 'desc' } } },
    });

    return { payment, invoice: updated };
  });

  return NextResponse.json(result, { status: 201 });
}
