import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { avecNumeroUnique, numeroProvisoire } from '@/lib/invoicing/numbering';
import { lireCorpsJson, reponseCorpsInvalide } from '@/lib/reponses-api';
import { reponseSaisieInvalide, validerLignes } from './validation-facturation';

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

  // ADM2-10 : `await request.json()` hors `try` faisait remonter un
  // `SyntaxError` au runtime sur un corps vide — 500 sans corps, alors que la
  // route sait répondre 400.
  const body = await lireCorpsJson(request);
  if (!body) return reponseCorpsInvalide();

  const {
    clientName, clientEmail, clientPhone, clientAddress, clientPostal, clientCity, clientSiret,
    userId, applicationId, dueDate, paymentTerms, notes,
    lines = [],
  } = body;

  if (typeof clientName !== 'string' || !clientName.trim()) {
    return NextResponse.json({ error: 'Nom du client requis' }, { status: 400 });
  }

  // ADM2-11 : quantités, prix et TVA étaient repris par `Number(x) || défaut`,
  // qui laisse passer un prix négatif et une quantité nulle, et acceptait une
  // facture sans aucune ligne.
  const verdict = validerLignes(lines, {
    nomLigne: 'Ligne',
    messageVide: 'Une facture doit comporter au moins une ligne de facturation.',
    champPrix: 'unitPrice',
    avecTva: true,
  });
  if (!verdict.ok) return reponseSaisieInvalide(verdict.message);

  // Calcul des totaux, sur les valeurs déjà converties et bornées.
  let totalHT = 0, totalTVA = 0;
  for (const ligne of verdict.lignes) {
    const ligneHT = ligne.quantite * ligne.prix;
    totalHT += ligneHT;
    totalTVA += ligneHT * (ligne.tauxTva / 100);
  }
  const totalTTC = Math.round((totalHT + totalTVA) * 100) / 100;

  // Une facture naît en brouillon : elle ne consomme donc PAS de numéro de la
  // séquence comptable, seulement un numéro de travail. Le numéro définitif
  // FAC-AAAA-NNNN est attribué à l'émission (PATCH vers ISSUED). Sans cela,
  // supprimer un brouillon laissait un trou définitif dans une séquence qui
  // doit rester continue.
  const invoice = await avecNumeroUnique({
    champ: 'invoiceNumber',
    generer: () => numeroProvisoire(),
    ecrire: (invoiceNumber) => prisma.invoice.create({
      data: {
        invoiceNumber,
        clientName: clientName.trim(),
        clientEmail, clientPhone, clientAddress, clientPostal, clientCity, clientSiret,
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
          create: verdict.lignes.map((ligne) => ({
            description: ligne.description,
            quantity: ligne.quantite,
            unitPrice: ligne.prix,
            vatRate: ligne.tauxTva,
            position: ligne.position,
          })),
        },
      },
      include: { lines: true, payments: true },
    }),
  });

  return NextResponse.json(invoice, { status: 201 });
}
