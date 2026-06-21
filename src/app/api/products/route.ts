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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "featured";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sizes = searchParams.get("sizes");
  const colors = searchParams.get("colors");

  let where: any = {};
  if (category && category !== "All") {
    where.category = category;
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseInt(minPrice);
    if (maxPrice) where.price.lte = parseInt(maxPrice);
  }

  let orderBy: any = { createdAt: "asc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  else if (sort === "price-desc") orderBy = { price: "desc" };
  else if (sort === "rating") orderBy = { rating: "desc" };
  else if (sort === "newest") orderBy = { createdAt: "desc" };

  const products = await db.product.findMany({ where, orderBy });

  // Filter by sizes/colors in memory (sqlite JSON isn't queryable)
  let filtered = products;
  if (sizes) {
    const sizeArr = sizes.split(",");
    filtered = filtered.filter((p) =>
      JSON.parse(p.sizes).some((s: string) => sizeArr.includes(s))
    );
  }
  if (colors) {
    const colorArr = colors.split(",");
    filtered = filtered.filter((p) =>
      JSON.parse(p.colors).some((c: any) => colorArr.includes(c.name))
    );
  }

  return NextResponse.json({
    products: filtered.map(parseProduct),
    count: filtered.length,
  });
}
