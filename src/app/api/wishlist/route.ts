import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function parseProduct(p: any) {
  return {
    ...p,
    id: p.slug,
    images: JSON.parse(p.images),
    colors: JSON.parse(p.colors),
    sizes: JSON.parse(p.sizes),
    materials: JSON.parse(p.materials),
    features: JSON.parse(p.features),
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as any;

  const items = await db.wishlistItem.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    items: items.map((i) => parseProduct(i.product)),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as any;
  const body = await req.json();
  const { productId } = body; // this is the slug

  const product = await db.product.findUnique({ where: { slug: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const existing = await db.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId: product.id,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Already in wishlist" }, { status: 400 });
  }

  await db.wishlistItem.create({
    data: { userId: user.id, productId: product.id },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
