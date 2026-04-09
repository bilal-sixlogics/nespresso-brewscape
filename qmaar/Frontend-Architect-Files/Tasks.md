# E-Commerce Admin Panel — Development Tasks (Phase by Phase)

**Project:** E-Commerce Admin Panel (Next.js 16)
**Total Phases:** 10
**Status Legend:** `[ ]` Todo | `[/]` In Progress | `[x]` Done

> ⚠️ **Rule:** Complete each phase fully before moving to the next. All phases align with the backend Admin API (`/api/admin/v1/`).

---

## Phase 1 — Project Bootstrap & Configuration

> **Goal:** Set up the Next.js 16 project with all dependencies, configuration, and base structure.

- [ ] **1.1** Initialize Next.js 16 project with TypeScript + App Router:
  ```bash
  npx -y create-next-app@latest ./ --typescript --app --tailwind --eslint --src-dir=false --import-alias="@/*"
  ```
- [ ] **1.2** Install core dependencies (no Axios — using Server Actions + fetch):
  ```bash
  npm install @tanstack/react-query @tanstack/react-table zustand react-hook-form @hookform/resolvers zod recharts date-fns lucide-react sonner next-themes nuqs
  ```
- [ ] **1.3** Initialize shadcn/ui:
  ```bash
  npx shadcn@latest init
  ```
- [ ] **1.4** Install required shadcn components:
  ```bash
  npx shadcn@latest add button input textarea select dialog sheet table card badge dropdown-menu command form toast tabs skeleton separator breadcrumb avatar sidebar chart
  ```
- [ ] **1.5** Configure `.env.local`:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:8000/api
  NEXT_PUBLIC_APP_NAME="E-Commerce Admin"
  ```
- [ ] **1.6** Create directory structure:
  - `actions/` (Server Actions — one file per module)
  - `app/(auth)/`, `app/(dashboard)/`
  - `components/ui/`, `components/layout/`, `components/data-table/`, `components/forms/`, `components/shared/`
  - `lib/api/`, `lib/hooks/`, `lib/stores/`, `lib/validators/`
  - `types/`, `providers/`
- [ ] **1.7** Create `lib/utils.ts` with `cn()`, `formatCurrency()`, `formatDate()` helpers
- [ ] **1.8** Verify `npm run dev` boots cleanly on port 3000

---

## Phase 2 — API Client & Type Definitions

> **Goal:** Build the API client layer and TypeScript types aligned with the backend.

- [ ] **2.1** Create `lib/api/client.ts` — shared `apiFetch()` wrapper using `fetch`:
  - `BASE_URL: NEXT_PUBLIC_API_URL + '/admin/v1'`
  - Reads auth token from HTTP-only cookie via `cookies()`
  - Attaches `Authorization: Bearer {token}` header
  - Handles 401 → `redirect('/login')`
  - Parses JSON response and throws on non-OK status
- [ ] **2.2** Create TypeScript types (`types/`):
  - `api.ts` — `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError`, `ValidationError`
  - `category.ts` — `Category`, `CreateCategoryPayload`
  - `brand.ts` — `Brand`, `CreateBrandPayload`
  - `product.ts` — `Product`, `ProductSalesUnit`, `CreateProductPayload`
  - `order.ts` — `Order`, `OrderItem`, `OrderAddress`, `OrderShipment`, `OrderStatus`
  - `inventory.ts` — `InventoryItem`, `InventoryMovement`, `AdjustStockPayload`
  - `promotion.ts` — `Promotion`, `PromotionCondition`, `PromotionTarget`, `CreatePromotionPayload`
  - `shipping.ts` — `ShippingMethod`, `ShippingZone`, `ShippingRate`
  - `admin.ts` — `AdminUser`, `Role`, `Permission`
  - `audit-log.ts` — `AuditLog`
- [ ] **2.3** Create Server Action modules (`actions/`) — each file uses `'use server'` and calls `apiFetch()`:
  - `auth.ts` — `login()`, `logout()` (login sets HTTP-only cookie, logout clears it)
  - `categories.ts` — `getCategories()`, `getCategory()`, `createCategory()`, `updateCategory()`, `deleteCategory()`
  - `brands.ts` — `getBrands()`, `getBrand()`, `createBrand()`, `updateBrand()`, `deleteBrand()`
  - `products.ts` — CRUD + `getProductSalesUnits()`, `createProductSalesUnit()`
  - `orders.ts` — `getOrders()`, `getOrder()`, `updateOrderStatus()`, `cancelOrder()`, `refundOrder()`
  - `inventory.ts` — `adjustStock()`, `getStockMovements()`
  - `promotions.ts` — CRUD server actions
  - `shipping.ts` — methods CRUD + `getShippingZones()`, `createShippingZone()`, `addShippingRate()`
  - `admins.ts` — CRUD + `getRoles()`, `createRole()`
  - `audit-logs.ts` — `getAuditLogs()`
- [ ] **2.4** Create Zod validation schemas (`lib/validators/`):
  - `auth.ts` — login schema
  - `category.ts`, `brand.ts`, `product.ts`, `promotion.ts`, `shipping.ts`

---

## Phase 3 — Authentication & Providers

> **Goal:** Build login page, auth store, auth guard, and provider wrappers.

- [ ] **3.1** Create `lib/stores/auth-store.ts` — Zustand store:
  - `user`, `isAuthenticated`, `setUser()`, `clearUser()`
  - Token is stored in HTTP-only cookie (managed by server actions), NOT in Zustand
  - Persist user info to `localStorage`
- [ ] **3.2** Create `lib/stores/sidebar-store.ts` — sidebar collapse state
- [ ] **3.3** Create `providers/query-provider.tsx` — `QueryClientProvider` with default options
- [ ] **3.4** Create `providers/auth-provider.tsx` — auth context with redirect logic
- [ ] **3.5** Create `providers/theme-provider.tsx` — `next-themes` ThemeProvider
- [ ] **3.6** Create `app/layout.tsx` — root layout wrapping all providers + font setup (Inter)
- [ ] **3.7** Create `middleware.ts` — redirect unauthenticated users to `/login`
- [ ] **3.8** Create `app/(auth)/layout.tsx` — centered card layout (no sidebar)
- [ ] **3.9** Create `app/(auth)/login/page.tsx`:
  - Email + password form (React Hook Form + Zod)
  - Call `login` server action → sets HTTP-only cookie + returns user → store user in Zustand → redirect to `/`
  - Show validation errors from backend
  - Loading state on submit button
- [ ] **3.10** Verify login → dashboard → logout flow works end-to-end

---

## Phase 4 — Dashboard Layout & Navigation

> **Goal:** Build the dashboard shell: sidebar, navbar, breadcrumbs.

- [ ] **4.1** Create `app/(dashboard)/layout.tsx` — sidebar + main content area
- [ ] **4.2** Create `components/layout/sidebar.tsx`:
  - Logo, navigation items (with collapsible groups), user avatar + role, logout button
  - Collapsible (hamburger toggle), mobile Sheet overlay
  - Active route highlighting
- [ ] **4.3** Create `components/layout/navbar.tsx`:
  - Sidebar toggle, breadcrumbs, theme toggle, user dropdown menu
- [ ] **4.4** Create `components/layout/breadcrumbs.tsx` — auto-generated from route
- [ ] **4.5** Create `components/layout/page-header.tsx` — title + optional action buttons
- [ ] **4.6** Create `app/(dashboard)/page.tsx` — Dashboard home with:
  - Summary stat cards (total orders, revenue, products, customers) — placeholder data
  - Recent orders table (last 5)
  - Revenue chart (Recharts AreaChart) — placeholder data
- [ ] **4.7** Create shared components:
  - `components/shared/status-badge.tsx` — colored badges for order/product status
  - `components/shared/confirm-dialog.tsx` — reusable delete confirmation
  - `components/shared/loading-skeleton.tsx` — page-level loading state
  - `components/shared/error-boundary.tsx` — error fallback UI

---

## Phase 5 — Catalog Module (Categories, Brands, Products)

> **Goal:** Build CRUD pages for Categories, Brands, and Products.

### 5A — Reusable DataTable Component

- [ ] **5.1** Create `components/data-table/data-table.tsx` — reusable TanStack Table wrapper:
  - Server-side pagination (nuqs for URL state)
  - Server-side sorting
  - Toolbar with search + filters
  - Column visibility toggle
  - Per-page selector (10, 20, 50)
- [ ] **5.2** Create `components/data-table/data-table-pagination.tsx`
- [ ] **5.3** Create `components/data-table/data-table-toolbar.tsx`
- [ ] **5.4** Create `components/data-table/data-table-faceted-filter.tsx`

### 5B — Categories

- [ ] **5.5** Create TanStack Query hooks: `lib/hooks/use-categories.ts` (wrapping server actions)
- [ ] **5.6** Create `app/(dashboard)/categories/page.tsx` — list with DataTable:
  - Columns: name, slug, parent, status, sort_order, actions
  - Filter by status
  - Row actions: edit, delete
- [ ] **5.7** Create `components/forms/category-form.tsx` — shared form for create/edit
- [ ] **5.8** Create `app/(dashboard)/categories/create/page.tsx`
- [ ] **5.9** Create `app/(dashboard)/categories/[id]/edit/page.tsx`

### 5C — Brands

- [ ] **5.10** Create TanStack Query hooks: `lib/hooks/use-brands.ts` (wrapping server actions)
- [ ] **5.11** Create `app/(dashboard)/brands/page.tsx` — list
- [ ] **5.12** Create `components/forms/brand-form.tsx`
- [ ] **5.13** Create `app/(dashboard)/brands/create/page.tsx`
- [ ] **5.14** Create `app/(dashboard)/brands/[id]/edit/page.tsx`

### 5D — Products

- [ ] **5.15** Create TanStack Query hooks: `lib/hooks/use-products.ts` (wrapping server actions)
- [ ] **5.16** Create `app/(dashboard)/products/page.tsx` — list:
  - Columns: image, name, category, brand, price, status, actions
  - Filters: category, brand, status
  - Search by name
- [ ] **5.17** Create `components/forms/product-form.tsx` — with image upload, brand/category selects
- [ ] **5.18** Create `app/(dashboard)/products/create/page.tsx`
- [ ] **5.19** Create `app/(dashboard)/products/[id]/edit/page.tsx`
- [ ] **5.20** Create `app/(dashboard)/products/[id]/sales-units/page.tsx` — list + create form

---

## Phase 6 — Orders Module

> **Goal:** Build order management pages with status transitions.

- [ ] **6.1** Create TanStack Query hooks: `lib/hooks/use-orders.ts` (wrapping server actions)
- [ ] **6.2** Create `app/(dashboard)/orders/page.tsx` — order list:
  - Columns: ID, customer email, status, grand_total, date, actions
  - Filters: status (tabs or dropdown)
  - Search by email or order ID
- [ ] **6.3** Create `app/(dashboard)/orders/[id]/page.tsx` — order detail:
  - Order info card (status badge, totals, dates)
  - Order items table (snapshotted name, unit, price, qty, total)
  - Shipping + billing address cards
  - Shipment tracking info
  - Payment transaction info
  - Status action buttons (only show valid transitions):
    - `Processing`, `Shipped`, `Cancel`, `Refund` (based on current status)
  - Status change confirmation dialog
- [ ] **6.4** Implement status update flow (via server actions):
  - `updateOrderStatus()` → `PATCH /orders/{id}/status` for forward transitions
  - `cancelOrder()` → `POST /orders/{id}/cancel` for cancellation (releases stock)
  - `refundOrder()` → `POST /orders/{id}/refund` for refund (Stripe refund + restore stock)
- [ ] **6.5** Order status badges with colors:
  - `draft` → gray, `pending_payment` → yellow, `paid` → blue
  - `processing` → indigo, `shipped` → purple, `delivered` → green
  - `cancelled` → red, `refunded` → orange

---

## Phase 7 — Inventory Module

> **Goal:** Build stock management and movement history.

- [ ] **7.1** Create TanStack Query hooks: `lib/hooks/use-inventory.ts` (wrapping server actions)
- [ ] **7.2** Create `app/(dashboard)/inventory/page.tsx` — stock overview:
  - Table: product name, sales unit, SKU, stock, reserved_stock, available
  - Color indicators: low stock (< 10) in red
- [ ] **7.3** Create `app/(dashboard)/inventory/adjust/page.tsx`:
  - Form: select product sales unit, quantity, type (addition/subtraction), reason
  - Server action → `POST /inventory/adjust`
- [ ] **7.4** Stock movement dialog/page per sales unit:
  - `GET /inventory/{salesUnitId}/movements`
  - Table: type, quantity, reference, note, date

---

## Phase 8 — Promotions Module

> **Goal:** Build promotion CRUD with conditions and targets.

- [ ] **8.1** Create TanStack Query hooks: `lib/hooks/use-promotions.ts` (wrapping server actions)
- [ ] **8.2** Create `app/(dashboard)/promotions/page.tsx` — list:
  - Columns: name, code, type, discount, used/max, status, dates, actions
  - Filter by status, type
- [ ] **8.3** Create `components/forms/promotion-form.tsx`:
  - Fields: name, code, type (product/cart/shipping), discount_type (percentage/fixed), discount_value, min_order_amount, max_uses, date range, is_stackable, status
  - Conditions section (dynamic rows): condition_type + value
  - Targets section (dynamic rows): target_type + target_id
- [ ] **8.4** Create `app/(dashboard)/promotions/create/page.tsx`
- [ ] **8.5** Create `app/(dashboard)/promotions/[id]/edit/page.tsx`

---

## Phase 9 — Shipping, Admin Users, Audit Logs & Settings

> **Goal:** Build remaining admin modules.

### 9A — Shipping

- [ ] **9.1** Create TanStack Query hooks: `lib/hooks/use-shipping.ts` (wrapping server actions)
- [ ] **9.2** Create `app/(dashboard)/shipping/methods/page.tsx`:
  - Table: name, base_price, est. days, active status, actions
  - Create/edit form dialog or page
- [ ] **9.3** Create `app/(dashboard)/shipping/zones/page.tsx`:
  - Zone list with countries + expandable rates table
  - Create zone form + add rate form

### 9B — Admin Users & Roles

- [ ] **9.4** Create TanStack Query hooks: `lib/hooks/use-admins.ts` (wrapping server actions)
- [ ] **9.5** Create `app/(dashboard)/admins/page.tsx` — admin user list
- [ ] **9.6** Create `app/(dashboard)/admins/create/page.tsx` — create admin (name, email, password, role)
- [ ] **9.7** Create `app/(dashboard)/roles/page.tsx` — role list with permissions
- [ ] **9.8** Create `app/(dashboard)/roles/create/page.tsx` — create role + assign permissions

### 9C — Audit Logs

- [ ] **9.9** Create TanStack Query hooks: `lib/hooks/use-audit-logs.ts` (wrapping server actions)
- [ ] **9.10** Create `app/(dashboard)/audit-logs/page.tsx`:
  - Table: admin, action, model, date
  - Expandable row showing old_values vs new_values diff
  - Filter by admin, action type, model type

### 9D — Settings

- [ ] **9.11** Create `app/(dashboard)/settings/page.tsx` — placeholder with store info

---

## Phase 10 — Polish, Testing & Deployment

> **Goal:** Final polish, testing, and production readiness.

- [ ] **10.1** Responsive design review — all pages work on tablet + desktop
- [ ] **10.2** Dark mode verification — all pages look correct in dark theme
- [ ] **10.3** Loading states — all pages show skeletons during data fetch
- [ ] **10.4** Empty states — all lists show empty message when no data
- [ ] **10.5** Error states — all API errors show user-friendly toast messages
- [ ] **10.6** Form validation — all forms show inline errors (Zod + server errors)
- [ ] **10.7** Confirm dialogs — all delete actions require confirmation
- [ ] **10.8** Install and configure Vitest:
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
  ```
- [ ] **10.9** Write tests:
  - Unit tests for utility functions and Zod validators
  - Component tests for key forms (category, product)
  - Integration tests for auth flow
- [ ] **10.10** `npm run build` — verify production build succeeds
- [ ] **10.11** Deploy to staging (Vercel or Docker)
- [ ] **10.12** End-to-end smoke test against staging backend

---

## Summary Table

| Phase | Focus | Est. Complexity |
|---|---|---|
| Phase 1 | Project Bootstrap & Config | Low |
| Phase 2 | API Client & Types | Medium |
| Phase 3 | Authentication & Providers | Medium |
| Phase 4 | Dashboard Layout & Navigation | Medium |
| Phase 5 | Catalog Module (Categories, Brands, Products) | High |
| Phase 6 | Orders Module | High |
| Phase 7 | Inventory Module | Medium |
| Phase 8 | Promotions Module | High |
| Phase 9 | Shipping, Admins, Audit Logs, Settings | Medium |
| Phase 10 | Polish, Testing & Deployment | Medium |

---

> **Next Step:** Review `architecture.md`, `documentation.md`, and this `Tasks.md`. When ready, say **"Start Phase 1"** to begin coding.
