import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureAllTables } from "@/lib/ensure-all-tables";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/change-password
 * Body: { currentPassword: string, newPassword: string }
 *
 * Allows a logged-in user to change their password.
 * Requires current password for verification.
 */
export async function POST(req: NextRequest) {
  await ensureAllTables();

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = (session.user as any).email;

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Fetch user
    let user;
    try {
      user = await db.user.findUnique({ where: { email: userEmail } });
    } catch {
      const rows = await db.$queryRawUnsafe(
        `SELECT * FROM "User" WHERE "email" = ?`,
        userEmail
      ) as any[];
      user = rows[0];
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 12);

    // Update password
    try {
      await db.user.update({
        where: { email: userEmail },
        data: { passwordHash: newHash },
      });
    } catch {
      await db.$executeRawUnsafe(
        `UPDATE "User" SET "passwordHash" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE "email" = ?`,
        newHash,
        userEmail
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("[change-password] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to change password" },
      { status: 500 }
    );
  }
}
