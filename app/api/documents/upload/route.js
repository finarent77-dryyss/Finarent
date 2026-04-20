import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/storage';
import { syncUser, isAdmin } from '@/lib/users';

const TYPE_MAP = { kbis: 'KBIS', rib: 'RIB', cni: 'CNI', bilan: 'BILAN', contrat: 'CONTRAT', autre: 'AUTRE' };

/** Types MIME autorisés */
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

/** Taille max : 10 Mo */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const data = await request.formData();
    const file = data.get('file');
    const applicationId = data.get('applicationId') || data.get('demandeId');
    const typeRaw = (data.get('type') || 'autre').toLowerCase();
    const docType = TYPE_MAP[typeRaw] || 'AUTRE';

    if (!file || !applicationId) {
      return NextResponse.json({ error: 'Fichier ou ID de dossier manquant' }, { status: 400 });
    }

    // Validation taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo)' }, { status: 400 });
    }

    // Validation MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Formats acceptés : PDF, JPG, PNG' },
        { status: 400 }
      );
    }

    // Validation extension de fichier (double check avec MIME)
    const ext = (file.name || '').split('.').pop()?.toLowerCase();
    const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png']);
    if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: 'Extension de fichier non autorisée' },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 });
    }

    const dbUser = await syncUser(session.user);
    const adminAccess = await isAdmin(session.user);

    if (application.userId !== dbUser.id && !adminAccess) {
      return NextResponse.json({ error: 'Accès non autorisé à ce dossier' }, { status: 403 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Stockage via l'adaptateur (Supabase si configuré, sinon local)
    const stored = await uploadFile(buffer, sanitizedFilename, file.type, applicationId);

    const document = await prisma.document.create({
      data: {
        applicationId,
        uploadedBy: dbUser.id,
        type: docType,
        fileName: file.name,
        fileUrl: stored.path, // chemin du storage (Supabase) ou chemin complet local
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json({
      success: true,
      document: {
        ...document,
        path: `/api/documents/file/${document.id}`,
        originalName: document.fileName,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}
