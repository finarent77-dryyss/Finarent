import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { syncUser, isAdmin } from '@/lib/users';
import { getFileUrl, readFileBuffer, usesSignedUrl } from '@/lib/storage';
import { logDocumentAccess } from '@/lib/audit';

/**
 * GET /api/documents/file/[id]
 * Sert un document de façon sécurisée — authentification requise, accès propriétaire ou admin.
 * - Mode Supabase : redirige (302) vers une URL signée temporaire.
 * - Mode local : streame le fichier en réponse directe.
 */
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: { application: { select: { userId: true, partnerId: true, productType: true } } },
    });

    if (!document) {
      return new NextResponse('Document introuvable', { status: 404 });
    }

    // Document soft-deleted : interdiction d'accès même pour les ayants-droit
    if (document.deletedAt) {
      return new NextResponse('Document supprimé', { status: 410 });
    }

    const dbUser = await syncUser(session.user);
    const adminAccess = await isAdmin(session.user);

    // Vérifier l'accès : propriétaire, admin, partenaire lié, ou assureur (pour RC_PRO)
    const isOwner = document.application.userId === dbUser?.id;
    const isPartnerLinked = dbUser?.role === 'PARTNER' && document.application.partnerId === dbUser?.partnerId;
    const isInsurerAccess = dbUser?.role === 'INSURER' && document.application.productType === 'RC_PRO';

    if (!isOwner && !adminAccess && !isPartnerLinked && !isInsurerAccess) {
      return new NextResponse('Accès non autorisé', { status: 403 });
    }

    // Audit trail RGPD : qui consulte quoi ?
    await logDocumentAccess({
      documentId: id,
      accessedById: dbUser?.id,
      action: 'VIEW',
      request,
    });

    // Cellar / Supabase : redirection vers URL signée temporaire
    if (usesSignedUrl) {
      const signedUrl = await getFileUrl(document.fileUrl, 3600);
      return NextResponse.redirect(signedUrl, 302);
    }

    // Local : lecture buffer et streaming
    const fileBuffer = await readFileBuffer(document.fileUrl);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': document.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${document.fileName}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    console.error('Document serve error:', err);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
