import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

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

  const existing = await db.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Prevent setting parent to self or descendant (would create a cycle)
  if (body.parentId && body.parentId === id) {
    return NextResponse.json(
      { error: "A category cannot be its own parent" },
      { status: 400 }
    );
  }

  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.slug !== undefined) {
    // Check slug uniqueness (excluding current)
    const slugExists = await db.category.findFirst({
      where: { slug: body.slug, NOT: { id } },
    });
    if (slugExists) {
      return NextResponse.json(
        { error: "Slug already in use" },
        { status: 400 }
      );
    }
    data.slug = body.slug;
  }
  if (body.parentId !== undefined) data.parentId = body.parentId || null;
  if (body.icon !== undefined) data.icon = body.icon || null;
  if (body.image !== undefined) data.image = body.image || null;
  if (body.description !== undefined) data.description = body.description;
  if (body.order !== undefined) data.order = body.order;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const category = await db.category.update({ where: { id }, data });
  return NextResponse.json({ category });
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

  // Check for child categories
  const childCount = await db.category.count({ where: { parentId: id } });
  if (childCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${childCount} subcategories exist. Delete or move them first.` },
      { status: 400 }
    );
  }

  // Unlink products (set categoryId to null)
  await db.product.updateMany({
    where: { categoryId: id },
    data: { categoryId: null },
  });

  await db.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
