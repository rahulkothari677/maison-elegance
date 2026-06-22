import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { randomUUID } from "crypto";
import {
  isCloudinaryConfigured,
  uploadToCloudinary,
  extractPublicIdFromUrl,
  deleteFromCloudinary,
} from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fail fast if Cloudinary isn't configured
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Image uploads are not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment variables.",
      },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Use JPG, PNG, WebP, GIF, or AVIF." },
      { status: 400 }
    );
  }

  // Validate file size (max 10MB – Cloudinary free tier supports up to 100MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large. Max 10MB." },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate a unique public ID so we don't clash with existing uploads
    const uniqueId = randomUUID();
    const result = await uploadToCloudinary(buffer, {
      folder: "maison-elegance/products",
      publicId: uniqueId,
      tags: ["product", "admin-upload"],
    });

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
    });
  } catch (e: any) {
    console.error("[upload] Cloudinary upload failed:", e);
    return NextResponse.json(
      { error: e.message || "Upload failed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE – remove an image from Cloudinary by URL.
 * Body: { url: string }
 *
 * Called when admin clicks the X button to remove a product image.
 */
export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    const publicId = extractPublicIdFromUrl(url);
    if (!publicId) {
      // Not a Cloudinary URL – nothing to delete on the CDN
      return NextResponse.json({ ok: true, skipped: true });
    }

    await deleteFromCloudinary(publicId);
    return NextResponse.json({ ok: true, deleted: publicId });
  } catch (e: any) {
    console.error("[upload] Cloudinary delete failed:", e);
    return NextResponse.json(
      { error: e.message || "Delete failed" },
      { status: 500 }
    );
  }
}
