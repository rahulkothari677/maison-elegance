import { db } from "@/lib/db";

/**
 * Ensures the SiteContent table exists in the database.
 *
 * Strategy: Try to use the table. If that fails, create it with raw SQL.
 * Then try again. This is bulletproof — works regardless of whether
 * prisma db push ran during build (Vercel may bypass it).
 *
 * Uses both $executeRawUnsafe AND a fallback to $executeRaw (tagged template)
 * because different DB adapters support different APIs.
 */
export async function ensureSiteContentTable(): Promise<{ created: boolean; error?: string }> {
  // First, check if the table already exists by trying a simple query
  try {
    await db.$executeRawUnsafe(`SELECT 1 FROM "SiteContent" LIMIT 1`);
    return { created: false }; // table exists, all good
  } catch (checkErr: any) {
    // Table doesn't exist — create it
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "SiteContent" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "section" TEXT NOT NULL,
        "data" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      )
    `;
    const createIndexSQL = `
      CREATE UNIQUE INDEX IF NOT EXISTS "SiteContent_section_key" ON "SiteContent"("section")
    `;

    try {
      await db.$executeRawUnsafe(createTableSQL);
      await db.$executeRawUnsafe(createIndexSQL);
      return { created: true };
    } catch (createErr1: any) {
      // Try alternative API (tagged template)
      try {
        await db.$executeRaw`${createTableSQL}`;
        await db.$executeRaw`${createIndexSQL}`;
        return { created: true };
      } catch (createErr2: any) {
        return {
          created: false,
          error: `Failed to create SiteContent table: ${createErr2?.message || createErr1?.message || "unknown error"}`,
        };
      }
    }
  }
}

/**
 * Wrapper that ensures the table exists, then runs the provided operation.
 * If the operation fails with a "no such table" error, it creates the table
 * and retries once.
 */
export async function withSiteContentTable<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    // Ensure table exists first
    await ensureSiteContentTable();
    // Run the operation
    return await operation();
  } catch (err: any) {
    // If it's a "no such table" error, try creating the table and retrying
    if (
      err?.message?.includes("no such table") ||
      err?.message?.includes("does not exist") ||
      err?.message?.includes("SiteContent") ||
      err?.message?.includes("relation") ||
      err?.message?.includes("table")
    ) {
      console.warn("[withSiteContentTable] Retrying after table creation...");
      await ensureSiteContentTable();
      return await operation();
    }
    throw err;
  }
}
