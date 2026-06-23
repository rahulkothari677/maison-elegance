import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, getAdminEmails } from "@/lib/auth";
import { ensureAllTables } from "@/lib/ensure-all-tables";
import { randomUUID } from "crypto";

/**
 * GET /api/admin/settings
 * Returns:
 * - List of admin emails (from code defaults + DB + env var)
 * - Current admin's info
 */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureAllTables();

  // Get code/env admin emails
  const codeAdmins = getAdminEmails();

  // Get DB-added admin emails
  let dbAdmins: any[] = [];
  try {
    dbAdmins = await db.$queryRawUnsafe(`SELECT * FROM "AdminEmail" ORDER BY "addedAt" DESC`) as any[];
  } catch {}

  // Combine — code admins are marked as "system" (can't be removed via UI)
  const allAdmins = [
    ...codeAdmins.map((email) => ({
      email,
      source: "system" as const,
      addedAt: null,
      addedBy: null,
      canRemove: email !== (session.user as any).email, // can't remove yourself
    })),
    ...dbAdmins.map((a) => ({
      email: a.email,
      source: "database" as const,
      addedAt: a.addedAt,
      addedBy: a.addedBy,
      canRemove: true,
    })),
  ];

  // Remove duplicates (prefer system source)
  const seen = new Set<string>();
  const uniqueAdmins = allAdmins.filter((a) => {
    const key = a.email.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({
    admins: uniqueAdmins,
    currentAdmin: (session.user as any).email,
  });
}

/**
 * POST /api/admin/settings
 * Add a new admin email to the DB.
 * Body: { email: string }
 */
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureAllTables();

  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const adminEmail = email.toLowerCase().trim();

    // Check if already exists
    const existing = await db.$queryRawUnsafe(
      `SELECT * FROM "AdminEmail" WHERE "email" = ?`,
      adminEmail
    ) as any[];

    if (existing.length > 0) {
      return NextResponse.json({ error: "This email is already an admin" }, { status: 400 });
    }

    // Add to DB
    const id = randomUUID();
    await db.$executeRawUnsafe(
      `INSERT INTO "AdminEmail" ("id", "email", "addedBy") VALUES (?, ?, ?)`,
      id,
      adminEmail,
      (session.user as any).email
    );

    // Log activity
    await logActivity(
      (session.user as any).email,
      "added_admin",
      "admin",
      adminEmail,
      `Added ${adminEmail} as admin`
    );

    return NextResponse.json({
      ok: true,
      message: `${adminEmail} is now an admin`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add admin" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/settings?email=xxx
 * Remove an admin email from the DB.
 */
export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureAllTables();

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Can't remove system admins
  const systemAdmins = getAdminEmails();
  if (systemAdmins.includes(email.toLowerCase())) {
    return NextResponse.json(
      { error: "Cannot remove a system admin. Remove via code or env var instead." },
      { status: 400 }
    );
  }

  // Can't remove yourself
  if (email.toLowerCase() === (session.user as any).email?.toLowerCase()) {
    return NextResponse.json(
      { error: "Cannot remove yourself as admin" },
      { status: 400 }
    );
  }

  await db.$executeRawUnsafe(`DELETE FROM "AdminEmail" WHERE "email" = ?`, email.toLowerCase());

  await logActivity(
    (session.user as any).email,
    "removed_admin",
    "admin",
    email,
    `Removed ${email} from admin`
  );

  return NextResponse.json({
    ok: true,
    message: `${email} is no longer an admin`,
  });
}

/**
 * Helper: log admin activity
 */
export async function logActivity(
  adminEmail: string,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: string
) {
  try {
    const id = randomUUID();
    await db.$executeRawUnsafe(
      `INSERT INTO "AdminActivity" ("id", "adminEmail", "action", "entityType", "entityId", "details") VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      adminEmail,
      action,
      entityType || null,
      entityId || null,
      details || null
    );
  } catch (e) {
    console.warn("[logActivity] Failed to log:", e);
  }
}
