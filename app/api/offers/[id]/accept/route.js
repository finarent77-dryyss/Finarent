import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  estAdmin,
  estProprietaireDossier,
  offreAcceptable,
  offreExpiree,
} from '@/lib/acces-dossier';

/**
 * POST /api/offers/[id]/accept
 * Le client accepte son offre (propriétaire de l'application uniquement).
 */
export async function POST(request, { params }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const offer = await prisma.offer.findUnique({
    where: { id },
    include: {
      application: { select: { id: true, userId: true } },
    },
  });

  if (!offer) {
    return NextResponse.json({ error: 'Offre introuvable' }, { status: 404 });
  }

  // Vérification de propriété : seul le client de l'application peut accepter.
  // `estProprietaireDossier` refuse le cas d'un dossier anonyme (`userId` nul).
  if (!estProprietaireDossier(auth.dbUser, offer.application) && !estAdmin(auth.dbUser)) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }

  // Vérifier que l'offre est encore acceptable. La liste de refus précédente
  // laissait passer `DRAFT` : une offre encore en préparation, jamais transmise,
  // pouvait être acceptée par le client puis signée.
  if (offer.status === 'ACCEPTED' || offer.status === 'SIGNED') {
    return NextResponse.json({ error: 'Offre déjà acceptée' }, { status: 400 });
  }
  if (offreExpiree(offer)) {
    if (offer.status !== 'EXPIRED') {
      await prisma.offer.update({ where: { id }, data: { status: 'EXPIRED' } });
    }
    return NextResponse.json({ error: 'Offre expirée' }, { status: 400 });
  }
  if (!offreAcceptable(offer)) {
    return NextResponse.json({ error: 'Offre non acceptable' }, { status: 400 });
  }

  const updated = await prisma.offer.update({
    where: { id },
    data: {
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
  });

  // Également faire évoluer le statut de la demande vers QUOTE_ACCEPTED
  await prisma.application.update({
    where: { id: offer.applicationId },
    data: { status: 'QUOTE_ACCEPTED' },
  });

  return NextResponse.json(updated);
}
