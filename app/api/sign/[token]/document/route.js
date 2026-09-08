import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@auth0/nextjs-auth0';
import { syncUser } from '@/lib/users';
import { readFileBuffer } from '@/lib/storage';
import { generateContractPDF } from '@/lib/pdf/contract';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sign/[token]/document
 * Sert le contrat en PDF : la version archivée si elle existe (document signé,
 * c'est la pièce probante), sinon le contrat régénéré à l'identique.
 *
 * Le jeton ne suffit pas à ouvrir le document : il faut être connecté et être
 * le destinataire. Un lien de signature qui traîne dans une boîte mail ne doit
 * pas exposer les conditions financières d'un tiers.
 */
export async function GET(request, { params }) {
  const { token } = await params;

  const demande = await prisma.signatureRequest.findUnique({ where: { token } });
  if (!demande) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });

  const dbUser = await syncUser(session.user);
  if (dbUser.id !== demande.requestedToId) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  let pdf;
  if (demande.documentPath) {
    try {
      pdf = await readFileBuffer(demande.documentPath);
    } catch (e) {
      console.error('[signature] archive illisible :', e.message);
    }
  }

  if (!pdf) {
    const offer = await prisma.offer.findUnique({
      where: { id: demande.documentId },
      include: { application: { include: { user: true } } },
    });
    if (!offer) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });

    pdf = generateContractPDF({
      offer,
      application: offer.application,
      user: offer.application?.user || dbUser,
    });
  }

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="contrat-finarent.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
