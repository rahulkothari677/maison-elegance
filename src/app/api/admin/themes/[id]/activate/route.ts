import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await db.theme.updateMany({ data: { isActive: false } });
  await db.theme.update({ where: { id }, data: { isActive: true } });
  return NextResponse.json({ success: true });
}
