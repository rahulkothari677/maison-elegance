import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const themes = await db.theme.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({
    themes: themes.map((t) => ({
      ...t,
      settings: JSON.parse(t.settings),
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const theme = await db.theme.create({
    data: {
      name: body.name,
      settings: JSON.stringify(body.settings),
    },
  });
  return NextResponse.json({ theme: { ...theme, settings: JSON.parse(theme.settings) } }, { status: 201 });
}
