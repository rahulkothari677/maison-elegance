"use client";

// Client-side admin email check — mirrors the server-side check in auth.ts
// Used as a fallback when the session callback doesn't set isAdmin
const ADMIN_EMAILS = [
  "isabella.laurent@example.com",
  "admin@maison-elegance.com",
];

export function isClientAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
