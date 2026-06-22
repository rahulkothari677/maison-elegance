import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeInput } from "@/lib/security";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const reviews = await db.review.findMany({
    where: { productId: product.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reviews });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const body = await req.json();
  const { rating, title, body: reviewBody, images } = body;

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 }
    );
  }

  const user = session.user as any;
  const existing = await db.review.findUnique({
    where: {
      productId_userId: {
        productId: product.id,
        userId: user.id,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You have already reviewed this product" },
      { status: 400 }
    );
  }

  const review = await db.review.create({
    data: {
      productId: product.id,
      userId: user.id,
      authorName: sanitizeInput(user.name || "Anonymous"),
      rating: parseInt(rating),
      title: title ? sanitizeInput(title) : null,
      body: sanitizeInput(reviewBody),
      images: images && images.length > 0 ? JSON.stringify(images) : null,
      verified: false,
    },
  });

  // Update product rating + review count
  const allReviews = await db.review.findMany({
    where: { productId: product.id },
    select: { rating: true },
  });
  const avgRating =
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await db.product.update({
    where: { id: product.id },
    data: {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}
