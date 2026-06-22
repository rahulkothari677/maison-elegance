#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# MAISON ÉLÉGANCE — Build script
#
# Runs Prisma generate + db push (against Turso if creds present, else local
# SQLite), then builds Next.js. Used by Vercel during `npm run build`.
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "📦 Generating Prisma client + pushing schema..."
bash scripts/safe-db-push.sh

echo "🏗️  Building Next.js..."
npx next build

# Copy standalone build artifacts (used by Vercel output: standalone mode)
cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
cp -r public .next/standalone/ 2>/dev/null || true

echo "✅ Build complete"
