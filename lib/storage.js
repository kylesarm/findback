export const ITEM_IMAGES_BUCKET = "item-images";
export const AVATARS_BUCKET = "avatars";
export const ITEM_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = Object.freeze(["image/jpeg", "image/png", "image/webp"]);

const extensions = Object.freeze({
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
});

export function getPublicImageUrl(bucket, path) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl || !path) return null;

  const encodedPath = String(path).split("/").map(encodeURIComponent).join("/");
  return `${baseUrl}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

export async function validateImageFile(file, maximumBytes) {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return { file: null };
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { error: "Choose a JPEG, PNG, or WebP image." };
  }

  if (file.size > maximumBytes) {
    return { error: `The image must be ${Math.round(maximumBytes / 1024 / 1024)} MB or smaller.` };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  const isWebp = bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  const signatureMatches = (file.type === "image/jpeg" && isJpeg) || (file.type === "image/png" && isPng) || (file.type === "image/webp" && isWebp);

  if (!signatureMatches) {
    return { error: "The selected file does not appear to be a valid image." };
  }

  return { file, bytes, extension: extensions[file.type] };
}

export function createOwnedImagePath(userId, extension, resourceId = null) {
  const resourceFolder = resourceId ? `${resourceId}/` : "";
  return `${userId}/${resourceFolder}${crypto.randomUUID()}.${extension}`;
}

export function pathBelongsToUser(path, userId) {
  return Boolean(path && userId && String(path).split("/")[0] === userId);
}
