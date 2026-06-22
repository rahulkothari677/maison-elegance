import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      icon: true,
      image: true,
      description: true,
      order: true,
    },
  });

  // Build nested tree
  const map = new Map(categories.map((c) => [c.id, { ...c, children: [] as any[] }]));
  const roots: any[] = [];
  for (const cat of map.values()) {
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(cat);
    } else {
      roots.push(cat);
    }
  }

  return NextResponse.json({ categories, tree: roots });
}
