import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/documents
 *
 * Registre de tous les documents produits par l'application : factures,
 * devis, contrats, récapitulatifs. Chaque ligne indique si la pièce a été
 * transmise au client et quand — c'est ce qui permet de répondre à « qu'est-ce
 * qu'on lui a envoyé, exactement ? » des mois après.
 *
 * Filtres : ?reference=FIN-2026-00412  ?kind=FACTURE  ?applicationId=...
 */

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');
  const kind = searchParams.get('kind');
  const applicationId = searchParams.get('applicationId');
  const q = searchParams.get('q')?.trim();
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10) || 100, 500);

  const where = {};
  if (reference) where.reference = reference;
  if (kind) where.kind = kind;
  if (applicationId) where.applicationId = applicationId;
  // Recherche libre : un numéro de dossier partiel, un numéro de facture ou
  // l'adresse du destinataire — les trois façons dont on cherche une pièce.
  if (q) {
    where.OR = [
      { reference: { contains: q, mode: 'insensitive' } },
      { fileName: { contains: q, mode: 'insensitive' } },
      { recipientEmail: { contains: q, mode: 'insensitive' } },
    ];
  }

  const documents = await prisma.generatedDocument.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      kind: true,
      reference: true,
      fileName: true,
      fileSize: true,
      mimeType: true,
      applicationId: true,
      invoiceId: true,
      quoteId: true,
      affiliateId: true,
      recipientEmail: true,
      emailSentAt: true,
      createdAt: true,
      // `filePath` et `checksum` restent hors réponse : le chemin de stockage
      // n'a pas à circuler côté client, le téléchargement passe par la route
      // dédiée qui revérifie les droits.
    },
  });

  return NextResponse.json({
    total: documents.length,
    documents: documents.map((d) => ({
      ...d,
      transmis: Boolean(d.emailSentAt),
      urlTelechargement: `/api/admin/documents/${d.id}/download`,
    })),
  });
}
