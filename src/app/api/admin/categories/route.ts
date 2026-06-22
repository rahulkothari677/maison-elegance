import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const categories = await db.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  // Build nested tree
  const tree = buildTree(categories);
  return NextResponse.json({ categories, tree });
}

function buildTree(categories: any[]) {
  const map = new Map(categories.map((c) => [c.id, { ...c, children: [] }]));
  const roots: any[] = [];
  for (const cat of map.values()) {
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(cat);
    } else {
      roots.push(cat);
    }
  }
  return roots;
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const slug =
    body.slug ||
    body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Check slug uniqueness
  const existing = await db.category.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "A category with this slug already exists" },
      { status: 400 }
    );
  }

  // If parent specified, compute order at this level
  let order = body.order ?? 0;
  if (body.parentId) {
    const siblings = await db.category.count({
      where: { parentId: body.parentId },
    });
    if (!body.order) order = siblings;
  } else {
    const topCount = await db.category.count({ where: { parentId: null } });
    if (!body.order) order = topCount;
  }

  const category = await db.category.create({
    data: {
      name: body.name,
      slug,
      parentId: body.parentId || null,
      icon: body.icon || null,
      image: body.image || null,
      description: body.description || null,
      order,
      isActive: body.isActive ?? true,
    },
  });

  return NextResponse.json({ category }, { status: 201 });
}
