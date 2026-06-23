import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ensureAllTables } from "@/lib/ensure-all-tables";

/**
 * GET /api/admin/activity
 * Returns admin activity log (most recent 100 entries).
 * Optional query: ?limit=50
 */
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureAllTables();

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "100");

  try {
    const activities = await db.$queryRawUnsafe(
      `SELECT * FROM "AdminActivity" ORDER BY "createdAt" DESC LIMIT ?`,
      limit
    ) as any[];

    return NextResponse.json({ activities });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, activities: [] },
      { status: 500 }
    );
  }
}
