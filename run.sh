#!/bin/bash
# ── Cafrezzo Brewscape — macOS Run Script ─────────────────────────────────────
# Usage:
#   ./run.sh           → start dev server (http://localhost:3000)
#   ./run.sh clean     → clear .next cache then start dev server
#   ./run.sh build     → production build (output in /out)
#   ./run.sh preview   → production build + preview server
# ──────────────────────────────────────────────────────────────────────────────

set -e
cd "$(dirname "$0")"

MODE="${1:-dev}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Cafrezzo Brewscape"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    echo "Install from https://nodejs.org/"
    exit 1
fi

echo "Node.js  : $(node -v)"
echo "npm      : $(npm -v)"
echo "Mode     : $MODE"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "→ Installing dependencies..."
    npm install
    echo ""
fi

case "$MODE" in
  clean)
    echo "→ Clearing .next cache..."
    rm -rf .next
    echo "→ Starting dev server at http://localhost:3000"
    echo "   Press Ctrl+C to stop."
    echo ""
    npm run dev
    ;;
  build)
    echo "→ Building for production..."
    npm run build
    echo ""
    echo "✓ Build complete. Static output in /out"
    ;;
  preview)
    echo "→ Building for production..."
    npm run build
    echo "→ Starting production preview at http://localhost:3000"
    echo "   Press Ctrl+C to stop."
    echo ""
    npm run start
    ;;
  dev|*)
    echo "→ Starting dev server at http://localhost:3000"
    echo "   Press Ctrl+C to stop."
    echo ""
    npm run dev
    ;;
esac
