import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { reveal } from '@/lib/sensitive';
import {
  avecNumeroUnique,
  estNumeroProvisoire,
  nextInvoiceNumber,
} from '@/lib/invoicing/numbering';
import {
  champsIdentiteFiges,
  statutVautEmission,
  verifierTransitionFacture,
} from '@/lib/invoicing/statuses';
import { lireCorpsJson, reponseCorpsInvalide, reponseErreurPrisma } from '@/lib/reponses-api';
import { desactiverLienPaiement } from '../liens-paiement';

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

  // `InvoicePayment.reference` est chiffrée à l'écriture (numéro de chèque,
  // identifiant de virement). Sans ce déchiffrement, l'écran affichait le
  // cryptogramme « v1:… » dès le premier rechargement de la page.
  return NextResponse.json({
    ...invoice,
    payments: reveal('InvoicePayment', invoice.payments),
  });
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const { id } = await params;
  const body = await lireCorpsJson(request);
  if (!body) return reponseCorpsInvalide();

  const facture = await prisma.invoice.findUnique({ where: { id } });
  if (!facture) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });

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

  // Le statut n'est plus recopié tel quel : sans ce contrôle, un simple
  // {"status":"PAID"} soldait une facture n'ayant rien encaissé.
  if ('status' in data) {
    const verdict = verifierTransitionFacture(facture, data.status);
    if (!verdict.ok) return NextResponse.json({ error: verdict.message }, { status: 400 });
  }

  // Une facture émise est une pièce comptable transmise : ses mentions
  // d'identité ne se réécrivent pas, elles se corrigent par un avoir.
  const figes = champsIdentiteFiges(facture, body);
  if (figes.length) {
    return NextResponse.json({
      error: `Facture déjà émise : ${figes.join(', ')} ne peuvent plus être modifiés. Émettez un avoir puis une nouvelle facture.`,
    }, { status: 400 });
  }

  // Passage du brouillon à l'émission : c'est ici, et seulement ici, que la
  // facture consomme un numéro de la séquence comptable. Annuler un brouillon
  // n'en consomme aucun.
  const doitNumeroter = statutVautEmission(data.status)
    && estNumeroProvisoire(facture.invoiceNumber);

  // La date d'émission est celle de l'émission réelle, pas celle du brouillon.
  if (doitNumeroter) data.issueDate = new Date();

  let invoice;
  try {
    invoice = await avecNumeroUnique({
      champ: 'invoiceNumber',
      generer: () => (doitNumeroter ? nextInvoiceNumber() : null),
      ecrire: (numero) => prisma.invoice.update({
        where: { id },
        data: numero ? { ...data, invoiceNumber: numero } : data,
        include: { lines: true, payments: true },
      }),
    });
  } catch (err) {
    // La facture lue plus haut peut avoir été supprimée entre-temps : P2025 doit
    // donner 404, pas 500. `avecNumeroUnique` ne rattrape que le P2002 sur le
    // numéro, tout le reste ressort ici.
    return reponseErreurPrisma(err, {
      contexte: 'PATCH /api/admin/invoices/[id]',
      introuvable: 'Facture introuvable',
      conflit: 'Numéro de facture déjà attribué',
    });
  }

  return NextResponse.json({
    ...invoice,
    payments: reveal('InvoicePayment', invoice.payments),
  });
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
  // Un brouillon ne porte qu'un numéro de travail (« BROUILLON-… ») : sa
  // suppression ne creuse aucun trou dans la séquence FAC-AAAA-NNNN.
  try {
    await prisma.invoice.delete({ where: { id } });
  } catch (err) {
    return reponseErreurPrisma(err, {
      contexte: 'DELETE /api/admin/invoices/[id]',
      introuvable: 'Facture introuvable',
    });
  }
  return NextResponse.json({ ok: true });
}
