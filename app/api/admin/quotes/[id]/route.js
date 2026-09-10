import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifierTransitionDevis } from '@/lib/invoicing/statuses';
import { lireCorpsJson, reponseCorpsInvalide, reponseErreurPrisma } from '@/lib/reponses-api';

export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      items: { orderBy: { position: 'asc' } },
      user: { select: { id: true, name: true, email: true } },
      application: { select: { id: true, companyName: true } },
    },
  });
  if (!quote) return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 });
  return NextResponse.json(quote);
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const { id } = await params;
  const body = await lireCorpsJson(request);
  if (!body) return reponseCorpsInvalide();

  const devis = await prisma.quote.findUnique({ where: { id } });
  if (!devis) return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 });

  // Champs modifiables
  const allowed = ['status', 'sentAt', 'acceptedAt', 'refusedAt', 'refusalReason', 'notes', 'paymentTerms'];
  const data = {};
  for (const k of allowed) if (k in body) data[k] = body[k];

  // La valeur du statut n'était jamais contrôlée : « BANANA » était stocké tel
  // quel et créait une catégorie fantôme dans les filtres, et un devis refusé
  // pouvait redevenir accepté.
  if ('status' in data) {
    const verdict = verifierTransitionDevis(devis, data.status);
    if (!verdict.ok) return NextResponse.json({ error: verdict.message }, { status: 400 });
  }

  if (body.status === 'SENT' && !data.sentAt) data.sentAt = new Date();
  if (body.status === 'ACCEPTED' && !data.acceptedAt) data.acceptedAt = new Date();
  if (body.status === 'REFUSED' && !data.refusedAt) data.refusedAt = new Date();
  if (data.sentAt && typeof data.sentAt === 'string') data.sentAt = new Date(data.sentAt);
  if (data.acceptedAt && typeof data.acceptedAt === 'string') data.acceptedAt = new Date(data.acceptedAt);
  if (data.refusedAt && typeof data.refusedAt === 'string') data.refusedAt = new Date(data.refusedAt);

  // Le `findUnique` ci-dessus ne met pas à l'abri d'une suppression concurrente :
  // entre la lecture et l'écriture, le devis peut avoir disparu. Sans ce catch,
  // le P2025 remontait en 500 et l'écran ne pouvait pas distinguer la
  // disparition de la ressource d'un incident serveur (constat ADM1-08).
  try {
    const quote = await prisma.quote.update({
      where: { id }, data, include: { items: true },
    });
    return NextResponse.json(quote);
  } catch (err) {
    return reponseErreurPrisma(err, {
      contexte: 'PATCH /api/admin/quotes/[id]',
      introuvable: 'Devis introuvable',
    });
  }
}
