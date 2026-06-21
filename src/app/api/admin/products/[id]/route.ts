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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const existing = await db.product.findUnique({ where: { slug: id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.category !== undefined) data.category = body.category;
  if (body.subcategory !== undefined) data.subcategory = body.subcategory;
  if (body.price !== undefined) data.price = parseInt(body.price);
  if (body.compareAtPrice !== undefined)
    data.compareAtPrice = body.compareAtPrice
      ? parseInt(body.compareAtPrice)
      : null;
  if (body.images !== undefined) data.images = JSON.stringify(body.images);
  if (body.colors !== undefined) data.colors = JSON.stringify(body.colors);
  if (body.sizes !== undefined) data.sizes = JSON.stringify(body.sizes);
  if (body.badge !== undefined) data.badge = body.badge || null;
  if (body.description !== undefined) data.description = body.description;
  if (body.shortDescription !== undefined)
    data.shortDescription = body.shortDescription;
  if (body.inStock !== undefined) data.inStock = parseInt(body.inStock);
  if (body.fit !== undefined) data.fit = body.fit;
  if (body.origin !== undefined) data.origin = body.origin;
  if (body.care !== undefined) data.care = body.care;
  if (body.craftsmanship !== undefined) data.craftsmanship = body.craftsmanship;
  if (body.sustainability !== undefined) data.sustainability = body.sustainability;
  if (body.features !== undefined) data.features = JSON.stringify(body.features);
  if (body.materials !== undefined) data.materials = JSON.stringify(body.materials);

  const product = await db.product.update({
    where: { slug: id },
    data,
  });

  return NextResponse.json({ product: parseProduct(product) });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  await db.product.delete({ where: { slug: id } });

  return NextResponse.json({ success: true });
}
