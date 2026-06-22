import { db } from "@/lib/db";

/**
 * Ensures the SiteContent table exists in the database.
 * Called at the start of every site-content API request so the table
 * is auto-created on first use — no manual prisma db push needed.
 *
 * This is necessary because Vercel's auto-detected Next.js build command
 * runs `next build` directly, bypassing our package.json build script
 * that would normally run `prisma db push` to sync the schema.
 *
 * Uses raw SQL (CREATE TABLE IF NOT EXISTS) so it's idempotent and
 * works on both local SQLite and Turso (libsql).
 */
export async function ensureSiteContentTable() {
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SiteContent" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "section" TEXT NOT NULL,
        "data" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      )
    `);
    await db.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "SiteContent_section_key" ON "SiteContent"("section")
    `);
  } catch (e) {
    // Table might already exist, or the DB driver doesn't support
    // $executeRawUnsafe. Either way, we swallow the error and let
    // the actual query fail later with a clearer message if needed.
    console.warn("[ensureSiteContentTable] could not create table:", e);
  }
}
