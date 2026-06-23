import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAllTables } from "@/lib/ensure-all-tables";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/reset-password
 * Body: { email: string, token: string, newPassword: string }
 *
 * Verifies the reset token and updates the user's password.
 */
export async function POST(req: NextRequest) {
  await ensureAllTables();

  try {
    const { email, token, newPassword } = await req.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: "Email, token, and new password required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Verify token
    let tokenRecord;
    try {
      tokenRecord = await db.verificationToken.findUnique({
        where: { token },
      });
    } catch {
      const rows = await db.$queryRawUnsafe(
        `SELECT * FROM "VerificationToken" WHERE "token" = ?`,
        token
      ) as any[];
      tokenRecord = rows[0];
    }

    if (!tokenRecord || tokenRecord.identifier !== email.toLowerCase()) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    if (new Date(tokenRecord.expires) < new Date()) {
      return NextResponse.json({ error: "Reset token has expired" }, { status: 400 });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update user password
    try {
      await db.user.update({
        where: { email: email.toLowerCase() },
        data: { passwordHash },
      });
    } catch {
      await db.$executeRawUnsafe(
        `UPDATE "User" SET "passwordHash" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE "email" = ?`,
        passwordHash,
        email.toLowerCase()
      );
    }

    // Delete used token
    try {
      await db.verificationToken.delete({ where: { token } });
    } catch {
      await db.$executeRawUnsafe(`DELETE FROM "VerificationToken" WHERE "token" = ?`, token);
    }

    return NextResponse.json({
      ok: true,
      message: "Password reset successfully. You can now sign in with your new password.",
    });
  } catch (error: any) {
    console.error("[reset-password] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
