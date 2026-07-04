import { writeFile, mkdir, unlink, readFile } from 'fs/promises';
import path from 'path';

/**
 * Adaptateur de stockage de fichiers.
 * Ordre de priorité : Clever Cloud Cellar (S3) → filesystem local (dev).
 *
 * Cellar (Clever Cloud) injecte automatiquement :
 *   CELLAR_ADDON_HOST, CELLAR_ADDON_KEY_ID, CELLAR_ADDON_KEY_SECRET
 * Le bucket doit être créé au préalable (cf. CELLAR_BUCKET).
 */

const cellarConfigured =
  process.env.CELLAR_ADDON_KEY_ID &&
  process.env.CELLAR_ADDON_KEY_SECRET &&
  process.env.CELLAR_ADDON_HOST;

const BUCKET = process.env.CELLAR_BUCKET || 'docs-kyc';
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'private', 'uploads');

export const storageMode = cellarConfigured ? 'cellar' : 'local';

/** Le mode courant sert-il les fichiers via URL signée (redirection) ? */
export const usesSignedUrl = storageMode === 'cellar';

/** Anti path-traversal : un identifiant de dossier ne doit contenir aucun séparateur. */
function assertSafeId(id) {
  if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error('Identifiant de dossier invalide');
  }
  return id;
}

// --- Client S3 / Cellar (lazy) ------------------------------------------------
let _s3Client = null;
async function getS3() {
  if (!_s3Client) {
    const { S3Client } = await import('@aws-sdk/client-s3');
    _s3Client = new S3Client({
      region: process.env.CELLAR_REGION || 'us-east-1',
      endpoint: `https://${process.env.CELLAR_ADDON_HOST}`,
      credentials: {
        accessKeyId: process.env.CELLAR_ADDON_KEY_ID,
        secretAccessKey: process.env.CELLAR_ADDON_KEY_SECRET,
      },
      forcePathStyle: true, // compatibilité Cellar (évite le virtual-host SSL wildcard)
    });
  }
  return _s3Client;
}

/**
 * Upload un buffer vers le stockage.
 * @returns {Promise<{path: string, url: string}>} path = clé/chemin à persister en base.
 */
export async function uploadFile(buffer, filename, mimeType, applicationId) {
  assertSafeId(applicationId);
  const key = `${applicationId}/${Date.now()}-${filename}`;

  if (storageMode === 'cellar') {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const s3 = await getS3();
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
    return { path: key, url: key }; // URL servie via URL signée à la lecture
  }

  // Fallback local (⚠️ éphémère sur Clever Cloud — dev uniquement)
  const fullPath = path.join(LOCAL_UPLOAD_DIR, applicationId);
  await mkdir(fullPath, { recursive: true });
  const filePath = path.join(fullPath, `${Date.now()}-${filename}`);
  await writeFile(filePath, buffer);
  return { path: filePath, url: `/private/uploads/${applicationId}/${path.basename(filePath)}` };
}

/**
 * Génère une URL signée temporaire pour lire un fichier (Cellar/Supabase),
 * ou retourne le chemin local.
 */
export async function getFileUrl(storagePath, expiresIn = 3600) {
  if (storageMode === 'cellar') {
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    const s3 = await getS3();
    return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: storagePath }), {
      expiresIn,
    });
  }

  return storagePath; // chemin local
}

/**
 * Lit un fichier et retourne un Buffer.
 */
export async function readFileBuffer(storagePath) {
  if (storageMode === 'cellar') {
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const s3 = await getS3();
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: storagePath }));
    return Buffer.from(await res.Body.transformToByteArray());
  }

  return readFile(storagePath);
}

/**
 * Supprime un fichier.
 */
export async function deleteFile(storagePath) {
  if (storageMode === 'cellar') {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const s3 = await getS3();
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: storagePath }));
    return;
  }

  try {
    await unlink(storagePath);
  } catch {}
}
