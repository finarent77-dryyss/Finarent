import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateContractPDF } from '@/lib/pdf/contract';
import { empreinteDocument, genererJeton, DUREE_VALIDITE_MS } from '@/lib/signature';
import { offreSignable, STATUTS_OFFRE_SIGNABLE } from '@/lib/acces-dossier';

/**
 * POST /api/applications/[id]/sign
 *
 * Point d'entrée du bouton « signer » de l'espace client. Ouvre un parcours de
 * signature et renvoie l'URL à suivre.
 *
 * Cette route se contentait auparavant de basculer le dossier en SIGNED et
 * d'écrire « Signature électronique acceptée par le client » dans l'historique
 * — sans document, sans horodatage, sans preuve d'aucune sorte. Un contrat
 * marqué signé n'avait donc aucune valeur probante, ce qui est intenable pour
 * un intermédiaire soumis à l'ACPR dont les CGV invoquent eIDAS.
 *
 * La signature elle-même est recueillie sur /espace/sign/[token], et le dossier
 * ne passe en SIGNED qu'une fois la preuve constituée.
 */
export async function POST(request, { params }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const application = await prisma.application.findFirst({
    where: { id, userId: auth.dbUser.id },
    include: { user: true },
  });

  if (!application) {
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 });
  }
  if (!['QUOTE_ACCEPTED', 'PENDING_SIGNATURE'].includes(application.status)) {
    return NextResponse.json(
      { error: 'Le dossier doit être à l\'étape de signature.' },
      { status: 409 },
    );
  }

  // Le contrat signé est celui de l'offre acceptée : sans offre, rien à signer.
  //
  // Le filtre précédent — `status: { in: ['ACCEPTED', 'SENT', 'SIGNED'] }` sans
  // aucun contrôle d'`expiresAt` — laissait passer deux cas : une offre déjà
  // `SIGNED`, qui rouvrait donc un second parcours de signature sur un contrat
  // déjà paraphé, et une offre périmée. C'est le même relâchement que celui
  // corrigé sur `offers/[id]/sign` ; la règle est donc lue au même endroit
  // (`offreSignable`) plutôt que réécrite ici sous une autre forme.
  const offresCandidates = await prisma.offer.findMany({
    where: { applicationId: id, status: { in: [...STATUTS_OFFRE_SIGNABLE] } },
    orderBy: { acceptedAt: 'desc' },
  });
  const offer = offresCandidates.find((candidate) => offreSignable(candidate));

  if (!offer) {
    return NextResponse.json(
      { error: "Aucune offre en cours de validité sur ce dossier. Votre conseiller doit d'abord vous en transmettre une." },
      { status: 409 },
    );
  }

  try {
    const pdf = generateContractPDF({ offer, application, user: application.user });
    const documentHash = empreinteDocument(pdf);

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
            requestedToId: application.userId,
            requestedById: offer.createdBy || application.userId,
            provider: 'manual',
            token: genererJeton(),
            expiresAt: new Date(Date.now() + DUREE_VALIDITE_MS),
            documentHash,
          },
        });

    const signUrl = `/espace/sign/${demande.token}`;

    if (application.status !== 'PENDING_SIGNATURE') {
      await prisma.$transaction([
        prisma.application.update({
          where: { id },
          data: { status: 'PENDING_SIGNATURE' },
        }),
        prisma.statusHistory.create({
          data: {
            applicationId: id,
            changedById: auth.dbUser.id,
            fromStatus: application.status,
            toStatus: 'PENDING_SIGNATURE',
            comment: 'Parcours de signature électronique ouvert par le client',
          },
        }),
      ]);
    }

    await prisma.offer.update({
      where: { id: offer.id },
      data: { signatureUrl: signUrl },
    });

    return NextResponse.json({ success: true, signUrl, expiresAt: demande.expiresAt });
  } catch (error) {
    console.error('[signature] ouverture du parcours impossible :', error);
    return NextResponse.json(
      { error: "Le parcours de signature n'a pas pu être ouvert. Réessayez." },
      { status: 500 },
    );
  }
}
