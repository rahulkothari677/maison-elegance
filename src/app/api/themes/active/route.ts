import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const theme = await db.theme.findFirst({ where: { isActive: true } });
  if (!theme) return NextResponse.json({ theme: null });
  return NextResponse.json({ theme: { ...theme, settings: JSON.parse(theme.settings) } });
}
