import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

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
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    products: products.map(parseProduct),
  });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // Generate slug from name
  const slug =
    body.slug ||
    `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const sku =
    body.sku || `ME-${body.category?.slice(0, 2).toUpperCase()}-${Date.now()}`;

  try {
    const product = await db.product.create({
      data: {
        slug,
        name: body.name,
        brand: body.brand || "MAISON ÉLÉGANCE",
        category: body.category,
        subcategory: body.subcategory || "",
        categoryId: body.categoryId || null,
        price: parseInt(body.price),
        compareAtPrice: body.compareAtPrice
          ? parseInt(body.compareAtPrice)
          : null,
        currency: "USD",
        rating: 0,
        reviewCount: 0,
        images: JSON.stringify(body.images || []),
        colors: JSON.stringify(body.colors || []),
        sizes: JSON.stringify(body.sizes || []),
        badge: body.badge || null,
        description: body.description || "",
        shortDescription: body.shortDescription || "",
        materials: JSON.stringify(body.materials || []),
        craftsmanship: body.craftsmanship || "",
        care: body.care || "",
        origin: body.origin || "",
        sustainability: body.sustainability || "",
        fit: body.fit || "",
        features: JSON.stringify(body.features || []),
        sku,
        inStock: parseInt(body.inStock || "0"),
      },
    });

    return NextResponse.json({ product: parseProduct(product) }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
