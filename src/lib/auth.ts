import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// Admin emails — anyone with one of these can access /admin
// Can be managed via Admin Settings tab (stored in DB) or env var
const DEFAULT_ADMIN_EMAILS = [
  "rahulkothari677@gmail.com", // primary admin (you)
  "admin@maison-elegance.com",
];

// Also check ADMIN_EMAILS env var (comma-separated) for additional admins
const envAdminEmails = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
  : [];

const ADMIN_EMAILS = [...DEFAULT_ADMIN_EMAILS, ...envAdminEmails];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function getAdminEmails(): string[] {
  return ADMIN_EMAILS;
}

/**
 * Check if email is admin — including DB-added admins.
 * Use this for runtime admin checks (API routes).
 * isAdminEmail() is synchronous and only checks code/env admins.
 */
export async function isAdminEmailAsync(email?: string | null): Promise<boolean> {
  if (!email) return false;
  const emailLower = email.toLowerCase();

  // Check code/env admins first (fast)
  if (ADMIN_EMAILS.includes(emailLower)) return true;

  // Check DB-added admins
  try {
    const { db } = await import("./db");
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM "AdminEmail" WHERE "email" = ?`,
      emailLower
    ) as any[];
    return rows.length > 0;
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return null;
  }
  return session;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
    // Social login providers — uncomment/add env vars to enable
    // Google: requires GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env
    ...(process.env.GOOGLE_CLIENT_ID
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })]
      : []),
    // Facebook: requires FACEBOOK_CLIENT_ID + FACEBOOK_CLIENT_SECRET in .env
    ...(process.env.FACEBOOK_CLIENT_ID
      ? [FacebookProvider({
          clientId: process.env.FACEBOOK_CLIENT_ID!,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        })]
      : []),
    // Apple: requires APPLE_CLIENT_ID + APPLE_TEAM_ID + APPLE_KEY_ID + APPLE_PRIVATE_KEY in .env
    ...(process.env.APPLE_CLIENT_ID
      ? [AppleProvider({
          clientId: process.env.APPLE_CLIENT_ID!,
          teamId: process.env.APPLE_TEAM_ID!,
          keyId: process.env.APPLE_KEY_ID!,
          privateKey: process.env.APPLE_PRIVATE_KEY!,
        })]
      : []),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Fetch fresh user data from DB
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
            dob: true,
            gender: true,
            tier: true,
            loyaltyPoints: true,
            lifetimeSpend: true,
            memberSince: true,
          },
        });

        if (dbUser) {
          session.user = {
            ...session.user,
            ...dbUser,
            image: dbUser.avatar,
            isAdmin: isAdminEmail(dbUser.email),
          } as any;
        }
      }
      return session;
    },
  },
};
