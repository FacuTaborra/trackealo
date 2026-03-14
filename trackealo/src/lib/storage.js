import { supabase } from './supabase';

const BUCKET = 'receipts';
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

/**
 * Upload a receipt image to Supabase Storage
 * @param {string} userId
 * @param {File} file
 * @returns {Promise<string>} Storage path
 */
export async function uploadReceipt(userId, file) {
  if (!supabase) throw new Error('Supabase not configured');

  if (file.size > MAX_SIZE) {
    throw new Error('El archivo es muy grande (máx 5MB)');
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Solo se permiten imágenes (JPG, PNG, WebP, HEIC)');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;
  return path;
}

/**
 * Get a signed URL for viewing a receipt (1 hour expiry)
 * @param {string} path - Storage path
 * @returns {Promise<string>} Signed URL
 */
export async function getReceiptUrl(path) {
  if (!supabase || !path) return null;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600);

  if (error) throw error;
  return data?.signedUrl || null;
}

/**
 * Delete a receipt from storage
 * @param {string} path - Storage path
 */
export async function deleteReceipt(path) {
  if (!supabase || !path) return;

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path]);

  if (error) throw error;
}
