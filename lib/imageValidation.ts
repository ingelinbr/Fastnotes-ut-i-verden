export const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export function validateImage(asset: {
  fileSize?: number;
  mimeType?: string | null;
  fileName?: string | null;
}) {
  if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: 'Bildet er for stort. Maks størrelse er 15 MB.',
    };
  }

  const mimeType = asset.mimeType?.toLowerCase() ?? '';
  const fileName = asset.fileName?.toLowerCase() ?? '';

  const validMime = ALLOWED_MIME_TYPES.includes(mimeType);
  const validExt = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

  if (!validMime && !validExt) {
    return {
      valid: false,
      error: 'Ugyldig filformat. Kun JPG, PNG og WebP er tillatt.',
    };
  }

  return { valid: true, error: null };
}