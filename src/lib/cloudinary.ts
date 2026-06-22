import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary configuration.
 *
 * Env vars expected (set them in Vercel → Settings → Environment Variables):
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *
 * If any are missing, isCloudinaryConfigured() returns false and the upload
 * route returns a friendly error instead of crashing.
 */
let configured = false;

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // always serve over HTTPS
  });
  configured = true;
}

export function isCloudinaryConfigured() {
  return configured;
}

export { cloudinary };

/**
 * Upload a Buffer to Cloudinary and return the secure URL.
 *
 * Options:
 *   folder  – Cloudinary folder to organize uploads (e.g. "maison/products")
 *   tags    – array of string tags for searchability in Cloudinary dashboard
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: { folder?: string; tags?: string[]; publicId?: string } = {}
): Promise<{
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}> {
  if (!configured) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment."
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "maison-elegance",
        tags: options.tags?.join(",") || undefined,
        public_id: options.publicId,
        resource_type: "image",
        // Auto-tag with upload date for easy cleanup
        context: "uploaded_at=" + new Date().toISOString(),
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({
          url: result!.secure_url,
          publicId: result!.public_id,
          width: result!.width,
          height: result!.height,
          bytes: result!.bytes,
          format: result!.format,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Delete an image from Cloudinary by its public ID.
 * Useful when admin removes a product image.
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!configured) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

/**
 * Extract the public_id from a Cloudinary URL.
 * Example: https://res.cloudinary.com/mycloud/image/upload/v123/maison/abc.jpg → "maison/abc"
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const match = url.match(
      /\/upload\/(?:v\d+\/)?(.+)\.(?:jpg|jpeg|png|webp|gif|avif)$/i
    );
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
