# E-Commerce Admin Panel — Architecture

Version: ID-ADMIN-ARCH-00001
Updated: 2026-03-10
Stack: Next.js 16 | TypeScript | Tailwind CSS | shadcn/ui

Focus: **Admin Panel SPA consuming the Backend Admin API (`/api/admin/v1/`).**

---

# 1. Architecture Principles

- **Separate SPA** — standalone Next.js application, decoupled from backend
- **API-first consumption** — all data via backend REST API (`/api/admin/v1/`)
- **Type safety** — TypeScript throughout, shared API types
- **Component-driven UI** — shadcn/ui + Tailwind for consistent design system
- **Role-aware UI** — components render based on user permissions
- **Optimistic updates** — instant UI feedback with server reconciliation
- **Server Actions** — all API calls via Next.js Server Actions (no client-side HTTP library)
- **Client-side caching** — React Query / TanStack Query for data fetching & caching
- **File-based routing** — Next.js App Router (`app/` directory)
- **Server Components + Client Components** — optimal rendering strategy

---

# 2. System Overview

```
┌──────────────────────────────────┐
│         Admin Panel (SPA)        │
│     Next.js 16 + TypeScript      │
│     Tailwind CSS + shadcn/ui     │
│    TanStack Query + Zustand      │
└──────────┬───────────────────────┘
           │ HTTPS (JSON)
           ▼
┌──────────────────────────────────┐
│    Backend Admin API             │
│    /api/admin/v1/*               │
│    Laravel 12 + Sanctum Auth     │
└──────────────────────────────────┘
```

---

# 3. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 (App Router) | File-based routing, SSR/CSR, Server Actions |
| Language | TypeScript 5.x | Type safety |
| Styling | Tailwind CSS 4.x | Utility-first CSS |
| UI Components | shadcn/ui | Pre-built accessible components |
| Data Fetching | TanStack Query (React Query v5) | Caching, refetching, mutations |
| State Management | Zustand | Lightweight global state (auth, sidebar) |
| Forms | React Hook Form + Zod | Form handling + schema validation |
| Tables | TanStack Table v8 | Headless data tables |
| Charts | Recharts | Dashboard analytics charts |
| Notifications | Sonner (via shadcn) | Toast notifications |
| Icons | Lucide React | Consistent icon set |
| HTTP Client | Next.js Server Actions + fetch | Server-side API calls (no Axios) |
| Date Handling | date-fns | Date formatting/manipulation |

---

# 4. Project Structure

```
e-commerce-admin/
├── app/                          ← Next.js App Router
│   ├── (auth)/                   ← Auth layout group (no sidebar)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              ← Dashboard layout group (with sidebar)
│   │   ├── layout.tsx            ← Sidebar + Navbar wrapper
│   │   ├── page.tsx              ← Dashboard home
│   │   ├── categories/
│   │   │   ├── page.tsx          ← List
│   │   │   ├── create/page.tsx   ← Create form
│   │   │   └── [id]/
│   │   │       └── edit/page.tsx ← Edit form
│   │   ├── brands/
│   │   │   ├── page.tsx
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/
│   │   │       ├── edit/page.tsx
│   │   │       └── sales-units/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx     ← Order detail + status actions
│   │   ├── inventory/
│   │   │   ├── page.tsx          ← Stock overview
│   │   │   └── adjust/page.tsx   ← Manual adjustment form
│   │   ├── promotions/
│   │   │   ├── page.tsx
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── shipping/
│   │   │   ├── methods/page.tsx
│   │   │   └── zones/page.tsx
│   │   ├── customers/
│   │   │   └── page.tsx          ← (future) Customer list
│   │   ├── admins/
│   │   │   ├── page.tsx
│   │   │   └── create/page.tsx
│   │   ├── roles/
│   │   │   ├── page.tsx
│   │   │   └── create/page.tsx
│   │   ├── audit-logs/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── layout.tsx                ← Root layout (providers, fonts)
│   └── globals.css               ← Tailwind + shadcn base styles
├── components/
│   ├── ui/                       ← shadcn/ui components (auto-generated)
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── navbar.tsx
│   │   ├── breadcrumbs.tsx
│   │   └── page-header.tsx
│   ├── data-table/
│   │   ├── data-table.tsx        ← Reusable TanStack Table wrapper
│   │   ├── data-table-pagination.tsx
│   │   ├── data-table-toolbar.tsx
│   │   └── data-table-faceted-filter.tsx
│   ├── forms/
│   │   ├── category-form.tsx
│   │   ├── brand-form.tsx
│   │   ├── product-form.tsx
│   │   ├── promotion-form.tsx
│   │   └── shipping-method-form.tsx
│   └── shared/
│       ├── status-badge.tsx
│       ├── confirm-dialog.tsx
│       ├── loading-skeleton.tsx
│       └── error-boundary.tsx
├── actions/                         ← Next.js Server Actions
│   ├── auth.ts                      ← Login, logout server actions
│   ├── categories.ts                ← Category CRUD server actions
│   ├── brands.ts                    ← Brand CRUD server actions
│   ├── products.ts                  ← Product CRUD server actions
│   ├── orders.ts                    ← Order management server actions
│   ├── inventory.ts                 ← Inventory server actions
│   ├── promotions.ts                ← Promotions server actions
│   ├── shipping.ts                  ← Shipping server actions
│   ├── admins.ts                    ← Admin user management server actions
│   └── audit-logs.ts               ← Audit log server actions
├── lib/
│   ├── api/
│   │   └── client.ts             ← Shared fetch wrapper (base URL, headers, auth token)
│   ├── hooks/
│   │   ├── use-auth.ts           ← Auth state hook
│   │   ├── use-categories.ts     ← TanStack Query hooks for categories
│   │   ├── use-brands.ts
│   │   ├── use-products.ts
│   │   ├── use-orders.ts
│   │   ├── use-inventory.ts
│   │   ├── use-promotions.ts
│   │   ├── use-shipping.ts
│   │   ├── use-admins.ts
│   │   └── use-audit-logs.ts
│   ├── stores/
│   │   ├── auth-store.ts         ← Zustand auth store (token, user, role)
│   │   └── sidebar-store.ts      ← Sidebar collapse state
│   ├── validators/
│   │   ├── category.ts           ← Zod schemas for category forms
│   │   ├── brand.ts
│   │   ├── product.ts
│   │   ├── promotion.ts
│   │   └── shipping.ts
│   └── utils.ts                  ← cn(), formatCurrency(), formatDate()
├── types/
│   ├── api.ts                    ← API response envelope types
│   ├── category.ts
│   ├── brand.ts
│   ├── product.ts
│   ├── order.ts
│   ├── inventory.ts
│   ├── promotion.ts
│   ├── shipping.ts
│   ├── admin.ts
│   └── audit-log.ts
├── providers/
│   ├── query-provider.tsx        ← TanStack QueryClientProvider
│   ├── auth-provider.tsx         ← Auth guard + redirect
│   └── theme-provider.tsx        ← Dark/light mode
├── middleware.ts                 ← Next.js middleware (auth redirect)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

---

# 5. Authentication Flow

```
1. User visits /login
2. Submits email + password → login server action → POST /api/admin/v1/auth/login
3. Backend returns Sanctum token (with admin-access ability)
4. Token stored in HTTP-only cookie (via server action) + user in Zustand store
5. Server actions read token from cookies and attach: Authorization: Bearer {token}
6. middleware.ts redirects unauthenticated users to /login
7. On logout → logout server action → POST /api/admin/v1/auth/logout → clear cookie + store
```

### Token Storage

```typescript
// Token is stored in HTTP-only cookie (set by server action, read by server actions)
// User info is stored in Zustand for client-side UI rendering

// lib/stores/auth-store.ts
interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  setUser: (user: AdminUser) => void;
  clearUser: () => void;
}
```

---

# 6. API Client Architecture (Server Actions + fetch)

All API calls go through **Next.js Server Actions** — functions marked with `'use server'` that run on the server. The client never calls the backend directly.

```typescript
// lib/api/client.ts — shared fetch wrapper used inside server actions
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL + '/admin/v1';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    redirect('/login');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw error;
  }

  return res.json();
}
```

```typescript
// actions/categories.ts — example server action module
'use server';

import { apiFetch } from '@/lib/api/client';
import type { Category, CreateCategoryPayload, PaginatedResponse } from '@/types';

export async function getCategories(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<PaginatedResponse<Category>>(`/categories${query}`);
}

export async function createCategory(data: CreateCategoryPayload) {
  return apiFetch<{ data: Category }>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

---

# 7. Data Fetching Pattern (TanStack Query + Server Actions)

TanStack Query hooks call **server actions** as their query/mutation functions:

```typescript
// lib/hooks/use-categories.ts
import { getCategories, createCategory } from '@/actions/categories';

export function useCategories(params?: ListParams) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => getCategories(params),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created');
    },
  });
}
```

---

# 8. Data Table Pattern

All list pages use a reusable `<DataTable>` component built on TanStack Table:

```
Features:
  - Server-side pagination (page, per_page)
  - Server-side sorting (sort, direction)
  - Server-side filtering (status, search)
  - Column visibility toggles
  - Row actions (edit, delete, status change)
  - Bulk actions (delete selected)
  - Export (CSV) — future
```

---

# 9. Form Pattern

All forms use React Hook Form + Zod:

```typescript
// lib/validators/category.ts
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  parent_id: z.number().nullable().optional(),
  status: z.enum(['active', 'inactive']),
  sort_order: z.number().int().min(0).default(0),
});
```

---

# 10. Backend API Alignment

### Admin API Endpoints Consumed

| Module | Endpoints | Admin Panel Pages |
|---|---|---|
| Auth | `POST /auth/login`, `POST /auth/logout` | Login page |
| Categories | CRUD (5 endpoints) | Categories list, create, edit |
| Brands | CRUD (5 endpoints) | Brands list, create, edit |
| Products | CRUD (5) + Sales Units (2) | Products list, create, edit, sales units |
| Orders | List, show, update status, cancel, refund (5) | Orders list, order detail |
| Inventory | Adjust, movements (2) | Inventory overview, adjust form |
| Promotions | CRUD (5 endpoints) | Promotions list, create, edit |
| Shipping | Methods CRUD (4) + Zones (2) + Rates (1) = 7 | Shipping methods, zones |
| Admins | CRUD (4) + Roles (2) = 6 | Admin users, roles |
| Audit Logs | List (1) | Audit log viewer |

### API Response Types (TypeScript)

```typescript
// types/api.ts
interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    next: string | null;
    prev: string | null;
  };
}
```

---

# 11. Order Status State Machine (UI)

The admin panel must enforce the same status transitions as the backend:

```
Draft → Pending Payment → Paid → Processing → Shipped → Delivered
                                                              ↓
                         Cancelled ←──── (from any pre-shipped)
                         Refunded  ←──── (from Delivered)
```

UI renders only valid next-status buttons based on current order status.

---

# 12. Role-Aware UI

The sidebar and action buttons adapt based on the logged-in admin's role/permissions:

```
super_admin  → sees everything
admin        → sees everything except admin user management
manager      → sees orders, products (read-only), reports
support      → sees orders (refund only), audit logs
```

Environment variable: `NEXT_PUBLIC_API_URL` points to the Laravel backend.

---

# END
