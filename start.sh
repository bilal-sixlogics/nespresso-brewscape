#!/bin/bash
# ============================================================
#  Brewscape — Start All Services (macOS / Linux)
# ============================================================
#
#  Requirements:
#    • PHP >= 8.2          (brew install php)
#    • Composer >= 2.x     (brew install composer)
#    • Node.js >= 20       (brew install node)
#    • npm >= 10
#
#  First-time setup:
#    chmod +x start.sh
#    ./start.sh --setup
#
#  Normal start:
#    ./start.sh
#
# ============================================================

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
ADMIN_DIR="$ROOT_DIR/admin"
FRONTEND_DIR="$ROOT_DIR"

BACKEND_PORT=8000
ADMIN_PORT=3002
FRONTEND_PORT=3001

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_banner() {
  echo ""
  echo -e "${GREEN}  ☕  B R E W S C A P E${NC}"
  echo -e "${CYAN}  ─────────────────────────────${NC}"
  echo ""
}

check_requirements() {
  local missing=0

  echo -e "${CYAN}Checking requirements...${NC}"

  if ! command -v php &>/dev/null; then
    echo -e "  ${RED}✗ PHP not found${NC}  →  brew install php"
    missing=1
  else
    local php_ver=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;")
    echo -e "  ${GREEN}✓${NC} PHP $php_ver"
  fi

  if ! command -v composer &>/dev/null; then
    echo -e "  ${RED}✗ Composer not found${NC}  →  brew install composer"
    missing=1
  else
    echo -e "  ${GREEN}✓${NC} Composer $(composer -V 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')"
  fi

  if ! command -v node &>/dev/null; then
    echo -e "  ${RED}✗ Node.js not found${NC}  →  brew install node"
    missing=1
  else
    echo -e "  ${GREEN}✓${NC} Node $(node -v)"
  fi

  if ! command -v npm &>/dev/null; then
    echo -e "  ${RED}✗ npm not found${NC}"
    missing=1
  else
    echo -e "  ${GREEN}✓${NC} npm $(npm -v)"
  fi

  echo ""

  if [ $missing -eq 1 ]; then
    echo -e "${RED}Missing dependencies. Install them and try again.${NC}"
    exit 1
  fi
}

run_setup() {
  echo -e "${YELLOW}Running first-time setup...${NC}"
  echo ""

  # Backend
  echo -e "${CYAN}[1/4] Installing backend dependencies...${NC}"
  cd "$BACKEND_DIR"
  composer install --no-interaction --quiet

  if [ ! -f .env ]; then
    cp .env.example .env 2>/dev/null || true
    php artisan key:generate --quiet 2>/dev/null || true
  fi

  echo -e "${CYAN}[2/4] Setting up database...${NC}"
  touch database/database.sqlite 2>/dev/null || true
  php artisan migrate --force --quiet
  php artisan db:seed --force --quiet
  php artisan storage:link --quiet 2>/dev/null || true
  echo -e "  ${GREEN}✓${NC} Database migrated & seeded"
  echo -e "  ${GREEN}✓${NC} Admin login: admin@ecommerce.com / password"

  # Admin panel
  echo -e "${CYAN}[3/4] Installing admin panel dependencies...${NC}"
  cd "$ADMIN_DIR"
  npm install --silent

  if [ ! -f .env.local ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:$BACKEND_PORT/api" > .env.local
    echo "NEXT_PUBLIC_APP_NAME=Brewscape Admin" >> .env.local
  fi

  # Frontend (storefront)
  echo -e "${CYAN}[4/4] Installing frontend dependencies...${NC}"
  cd "$FRONTEND_DIR"
  npm install --silent 2>/dev/null || true

  echo ""
  echo -e "${GREEN}Setup complete!${NC}"
  echo ""
}

kill_existing() {
  # Kill any existing processes on our ports
  lsof -ti:$BACKEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
  lsof -ti:$ADMIN_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
  lsof -ti:$FRONTEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
  sleep 1
}

start_services() {
  echo -e "${CYAN}Starting services...${NC}"
  echo ""

  kill_existing

  # Backend (Laravel)
  cd "$BACKEND_DIR"
  php artisan serve --port=$BACKEND_PORT --quiet &
  BACKEND_PID=$!
  echo -e "  ${GREEN}✓${NC} Backend API        → http://localhost:$BACKEND_PORT"

  # Admin panel (Next.js)
  cd "$ADMIN_DIR"
  npx next dev --port $ADMIN_PORT &>/dev/null &
  ADMIN_PID=$!
  echo -e "  ${GREEN}✓${NC} Admin Panel        → http://localhost:$ADMIN_PORT"

  # Frontend storefront (Next.js) — optional
  if [ -f "$FRONTEND_DIR/package.json" ] && grep -q '"dev"' "$FRONTEND_DIR/package.json"; then
    cd "$FRONTEND_DIR"
    npm run dev -- --port $FRONTEND_PORT &>/dev/null &
    FRONTEND_PID=$!
    echo -e "  ${GREEN}✓${NC} Customer Storefront → http://localhost:$FRONTEND_PORT"
  fi

  echo ""
  echo -e "${CYAN}  ─────────────────────────────${NC}"
  echo -e "  ${YELLOW}Admin login:${NC} admin@ecommerce.com / password"
  echo -e "  ${YELLOW}Press Ctrl+C to stop all services${NC}"
  echo ""

  # Trap Ctrl+C to kill all background processes
  trap 'echo ""; echo -e "${RED}Shutting down...${NC}"; kill $BACKEND_PID $ADMIN_PID $FRONTEND_PID 2>/dev/null; exit 0' INT TERM

  # Wait for all background processes
  wait
}

# ── Main ──
print_banner
check_requirements

# Auto-detect first run: if backend vendor or frontend node_modules missing, run setup
if [ "$1" = "--setup" ] || [ "$1" = "-s" ]; then
  run_setup
elif [ ! -d "$BACKEND_DIR/vendor" ] || [ ! -d "$ADMIN_DIR/node_modules" ] || [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo -e "${YELLOW}First run detected — running setup automatically...${NC}"
  echo ""
  run_setup
fi

start_services
