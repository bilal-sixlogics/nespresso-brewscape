# Nespresso Brewscape

Nespresso-themed e-commerce platform. Monorepo with three codebases.

## Project Structure

| Codebase | Path | Stack | Port |
|---|---|---|---|
| Customer storefront | `/` (root) | Next.js 16 + React 19 + Tailwind v4 + Framer Motion 12 + Zustand | 3001 |
| Admin panel | `/admin/` | Next.js 16 + React 19 + shadcn/ui (Base UI) + TanStack Query | 3002 |
| Backend API | `/backend/` | Laravel 12 + Sanctum + spatie/laravel-permission | 8000 |

## Key Rules

- **Do NOT modify the customer storefront** unless explicitly asked. It is stable.
- The admin panel uses **shadcn/ui built on Base UI primitives** (not Radix). See `admin/CLAUDE.md` and `admin/AGENTS.md`.
- The backend follows a **modular monolith** pattern: all domain logic lives in `app/Modules/` (AdminManagement, Cart, Catalog, Inventory, Notifications, Orders, Payments, Promotions, Reporting, Shipping, Users).
- **i18n**: 3 languages (en, ar, fr). Arabic requires RTL layout support. Backend strings use `__()` helper exclusively.

## Brand Guidelines

- **Primary color**: `#3B7E5A` (Brewscape green)
- **Font stack**: system fonts; headings use a serif accent where appropriate
- **Tone**: premium, minimal, coffee-forward

## Frontend Conventions (Storefront + Admin)

- Tailwind v4 (CSS-first config, `@theme` directive)
- Framer Motion 12 for animations; respect `prefers-reduced-motion`
- Zustand for client state (storefront), TanStack Query for server state (admin)
- TypeScript strict mode; validate with `npx tsc --noEmit --project tsconfig.json`
- All touch targets minimum 44x44px; follow WCAG 2.1 AA

## Backend Conventions

- Laravel 12, PHP 8.3+
- Auth via Sanctum (token-based for SPA, cookie-based for same-domain)
- Permissions via `spatie/laravel-permission`
- Use `__()` for ALL user-facing strings (never hardcode English)
- API routes in `routes/api.php`; module-specific routes registered per module
- Run tests: `php artisan test`
- Lang files in `lang/{en,ar,fr}/`

## Testing

```bash
# Backend
cd backend && php artisan test

# Admin type-check
cd admin && npx tsc --noEmit --project tsconfig.json

# Storefront type-check
npx tsc --noEmit --project tsconfig.json
```

## Development

```bash
# Start all services
cd backend && php artisan serve --port=8000
cd . && npm run dev -- --port 3001        # storefront
cd admin && npm run dev -- --port 3002    # admin
```
