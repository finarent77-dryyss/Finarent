import { writeFile, mkdir, unlink, readFile } from 'fs/promises';
import path from 'path';

/**
 * Adaptateur de stockage de fichiers.
 * Ordre de priorité : Clever Cloud Cellar (S3) → Supabase Storage → filesystem local.
 *
 * Cellar (Clever Cloud) injecte automatiquement :
 *   CELLAR_ADDON_HOST, CELLAR_ADDON_KEY_ID, CELLAR_ADDON_KEY_SECRET
 * Le bucket doit être créé au préalable (cf. CELLAR_BUCKET).
 */

const cellarConfigured =
  process.env.CELLAR_ADDON_KEY_ID &&
  process.env.CELLAR_ADDON_KEY_SECRET &&
  process.env.CELLAR_ADDON_HOST;

const supabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET = process.env.CELLAR_BUCKET || 'docs-kyc';
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'private', 'uploads');

export const storageMode = cellarConfigured
  ? 'cellar'
  : supabaseConfigured
    ? 'supabase'
    : 'local';

/** Le mode courant sert-il les fichiers via URL signée (redirection) ? */
export const usesSignedUrl = storageMode === 'cellar' || storageMode === 'supabase';

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

// --- Client Supabase (lazy) ---------------------------------------------------
let _supabase = null;
async function getSupabase() {
  if (!_supabase) {
    const { createClient } = await import('@supabase/supabase-js');
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }
  return _supabase;
}

/**
 * Upload un buffer vers le stockage.
 * @returns {Promise<{path: string, url: string}>} path = clé/chemin à persister en base.
 */
export async function uploadFile(buffer, filename, mimeType, applicationId) {
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

  if (storageMode === 'supabase') {
    const supabase = await getSupabase();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(key, buffer, { contentType: mimeType, upsert: false });
    if (error) throw error;
    return { path: data.path, url: data.path };
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

  if (storageMode === 'supabase') {
    const supabase = await getSupabase();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, expiresIn);
    if (error) throw error;
    return data.signedUrl;
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

  if (storageMode === 'supabase') {
    const supabase = await getSupabase();
    const { data, error } = await supabase.storage.from(BUCKET).download(storagePath);
    if (error) throw error;
    return Buffer.from(await data.arrayBuffer());
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

  if (storageMode === 'supabase') {
    const supabase = await getSupabase();
    const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
    if (error) throw error;
    return;
  }

  try {
    await unlink(storagePath);
  } catch {}
}
