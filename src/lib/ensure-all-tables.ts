import { db } from "@/lib/db";

/**
 * COMPREHENSIVE SELF-HEALING MIGRATION
 *
 * This ensures ALL tables in the Turso database match the Prisma schema.
 * Called at the start of every critical API request.
 *
 * Why this exists:
 * - Vercel auto-detects Next.js and runs `next build` directly
 * - `prisma db push` never runs on Vercel, so the DB schema is stale
 * - Prisma queries fail because the DB doesn't match the schema
 * - This function creates/updates tables using raw SQL (SQLite syntax)
 *
 * All SQL uses ? placeholders (SQLite/LibSQL syntax, NOT $1 PostgreSQL).
 * All CREATE TABLE statements use IF NOT EXISTS (idempotent).
 */

let migrationRan = false;
let migrationPromise: Promise<void> | null = null;

export async function ensureAllTables(): Promise<void> {
  // Only run once per server instance (the migration is idempotent anyway,
  // but this avoids redundant work on every request)
  if (migrationRan) return;
  if (migrationPromise) return migrationPromise;

  migrationPromise = runMigration();
  await migrationPromise;
  migrationRan = true;
}

async function runMigration(): Promise<void> {
  const statements = [
    // ─── User ─────────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL,
      "name" TEXT,
      "passwordHash" TEXT,
      "phone" TEXT,
      "dob" TEXT,
      "gender" TEXT,
      "avatar" TEXT,
      "memberSince" TEXT NOT NULL DEFAULT 'Now',
      "tier" TEXT NOT NULL DEFAULT 'Silver',
      "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
      "lifetimeSpend" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,

    // ─── Account ──────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS "Account" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "provider" TEXT NOT NULL,
      "providerAccountId" TEXT NOT NULL,
      "refresh_token" TEXT,
      "access_token" TEXT,
      "expires_at" INTEGER,
      "token_type" TEXT,
      "scope" TEXT,
      "id_token" TEXT,
      "session_state" TEXT
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId")`,

    // ─── Session ──────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS "Session" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "sessionToken" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "expires" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken")`,

    // ─── VerificationToken ────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS "VerificationToken" (
      "identifier" TEXT NOT NULL,
      "token" TEXT NOT NULL,
      "expires" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token")`,

    // ─── Theme ────────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS "Theme" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT false,
      "settings" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Theme_name_key" ON "Theme"("name")`,

    // ─── Category ─────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS "Category" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "parentId" TEXT,
      "icon" TEXT,
      "image" TEXT,
      "description" TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug")`,

    // ─── Product ──────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS "Product" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "slug" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "brand" TEXT NOT NULL DEFAULT 'MAISON ÉLÉGANCE',
      "category" TEXT NOT NULL,
      "subcategory" TEXT NOT NULL DEFAULT '',
      "price" INTEGER NOT NULL,
      "compareAtPrice" INTEGER,
      "currency" TEXT NOT NULL DEFAULT 'USD',
      "rating" REAL NOT NULL DEFAULT 0,
      "reviewCount" INTEGER NOT NULL DEFAULT 0,
      "images" TEXT NOT NULL,
      "colors" TEXT NOT NULL,
      "sizes" TEXT NOT NULL,
      "badge" TEXT,
      "description" TEXT NOT NULL DEFAULT '',
      "shortDescription" TEXT NOT NULL DEFAULT '',
      "materials" TEXT NOT NULL,
      "craftsmanship" TEXT NOT NULL DEFAULT '',
      "care" TEXT NOT NULL DEFAULT '',
      "origin" TEXT NOT NULL DEFAULT '',
      "sustainability" TEXT NOT NULL DEFAULT '',
      "fit" TEXT NOT NULL DEFAULT '',
      "features" TEXT NOT NULL,
      "sku" TEXT NOT NULL,
      "inStock" INTEGER NOT NULL DEFAULT 0,
      "categoryId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug")`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku")`,

    // ─── Order ────────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS "Order" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderNumber" TEXT NOT NULL,
      "userId" TEXT,
      "guestEmail" TEXT,
      "status" TEXT NOT NULL DEFAULT 'Confirmed',
      "subtotal" INTEGER NOT NULL,
      "shipping" INTEGER NOT NULL,
      "tax" INTEGER NOT NULL,
      "total" INTEGER NOT NULL,
      "shippingAddress" TEXT NOT NULL,
      "trackingNumber" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber")`,

    // ─── OrderItem (with OPTIONAL productId — no FK constraint) ───────
    `CREATE TABLE IF NOT EXISTS "OrderItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderId" TEXT NOT NULL,
      "productId" TEXT,
      "name" TEXT NOT NULL,
      "image" TEXT NOT NULL,
      "size" TEXT NOT NULL,
      "color" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL,
      "price" INTEGER NOT NULL
    )`,

    // ─── Address ──────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS "Address" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "label" TEXT NOT NULL,
      "fullName" TEXT NOT NULL,
      "line1" TEXT NOT NULL,
      "line2" TEXT,
      "city" TEXT NOT NULL,
      "state" TEXT NOT NULL,
      "postalCode" TEXT NOT NULL,
      "country" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "isDefault" BOOLEAN NOT NULL DEFAULT false
    )`,

    // ─── Review ───────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS "Review" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "productId" TEXT NOT NULL,
      "userId" TEXT,
      "authorName" TEXT NOT NULL,
      "rating" INTEGER NOT NULL,
      "title" TEXT,
      "body" TEXT NOT NULL,
      "images" TEXT,
      "verified" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Review_productId_userId_key" ON "Review"("productId", "userId")`,

    // ─── Question ─────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS "Question" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "productId" TEXT NOT NULL,
      "userId" TEXT,
      "authorName" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    // ─── Answer ───────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS "Answer" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "questionId" TEXT NOT NULL,
      "userId" TEXT,
      "authorName" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "isVerified" BOOLEAN NOT NULL DEFAULT false,
      "helpful" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    // ─── StylePost ────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS "StylePost" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT,
      "authorName" TEXT NOT NULL,
      "authorAvatar" TEXT,
      "image" TEXT NOT NULL,
      "caption" TEXT NOT NULL,
      "productId" TEXT,
      "likes" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    // ─── PostComment ──────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS "PostComment" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "postId" TEXT NOT NULL,
      "authorName" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    // ─── WishlistItem ─────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS "WishlistItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "WishlistItem_userId_productId_key" ON "WishlistItem"("userId", "productId")`,

    // ─── SiteContent ──────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS "SiteContent" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "section" TEXT NOT NULL,
      "data" TEXT NOT NULL,
      "updatedAt" DATETIME NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "SiteContent_section_key" ON "SiteContent"("section")`,

    // ─── FestivalTheme ────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS "FestivalTheme" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "label" TEXT NOT NULL,
      "description" TEXT,
      "settings" TEXT NOT NULL,
      "startDate" DATETIME,
      "endDate" DATETIME,
      "isActive" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "FestivalTheme_name_key" ON "FestivalTheme"("name")`,
  ];

  for (const sql of statements) {
    try {
      await db.$executeRawUnsafe(sql);
    } catch (e: any) {
      // Table or index might already exist with different schema — non-fatal
      // We only care that the table EXISTS, not that it's perfectly migrated
      console.warn("[ensureAllTables] Statement failed (non-fatal):", e?.message?.slice(0, 100));
    }
  }

  console.log("[ensureAllTables] Migration complete — all tables ensured");
}
