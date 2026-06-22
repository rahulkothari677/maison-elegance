#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# MAISON ÉLÉGANCE — GitHub Push Helper
# Run this on your laptop after extracting the .tar.gz
# ─────────────────────────────────────────────────────────────────────────────
#
# WHAT THIS SCRIPT DOES:
#   1. Initializes git (if not already)
#   2. Commits all files
#   3. Asks for your GitHub repo URL
#   4. Pushes to GitHub
#
# BEFORE RUNNING:
#   1. Create an empty repo on GitHub: https://github.com/new
#      - Repository name: maison-elegance (or whatever you like)
#      - Set to Public or Private (your choice)
#      - DO NOT check "Add a README" or "Add .gitignore" — leave it empty
#      - Click "Create repository"
#   2. Copy the repo URL (looks like: https://github.com/your-username/maison-elegance.git)
#   3. Run this script: bash push-to-github.sh
#
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "🛍️  MAISON ÉLÉGANCE — GitHub Push Helper"
echo "=========================================="
echo ""

# Check we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
  echo "❌ Error: Run this script from the project root (where package.json lives)"
  echo "   Example: cd maison-elegance && bash push-to-github.sh"
  exit 1
fi

# Check git is installed
if ! command -v git &> /dev/null; then
  echo "❌ Error: git is not installed. Install it first:"
  echo "   macOS:  brew install git"
  echo "   Ubuntu: sudo apt install git"
  echo "   Windows: https://git-scm.com/download/win"
  exit 1
fi

# Initialize git if needed
if [ ! -d ".git" ]; then
  echo "📦 Initializing git repository..."
  git init -b main
  git config user.email "$(git config --global user.email 2>/dev/null || echo 'you@example.com')"
  git config user.name "$(git config --global user.name 2>/dev/null || echo 'Your Name')"
fi

# Stage and commit
echo "📦 Staging files..."
git add -A

if git diff --cached --quiet; then
  echo "ℹ️  No changes to commit (already committed)"
else
  echo "📦 Committing..."
  git commit -m "Initial commit: MAISON ÉLÉGANCE premium clothing platform

Full-stack e-commerce app with:
- Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui
- Prisma + SQLite (9 models)
- NextAuth.js v4 (JWT + bcrypt)
- 11 REST API routes
- Socket.io mini-service for real-time order tracking
- Admin dashboard with full CRUD (products, orders, customers)
- Premium UI: dark mode, mega menu, quick view, cart drawer,
  image zoom, editorial lookbook, concierge chat, product reviews
- Loyalty program with auto-tier promotion"
fi

echo ""
echo "🌐 GitHub Repository Setup"
echo "---------------------------"
echo "If you haven't already, create an empty repo at:"
echo "  → https://github.com/new"
echo ""
echo "Settings:"
echo "  • Repository name: maison-elegance (or any name)"
echo "  • Public or Private (your choice)"
echo "  • DO NOT add README/.gitignore/license (leave empty)"
echo ""
read -p "Paste your GitHub repo URL (https://github.com/USERNAME/REPO.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
  echo "❌ No URL provided. Exiting."
  exit 1
fi

# Remove existing origin if any
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo ""
echo "🚀 Pushing to GitHub..."
echo "   If prompted, enter your GitHub username and Personal Access Token (PAT)."
echo "   (Your password won't work — GitHub requires a PAT for git over HTTPS)"
echo ""
echo "   Don't have a PAT? Create one at:"
echo "   → https://github.com/settings/tokens/new?scopes=repo"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ SUCCESS! Your project is now on GitHub:"
  echo "   $REPO_URL"
  echo ""
  echo "   View it at: ${REPO_URL%.git}"
  echo ""
  echo "🎉 Next steps:"
  echo "   1. Star your repo ⭐"
  echo "   2. Add a description on the GitHub repo page"
  echo "   3. Optional: Deploy to Vercel → https://vercel.com/new"
else
  echo ""
  echo "❌ Push failed. Common fixes:"
  echo "   • Make sure the repo URL is correct"
  echo "   • Make sure you have push access to the repo"
  echo "   • Use a Personal Access Token (not your password)"
  echo "   • Try SSH instead: git remote set-url origin git@github.com:USERNAME/REPO.git"
  exit 1
fi
