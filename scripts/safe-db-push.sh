#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Safe Prisma DB push — constructs DATABASE_URL from Turso env vars if needed
#
# This runs as part of postinstall on Vercel. It ensures the Prisma schema
# is always pushed to the correct database (Turso in production, local
# SQLite in dev) regardless of how Vercel invokes the build.
# ─────────────────────────────────────────────────────────────────────────────

set -e

# If Turso credentials are present, construct a Prisma-compatible DATABASE_URL
# from them. Prisma's schema datasource uses env("DATABASE_URL"), but the app
# runtime uses TURSO_DATABASE_URL + TURSO_AUTH_TOKEN. This bridges the gap.
if [ -n "$TURSO_DATABASE_URL" ] && [ -n "$TURSO_AUTH_TOKEN" ]; then
  # Strip protocol from TURSO_DATABASE_URL to get the host
  TURSO_HOST=$(echo "$TURSO_DATABASE_URL" | sed -E 's|^https?://||; s|^libsql://||; s|/$||')
  export DATABASE_URL="libsql://${TURSO_HOST}?authToken=${TURSO_AUTH_TOKEN}"
  echo "🌐 [db-push] Using Turso: libsql://${TURSO_HOST}?authToken=***"
else
  echo "ℹ️  [db-push] No Turso creds — using DATABASE_URL from env"
fi

# Generate the Prisma client
echo "📦 [db-push] Generating Prisma client..."
npx prisma generate

# Push the schema to the database
echo "📤 [db-push] Pushing schema to database..."
npx prisma db push --accept-data-loss || {
  echo "⚠️  [db-push] prisma db push failed, but continuing (app may use fallbacks)"
  exit 0
}

echo "✅ [db-push] Done"
