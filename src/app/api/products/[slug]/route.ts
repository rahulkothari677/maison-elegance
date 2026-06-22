import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product: parseProduct(product) });
}
