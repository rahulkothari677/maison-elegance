#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# MAISON ÉLÉGANCE — Build script
#
# Runs Prisma generate + db push (against Turso if creds present, else local
# SQLite), then builds Next.js. Used by Vercel during `npm run build`.
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "📦 Generating Prisma client..."
npx prisma generate

# If Turso credentials are present (Vercel production/preview), construct a
# Prisma-compatible DATABASE_URL from them. Prisma's libsql adapter expects
# the URL format: libsql://<host>?authToken=<token>
if [ -n "$TURSO_DATABASE_URL" ] && [ -n "$TURSO_AUTH_TOKEN" ]; then
  echo "🌐 Turso credentials detected — pushing schema to Turso..."
  # Strip the leading "libsql://" or "https://" from TURSO_DATABASE_URL,
  # then re-add it as "libsql://" with the auth token as a query param.
  TURSO_HOST=$(echo "$TURSO_DATABASE_URL" | sed -E 's|^https?://||; s|^libsql://||; s|/$||')
  export DATABASE_URL="libsql://${TURSO_HOST}?authToken=${TURSO_AUTH_TOKEN}"
  echo "   → DB URL: libsql://${TURSO_HOST}?authToken=***"
else
  echo "ℹ️  No Turso credentials — using DATABASE_URL from env (local SQLite)"
fi

echo "📤 Pushing Prisma schema to database..."
npx prisma db push

echo "🏗️  Building Next.js..."
npx next build

# Copy standalone build artifacts (used by Vercel output: standalone mode)
cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
cp -r public .next/standalone/ 2>/dev/null || true

echo "✅ Build complete"
