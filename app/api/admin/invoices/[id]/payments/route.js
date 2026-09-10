import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { protect, reveal } from '@/lib/sensitive';
import { lireCorpsJson, reponseCorpsInvalide, reponseErreurPrisma } from '@/lib/reponses-api';

export async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await lireCorpsJson(request);
  if (!body) return reponseCorpsInvalide();
  const { amount, paymentMethod, reference, notes, paidAt } = body;

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
  }
  if (!paymentMethod) {
    return NextResponse.json({ error: 'Méthode requise' }, { status: 400 });
  }

  // Contrôles préalables hors transaction : une facture absente ou encore en
  // brouillon doit donner un 404 / 400 lisible, pas une exception levée au
  // milieu de la transaction (que Next rend en 500 générique).
  const existante = await prisma.invoice.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!existante) {
    return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
  }
  if (existante.status === 'DRAFT') {
    return NextResponse.json({
      error: 'Facture encore en brouillon : émettez-la avant d\'enregistrer un versement.',
    }, { status: 400 });
  }

  // Création + recalcul status en transaction
  let result;
  try {
    result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id },
        include: { payments: true },
      });
      if (!invoice) {
        // Disparue entre le contrôle ci-dessus et la transaction. On emprunte le
        // code Prisma « enregistrement introuvable » pour que le catch rende un
        // 404 plutôt qu'un 500 sur une Error nue.
        throw Object.assign(new Error('Facture introuvable'), { code: 'P2025' });
      }

      const payment = await tx.invoicePayment.create({
        data: protect('InvoicePayment', {
          invoiceId: id,
          amount: Number(amount),
          paymentMethod,
          reference,
          notes,
          paidAt: paidAt ? new Date(paidAt) : new Date(),
        }),
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

      return {
        payment: reveal('InvoicePayment', payment),
        invoice: { ...updated, payments: reveal('InvoicePayment', updated.payments) },
      };
    });
  } catch (err) {
    return reponseErreurPrisma(err, {
      contexte: 'POST /api/admin/invoices/[id]/payments',
      introuvable: 'Facture introuvable',
    });
  }

  return NextResponse.json(result, { status: 201 });
}
