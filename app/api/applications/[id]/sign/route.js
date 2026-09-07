import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/applications/[id]/sign
 *
 * Cette route faisait passer le dossier de QUOTE_ACCEPTED a SIGNED et
 * inscrivait « Signature électronique acceptée par le client » dans
 * l'historique — sans document, sans horodatage, sans prestataire, sans
 * la moindre preuve. Un contrat marque « signe » n'avait donc aucune
 * valeur probante, ce qui est intenable pour un intermediaire soumis a
 * l'ACPR dont les CGV invoquent eIDAS.
 *
 * Le passage en SIGNED est desormais conditionne a la presence d'un
 * prestataire de signature configure. A defaut, on refuse explicitement
 * plutot que de produire une fiction juridique.
 */
export async function POST(request, { params }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (!process.env.YOUSIGN_API_KEY?.trim()) {
    console.error(
      '[signature] Tentative de signature refusée : YOUSIGN_API_KEY non configurée.',
    );
    return NextResponse.json(
      {
        error:
          "La signature électronique n'est pas disponible pour le moment. " +
          'Votre conseiller va vous recontacter pour finaliser le dossier.',
      },
      { status: 503 },
    );
  }

  const { id } = await params;

  const app = await prisma.application.findFirst({
    where: { id, userId: auth.dbUser.id, status: 'QUOTE_ACCEPTED' },
  });

  if (!app) {
    return NextResponse.json(
      { error: 'Dossier introuvable ou statut incorrect' },
      { status: 404 },
    );
  }

  // Le dossier attend la signature : c'est le prestataire qui la constatera.
  const updated = await prisma.application.update({
    where: { id },
    data: { status: 'PENDING_SIGNATURE' },
  });

  await prisma.statusHistory.create({
    data: {
      applicationId: id,
      changedById: auth.dbUser.id,
      fromStatus: 'QUOTE_ACCEPTED',
      toStatus: 'PENDING_SIGNATURE',
      comment: 'Parcours de signature électronique lancé par le client',
    },
  });

  return NextResponse.json({ success: true, status: updated.status });
}
