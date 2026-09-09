import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readFileBuffer } from '@/lib/storage';

/**
 * GET /api/admin/documents/[id]/download
 *
 * Sert la pièce archivée. Le fichier transite par le serveur plutôt que via
 * une URL signée : un lien Cellar signé reste valable une heure et circule
 * hors de tout contrôle une fois copié, alors qu'une facture client n'a pas à
 * être lisible par qui détient l'URL.
 */

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const doc = await prisma.generatedDocument.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });

  let buffer;
  try {
    buffer = await readFileBuffer(doc.filePath);
  } catch (e) {
    console.error('[documents] lecture impossible :', doc.filePath, e.message);
    return NextResponse.json({ error: 'Fichier illisible dans le stockage' }, { status: 502 });
  }

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': doc.mimeType,
      'Content-Disposition': `attachment; filename="${doc.fileName}"`,
      'Cache-Control': 'no-store',
    },
  });
}
