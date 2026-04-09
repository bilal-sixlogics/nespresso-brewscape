# E-Commerce Admin Panel — CLAUDE.md

## Project

Next.js 16 standalone SPA admin panel for a coffee e-commerce platform. Consumes the Laravel backend Admin API (`/api/admin/v1/`). Full CRUD for products, orders, inventory, promotions, shipping, admin users, and settings.

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR/CSR, Server Actions, file-based routing |
| Language | TypeScript 5.x | Full type safety |
| Styling | Tailwind CSS 4.x | Utility-first CSS |
| UI Components | shadcn/ui | Pre-built accessible components |
| Data Fetching | TanStack Query v5 | Server state, caching, mutations, invalidation |
| State (client) | Zustand 5.x | Auth state, sidebar collapse. NOT for server state |
| Forms | React Hook Form 7.x + Zod 3.x | Form handling + schema validation |
| Tables | TanStack Table v8 | Headless data tables (server-side pagination/sorting) |
| Charts | Recharts 2.x | Dashboard analytics |
| Icons | Lucide React | Consistent icon library |
| Toasts | Sonner | Toast notifications |
| Dates | date-fns 4.x | Date formatting |
| URL State | nuqs | Query params for table filters/pagination |
| Dark Mode | next-themes | System/dark/light toggle |
| Testing | Vitest + React Testing Library | Unit, component, integration |

## Architecture Rules

### CRITICAL — Follow exactly
- **Server Actions ONLY for API calls.** Never call `fetch()` from client components. All HTTP calls go through `actions/*.ts` files with `'use server'` directive.
- **Token in HTTP-only cookie.** Never store auth tokens in localStorage or Zustand. Server Actions read cookies via `cookies()`.
- **TanStack Query for ALL server state.** Never store fetched data in Zustand or useState for caching. Query hooks wrap Server Actions.
- **Zustand for UI state ONLY.** Auth user info (for display), sidebar collapse state. Nothing else.
- **URL state for tables.** Pagination, sorting, filters stored in URL params via `nuqs`. Tables are shareable/bookmarkable.
- **Zod for ALL validation.** One schema per form. Validated client-side (React Hook Form resolver) AND server-side (in Server Action).
- **Role-aware rendering.** Sidebar links and action buttons render based on admin's permissions. Never show UI the user can't use.

### No Boilerplate — Reuse patterns
- **One reusable DataTable component** used across all list pages (products, orders, categories, etc.). Configure via column definitions.
- **One reusable form pattern:** React Hook Form + Zod + shadcn Form components. Shared for create/edit (same form, different initial data).
- **One `apiFetch()` wrapper** — handles auth header, error parsing, 401 redirect. All Server Actions use this.
- **Query hooks per module** (`use-products.ts`, `use-orders.ts`) — each wraps Server Actions with `useQuery`/`useMutation`. Handles cache invalidation.
- **Shared components** for cross-cutting UI: `StatusBadge`, `ConfirmDialog`, `LoadingSkeleton`, `PageHeader`, `ErrorBoundary`.

### File Organization
```
app/
├── (auth)/
│   ├── layout.tsx          # Centered card layout (no sidebar)
│   └── login/page.tsx      # Login form
├── (dashboard)/
│   ├── layout.tsx          # Sidebar + navbar + main content
│   ├── page.tsx            # Dashboard (stats, charts, recent orders)
│   ├── products/           # List, create, [id]/edit, [id]/sale-units
│   ├── categories/         # List, create, [id]/edit
│   ├── brands/             # List, create, [id]/edit
│   ├── orders/             # List, [id] (detail + status actions)
│   ├── inventory/          # Stock overview, adjust
│   ├── promotions/         # List, create, [id]/edit
│   ├── shipping/           # methods/, zones/
│   ├── admins/             # List, create
│   ├── roles/              # List, create
│   ├── audit-logs/         # Read-only viewer
│   └── settings/           # Site config
├── layout.tsx              # Root layout (providers)
└── middleware.ts            # Auth redirect (cookie check)

actions/                    # Server Actions (one file per module)
├── auth.ts
├── products.ts
├── categories.ts
├── brands.ts
├── orders.ts
├── inventory.ts
├── promotions.ts
├── shipping.ts
├── admins.ts
├── audit-logs.ts
├── settings.ts
└── media.ts

components/
├── ui/                     # shadcn/ui components
├── layout/                 # sidebar, navbar, breadcrumbs, page-header
├── data-table/             # Reusable DataTable + pagination + toolbar + filters
├── forms/                  # category-form, product-form, promotion-form, etc.
└── shared/                 # status-badge, confirm-dialog, loading-skeleton, error-boundary

lib/
├── api/client.ts           # apiFetch() wrapper
├── hooks/                  # TanStack Query hooks per module
├── stores/                 # Zustand: auth-store, sidebar-store
└── validators/             # Zod schemas per form

types/                      # TypeScript interfaces aligned with backend
├── api.ts                  # ApiResponse<T>, PaginatedResponse<T>, ApiError
├── product.ts
├── category.ts
├── brand.ts
├── order.ts
├── inventory.ts
├── promotion.ts
├── shipping.ts
├── admin.ts
└── audit-log.ts

providers/
├── query-provider.tsx      # QueryClientProvider
├── auth-provider.tsx       # Auth context + redirect
└── theme-provider.tsx      # next-themes ThemeProvider
```

## Data Fetching Pattern

```typescript
// 1. Server Action (actions/products.ts)
'use server';
import { apiFetch } from '@/lib/api/client';
export async function getProducts(params?: ProductQueryParams) {
  return apiFetch<PaginatedResponse<Product>>('/products', { params });
}

// 2. Query Hook (lib/hooks/use-products.ts)
export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
  });
}

// 3. Mutation Hook (same file)
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

// 4. Component uses hook
const { data, isLoading } = useProducts({ page: 1, category_id: 5 });
```

## Code Quality Rules

### Never do these
- **Never fetch from client components.** Always via Server Actions.
- **Never store server data in Zustand.** TanStack Query handles caching.
- **Never build custom table logic.** Use the shared DataTable component.
- **Never skip Zod validation.** Every form has a schema.
- **Never hardcode API URLs.** Use `NEXT_PUBLIC_API_URL` env var.
- **Never show actions user can't perform.** Check permissions before rendering.
- **Never skip loading/error/empty states.** Every page needs all three.

### Always do these
- **Use `sonner` for feedback.** `toast.success()` on mutations, `toast.error()` on failures.
- **Invalidate queries after mutations.** `queryClient.invalidateQueries()` — never manually update cache.
- **Use optimistic updates** for toggle operations (status, activate/deactivate).
- **Use `nuqs` for table state.** Page, per_page, sort, direction, search — all in URL.
- **Confirm destructive actions.** Always show `ConfirmDialog` before delete/cancel/refund.
- **Handle 401 globally.** `apiFetch` detects 401 → clears auth → redirects to `/login`.
- **Map backend validation errors to form fields.** 422 responses have `errors: { field: [messages] }` — set them on the form.

### Component Rules
- **Forms:** One form component shared between create/edit pages. Accept `initialData?` prop. If present → edit mode (PUT), if absent → create mode (POST).
- **DataTable:** Configure via `columns` array + `queryHook`. The DataTable handles pagination, sorting, toolbar, empty state, loading.
- **Pages:** Keep pages thin. Import form/table components. Pages just wire data to UI.
- **Layouts:** `(auth)` layout = centered card, no sidebar. `(dashboard)` layout = sidebar + navbar + main.

## API Integration

### Backend API Base: `/api/admin/v1/`

All Server Actions call `apiFetch()` which:
1. Reads auth token from HTTP-only cookie
2. Attaches `Authorization: Bearer {token}` and `Accept: application/json`
3. Returns typed response
4. On 401 → redirects to `/login`
5. On 422 → returns validation errors for form mapping
6. On other errors → throws with message

### Endpoints consumed (per module):
- **Auth:** POST login, POST logout
- **Products:** Full CRUD + sale units CRUD
- **Categories:** Full CRUD + tree
- **Brands:** Full CRUD + logo upload
- **Tags, Unit Types, Section Templates, Section Configs:** CRUD
- **Orders:** List, detail, update status, cancel, refund
- **Inventory:** Add stock, adjustments, movement log
- **Discounts:** Full CRUD + preview
- **Shipping:** Methods CRUD, zones CRUD, rates
- **Admins:** CRUD + role assignment
- **Roles:** List, create + assign permissions
- **Activity Logs:** Read-only + filters
- **Dashboard:** Stats endpoint (revenue, orders, low stock, top products)
- **Settings:** Read + update (site config, tax, checkout settings)
- **Media:** Image upload → returns URL

## Pages & Features

### Dashboard (`/`)
- Stat cards: total revenue, orders today, products, low stock count
- Revenue chart (Recharts AreaChart, last 30 days)
- Recent orders table (last 5)
- Top selling products

### Product Management
- **List:** DataTable with image, name, category, brand, price, status. Filter by category, brand, status. Search by name.
- **Create/Edit:** Tabbed form — Basic Info, Pricing, Sale Units, Images (featured + gallery), Sections (template picker + section editors), Specs Tab, Tags, SEO (meta_title, meta_description).
- **Sale Units:** Inline management on product form. Three pricing methods (direct, % off, € off). Per-unit SKU.

### Order Management
- **List:** DataTable with order #, customer, status (colored badge), total, date. Filter by status. Search by email/ID.
- **Detail:** Order info card, items table (snapshots), addresses (shipping + billing), shipment tracking, payment info. Status action buttons (only valid transitions): Mark Processing, Mark Shipped (with tracking input), Cancel, Refund.

### Inventory
- **Overview:** Product × sale unit stock table. Low stock highlighted red. Out of stock flagged.
- **Add Stock:** Select product → select sale unit (dropdown from product's units) → enter quantity → system shows conversion to base units.
- **Movement Log:** Per-product history with type, quantity, reference, who, when.

### Promotions
- **List:** Name, code, scope, type, value, used/max, status, dates.
- **Create/Edit:** Complex form with scope selector, discount type/value, conditions (dynamic rows), targets (dynamic rows), scheduling, stacking rules, coupon code.

### Shipping
- **Methods:** CRUD table (Standard, Express, etc.)
- **Zones:** CRUD with countries JSON editor + expandable rates per zone.

### Admin Users & Roles
- **Admins:** List, create (name, email, password, role assignment).
- **Roles:** List with permissions grid. Create role + checkboxes for permissions.

### Audit Logs
- Read-only DataTable. Expandable rows showing old → new value diff. Filter by admin, entity type, action, date range.

### Settings
- Key-value editor for site config: store name, email, phone, currency, timezone, tax rate, tax included in price, cart reservation minutes, guest checkout toggle.

## Styling

- **Dark mode:** next-themes with system/dark/light toggle. All components must work in both themes.
- **Responsive:** Tablet + desktop (admin panel is not mobile-first, but sidebar collapses to sheet on small screens).
- **shadcn/ui components:** button, input, textarea, select, dialog, sheet, table, card, badge, dropdown-menu, command, form, toast, tabs, skeleton, separator, breadcrumb, avatar, sidebar, chart, switch, popover, alert-dialog, collapsible.

## Testing

- **Vitest + React Testing Library + jsdom**
- Unit tests for Zod validators and utility functions.
- Component tests for key forms (product form, promotion form).
- Integration tests for auth flow (login → redirect → dashboard).
- `npm run build` must pass before deploy.

## Reference Documents

- `architecture.md` — Full admin panel architecture
- `documentation.md` — Developer documentation (data fetching, forms, tables, routing, theming)
- `Tasks.md` — 10-phase task breakdown with all subtasks
- `../SYSTEM_ARCHITECTURE_REFERENCE.html` — Visual interactive reference (32 sections, complete backend spec)

## Current Status

All 10 phases scoped and ready. Phase 1 not yet started. Backend API is ~88% complete and available for integration.
