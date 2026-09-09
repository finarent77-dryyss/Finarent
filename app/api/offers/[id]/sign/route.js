import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateContractPDF } from '@/lib/pdf/contract';
import { empreinteDocument, genererJeton, DUREE_VALIDITE_MS } from '@/lib/signature';
import {
  estProprietaireDossier,
  offreSignable,
  STATUTS_OFFRE_SIGNABLE,
} from '@/lib/acces-dossier';

export async function POST(request, { params }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { application: { include: { user: true } } },
  });

  if (!offer) return NextResponse.json({ error: 'Offre introuvable' }, { status: 404 });
  if (!estProprietaireDossier(auth.dbUser, offer.application)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  // La propriété ne suffit pas : la route ne contrôlait ni le statut ni
  // l'échéance de l'offre. Un client pouvait donc signer un brouillon jamais
  // transmis, une offre refusée ou une offre périmée — et la signature crée un
  // `Document` de type CONTRAT que plus personne, pas même un administrateur,
  // ne peut supprimer. Le contrôle est celui de `applications/[id]/sign`.
  if (!offreSignable(offer)) {
    const message = STATUTS_OFFRE_SIGNABLE.includes(String(offer.status))
      ? 'Cette offre a expiré : demandez à votre conseiller de vous en transmettre une nouvelle.'
      : "Cette offre n'est pas au stade de la signature.";
    return NextResponse.json(
      { error: message, statutsAttendus: STATUTS_OFFRE_SIGNABLE },
      { status: 409 },
    );
  }

  // Le contrat est figé en PDF et son empreinte enregistrée : c'est elle qui
  // permettra de prouver, au moment de la signature, que le document n'a pas
  // changé entre l'envoi et le paraphe. L'ancienne version envoyait du HTML —
  // impossible à figer, et refusé par tous les prestataires de signature.
  const pdf = generateContractPDF({
    offer,
    application: offer.application,
    user: offer.application.user,
  });
  const documentHash = empreinteDocument(pdf);

  try {
    // Une demande encore ouverte est réutilisée plutôt que dupliquée : deux
    // liens valides pour un même contrat, c'est deux signatures possibles.
    const existante = await prisma.signatureRequest.findFirst({
      where: {
        documentType: 'OFFER',
        documentId: offer.id,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    });

    const demande = existante
      ? await prisma.signatureRequest.update({
          where: { id: existante.id },
          data: { documentHash },
        })
      : await prisma.signatureRequest.create({
          data: {
            documentType: 'OFFER',
            documentId: offer.id,
            requestedToId: offer.application.userId,
            requestedById: offer.createdBy || offer.application.userId,
            provider: 'manual',
            token: genererJeton(),
            expiresAt: new Date(Date.now() + DUREE_VALIDITE_MS),
            documentHash,
          },
        });

    const signUrl = `/espace/sign/${demande.token}`;

    await prisma.$transaction([
      prisma.offer.update({
        where: { id },
        data: { signatureUrl: signUrl, sentAt: new Date() },
      }),
      prisma.application.update({
        where: { id: offer.applicationId },
        data: { status: 'PENDING_SIGNATURE' },
      }),
    ]);

    return NextResponse.json({ signUrl, expiresAt: demande.expiresAt });
  } catch (err) {
    console.error('[signature] création de la demande impossible :', err);
    return NextResponse.json(
      { error: 'La demande de signature n\'a pas pu être créée.' },
      { status: 500 },
    );
  }
}
