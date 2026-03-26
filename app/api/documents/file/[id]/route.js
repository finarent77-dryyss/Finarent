import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { syncUser, isAdmin } from '@/lib/users';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * GET /api/documents/file/[id]
 * Sert un document de façon sécurisée — authentification requise, accès propriétaire ou admin.
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

    const dbUser = await syncUser(session.user);
    const adminAccess = await isAdmin(session.user);

    // Vérifier l'accès : propriétaire, admin, partenaire lié, ou assureur (pour RC_PRO)
    const isOwner = document.application.userId === dbUser?.id;
    const isPartnerLinked = dbUser?.role === 'PARTNER' && document.application.partnerId === dbUser?.partnerId;
    const isInsurerAccess = dbUser?.role === 'INSURER' && document.application.productType === 'RC_PRO';

    if (!isOwner && !adminAccess && !isPartnerLinked && !isInsurerAccess) {
      return new NextResponse('Accès non autorisé', { status: 403 });
    }

    const filePath = join(process.cwd(), 'private', 'uploads', document.fileUrl);
    const fileBuffer = await readFile(filePath);

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
