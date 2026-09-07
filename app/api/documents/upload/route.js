import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/storage';
import { syncUser, isAdmin } from '@/lib/users';
import { logDocumentAccess } from '@/lib/audit';
import { sendDocumentReceived } from '@/lib/email';
import { sniffMatchesMime } from '@/lib/file-signature';

const TYPE_MAP = { kbis: 'KBIS', rib: 'RIB', cni: 'CNI', bilan: 'BILAN', contrat: 'CONTRAT', autre: 'AUTRE' };

/** Types MIME autorisés */
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic', // photos prises avec un iPhone : format par defaut depuis iOS 11
  'image/heif',
  'image/webp',
]);

const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'heic', 'heif', 'webp']);

/** Repli quand le navigateur n'envoie aucun type MIME (gestionnaires de fichiers Android, partage iOS). */
const EXT_TO_MIME = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
  heif: 'image/heif',
  webp: 'image/webp',
};

const FORMATS_LABEL = 'PDF, JPG, PNG, HEIC, WEBP';

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

    // L'extension fait foi : file.type est absent sur plusieurs navigateurs mobiles.
    const ext = (file.name || '').split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `Format non autorisé. Formats acceptés : ${FORMATS_LABEL}` },
        { status: 400 }
      );
    }

    // Type retenu : celui du navigateur s'il est exploitable, sinon deduit de l'extension.
    const mimeType = ALLOWED_MIME_TYPES.has(file.type) ? file.type : EXT_TO_MIME[ext];
    if (!mimeType) {
      return NextResponse.json(
        { error: `Format non autorisé. Formats acceptés : ${FORMATS_LABEL}` },
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

    // Vérification magic-bytes : le contenu réel doit correspondre au MIME déclaré
    if (!sniffMatchesMime(buffer, mimeType)) {
      return NextResponse.json(
        { error: 'Le contenu du fichier ne correspond pas à son type déclaré' },
        { status: 400 }
      );
    }

    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Stockage via l'adaptateur (Supabase si configuré, sinon local)
    const stored = await uploadFile(buffer, sanitizedFilename, mimeType, applicationId);

    const document = await prisma.document.create({
      data: {
        applicationId,
        uploadedById: dbUser.id,
        type: docType,
        fileName: file.name,
        fileUrl: stored.path, // chemin du storage (Supabase) ou chemin complet local
        fileSize: file.size,
        mimeType,
      },
    });

    // Audit trail RGPD
    await logDocumentAccess({
      documentId: document.id,
      accessedById: dbUser.id,
      action: 'UPLOAD',
      request,
    });

    // Notification e-mail confirmation document reçu (échec silencieux)
    if (application.user?.email) {
      sendDocumentReceived({
        to: application.user.email,
        fileName: file.name,
        documentType: docType,
        reference: application.id.slice(0, 8).toUpperCase(),
      }).catch((e) => console.warn('sendDocumentReceived failed:', e.message));
    }

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
    // Erreurs typiques :
    // - Supabase non configuré + filesystem read-only (Vercel) → EROFS / EACCES
    // - Supabase mal configuré → "Invalid API key"
    const msg = error?.message || '';
    if (msg.includes('EROFS') || msg.includes('EACCES') || msg.includes('read-only')) {
      return NextResponse.json(
        { error: "Le stockage des documents n'est pas configuré sur ce serveur. Contactez l'administrateur." },
        { status: 500 },
      );
    }
    if (msg.includes('Invalid API key') || msg.includes('bucket') || msg.includes('storage')) {
      return NextResponse.json(
        { error: 'Erreur de stockage Supabase : ' + msg.slice(0, 100) },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: 'Erreur lors du téléversement : ' + msg.slice(0, 100) }, { status: 500 });
  }
}
