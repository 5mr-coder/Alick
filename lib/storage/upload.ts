import { createClient } from '@/lib/supabase/client';

export type MediaBucket = 'product-media' | 'blog-media';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB (matches bucket file_size_limit)

const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const STORAGE_NAME_REGEX = /^[a-z0-9][a-z0-9/_.-]{0,200}\.(jpe?g|png|webp)$/;

export function buildSanitizedMediaPath(
  bucket: MediaBucket,
  mimeType: string
): string {
  const ext = ALLOWED_MIME_TO_EXT[mimeType];
  if (!ext) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed.');
  }

  const folder = bucket === 'product-media' ? 'products' : 'blog';
  const id = crypto.randomUUID().toLowerCase();
  const path = `${folder}/${id}.${ext}`;

  if (!STORAGE_NAME_REGEX.test(path) || path.includes('..')) {
    throw new Error('Generated storage path failed sanitization.');
  }

  return path;
}

export async function uploadAdminMedia(
  file: File,
  bucket: MediaBucket
): Promise<string> {
  if (!file || file.size <= 0) {
    throw new Error('Please choose a non-empty image file.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Image must be 5MB or smaller.');
  }

  const ext = ALLOWED_MIME_TO_EXT[file.type];
  if (!ext) {
    throw new Error('Only JPEG, PNG, and WebP images are supported.');
  }

  const path = buildSanitizedMediaPath(bucket, file.type);
  const supabase = createClient();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Image upload failed.');
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
