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

// Collect all descendant category IDs (including the given one)
async function collectCategoryIds(slug: string): Promise<string[] | null> {
  const cat = await db.category.findUnique({ where: { slug } });
  if (!cat) return null;
  const ids = [cat.id];
  // BFS through children
  let queue = [cat.id];
  while (queue.length > 0) {
    const children = await db.category.findMany({
      where: { parentId: { in: queue } },
      select: { id: true },
    });
    const childIds = children.map((c) => c.id);
    ids.push(...childIds);
    queue = childIds;
  }
  return ids;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category"); // legacy flat name
  const categorySlug = searchParams.get("categorySlug"); // new: slug-based path
  const sort = searchParams.get("sort") || "featured";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sizes = searchParams.get("sizes");
  const colors = searchParams.get("colors");

  let where: any = {};

  // New slug-based filtering (with descendants).
  // IMPORTANT: also fall back to flat category string matching so that
  // admin-added products (which may not have a categoryId assigned) still
  // appear when the user browses "Women", "Men", etc. from the mega menu.
  if (categorySlug && categorySlug !== "all") {
    const ids = await collectCategoryIds(categorySlug);
    if (ids && ids.length > 0) {
      // Find the top-level category name (Women / Men / etc.) from the slug
      // so we can also match flat category strings like "Women".
      // slug format: "women", "women-dresses", "women-dresses-evening", etc.
      const topSlug = categorySlug.split("-")[0]; // "women-dresses" -> "women"
      const topName = topSlug.charAt(0).toUpperCase() + topSlug.slice(1); // "Women"
      where.OR = [
        { categoryId: { in: ids } },
        { category: topName }, // flat-string fallback for uncategorized products
      ];
    }
  } else if (category && category !== "All") {
    // Legacy fallback: filter by flat category string
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

  const products = await db.product.findMany({
    where,
    orderBy,
  });

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
