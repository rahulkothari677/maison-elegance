import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAllTables } from "@/lib/ensure-all-tables";
import { randomBytes } from "crypto";

/**
 * POST /api/auth/forgot-password
 * Body: { email: string }
 *
 * Generates a password reset token and stores it in the VerificationToken table.
 * In production, this would send an email with the reset link.
 * Currently logs the link to console (until Resend email service is configured).
 */
export async function POST(req: NextRequest) {
  await ensureAllTables();

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Check if user exists
    let user;
    try {
      user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    } catch {
      // Try raw SQL if Prisma fails
      const rows = await db.$queryRawUnsafe(
        `SELECT * FROM "User" WHERE "email" = ?`,
        email.toLowerCase()
      ) as any[];
      user = rows[0];
    }

    // For security, always return success (don't reveal if email exists)
    const genericMessage = "If an account exists with that email, a password reset link has been sent.";

    if (!user) {
      return NextResponse.json({ message: genericMessage });
    }

    // Generate reset token (valid for 1 hour)
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in VerificationToken table
    try {
      await db.verificationToken.create({
        data: {
          identifier: email.toLowerCase(),
          token,
          expires,
        },
      });
    } catch {
      // Try raw SQL
      await db.$executeRawUnsafe(
        `INSERT INTO "VerificationToken" ("identifier", "token", "expires") VALUES (?, ?, ?)`,
        email.toLowerCase(),
        token,
        expires.toISOString()
      );
    }

    // Generate reset link
    const baseUrl = process.env.NEXTAUTH_URL || "https://maison-elegance-nu.vercel.app";
    const resetLink = `${baseUrl}/?reset-token=${token}&email=${encodeURIComponent(email)}`;

    // In production, send email with this link via Resend/SendGrid
    // For now, log it (admin can see in Vercel logs)
    console.log(`[forgot-password] Reset link for ${email}: ${resetLink}`);

    // TODO: When Resend is configured, send actual email:
    // await sendEmail({
    //   to: email,
    //   subject: "Reset your MAISON ÉLÉGANCE password",
    //   body: `Click here to reset your password: ${resetLink}`,
    // });

    return NextResponse.json({
      message: genericMessage,
      // In dev mode, return the link (remove in production)
      devResetLink: process.env.NODE_ENV === "development" ? resetLink : undefined,
    });
  } catch (error: any) {
    console.error("[forgot-password] Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
