import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir, unlink, readFile } from 'fs/promises';
import path from 'path';

const useSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = useSupabase
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const BUCKET = 'docs-kyc';
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'private', 'uploads');

/**
 * Upload a file buffer to storage (Supabase if configured, else local)
 * @returns {Promise<{path: string, url: string}>}
 */
export async function uploadFile(buffer, filename, mimeType, applicationId) {
  const storagePath = `${applicationId}/${Date.now()}-${filename}`;

  if (useSupabase) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: mimeType, upsert: false });
    if (error) throw error;
    return { path: data.path, url: data.path }; // URL generated via signed URL on read
  }

  // Local fallback
  const fullPath = path.join(LOCAL_UPLOAD_DIR, applicationId);
  await mkdir(fullPath, { recursive: true });
  const filePath = path.join(fullPath, `${Date.now()}-${filename}`);
  await writeFile(filePath, buffer);
  return { path: filePath, url: `/private/uploads/${applicationId}/${path.basename(filePath)}` };
}

/**
 * Generate a signed URL for reading a file (Supabase) or return path (local)
 */
export async function getFileUrl(storagePath, expiresIn = 3600) {
  if (useSupabase) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  }
  return storagePath; // Local path
}

/**
 * Read a file (returns Buffer)
 */
export async function readFileBuffer(storagePath) {
  if (useSupabase) {
    const { data, error } = await supabase.storage.from(BUCKET).download(storagePath);
    if (error) throw error;
    return Buffer.from(await data.arrayBuffer());
  }
  return readFile(storagePath);
}

/**
 * Delete a file
 */
export async function deleteFile(storagePath) {
  if (useSupabase) {
    const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
    if (error) throw error;
    return;
  }
  try { await unlink(storagePath); } catch {}
}

export const storageMode = useSupabase ? 'supabase' : 'local';
