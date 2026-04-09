# E-Commerce Admin Panel — Developer Documentation

**Version:** 1.0.0
**Stack:** Next.js 16 | TypeScript 5.x | Tailwind CSS 4.x | shadcn/ui
**Date:** 2026-03-10

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Getting Started](#3-getting-started)
4. [Project Structure](#4-project-structure)
5. [Environment Variables](#5-environment-variables)
6. [Authentication](#6-authentication)
7. [API Client](#7-api-client)
8. [Data Fetching (TanStack Query)](#8-data-fetching-tanstack-query)
9. [Forms & Validation](#9-forms--validation)
10. [Data Tables](#10-data-tables)
11. [UI Components (shadcn/ui)](#11-ui-components-shadcnui)
12. [Routing & Navigation](#12-routing--navigation)
13. [State Management](#13-state-management)
14. [Backend API Reference](#14-backend-api-reference)
15. [Theming & Dark Mode](#15-theming--dark-mode)
16. [Testing](#16-testing)
17. [Deployment](#17-deployment)

---

## 1. Overview

The Admin Panel is a **standalone Next.js SPA** that consumes the Laravel backend's Admin API (`/api/admin/v1/`). It provides CRUD interfaces for managing the e-commerce platform: products, orders, promotions, inventory, shipping, admin users, and audit logs.

**Key Design Decisions:**
- Fully decoupled from the backend — communicates only via REST API
- Client-side rendering for all dashboard pages (no SSR for admin)
- Next.js Server Actions for all API calls — no client-side HTTP library
- TanStack Query for all server state — wraps server actions for caching
- shadcn/ui for consistent, accessible UI components
- Role-aware rendering — UI adapts based on admin permissions

---

## 2. Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `next` | ^16.x | React framework with App Router + Server Actions |
| `react` | ^19.x | UI library |
| `typescript` | ^5.x | Type safety |
| `tailwindcss` | ^4.x | Utility-first CSS |
| `@shadcn/ui` | latest | Component library (installed via CLI) |
| `@tanstack/react-query` | ^5.x | Server state management |
| `@tanstack/react-table` | ^8.x | Headless data tables |
| `zustand` | ^5.x | Client state management |
| Server Actions + `fetch` | built-in | Server-side API calls (no Axios) |
| `react-hook-form` | ^7.x | Form handling |
| `@hookform/resolvers` | ^3.x | Zod resolver for RHF |
| `zod` | ^3.x | Schema validation |
| `recharts` | ^2.x | Dashboard charts |
| `lucide-react` | latest | Icons |
| `date-fns` | ^4.x | Date formatting |
| `sonner` | latest | Toast notifications |
| `next-themes` | latest | Dark/light mode |
| `nuqs` | latest | URL query state (for table filters) |

---

## 3. Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm
- Backend API running at `http://localhost:8000`

### Installation

```bash
# Clone and install
cd e-commerce-admin
npm install

# Configure env
cp .env.example .env.local
# Edit NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Run dev server
npm run dev
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run test` | Run tests (Vitest) |

---

## 4. Project Structure

```
e-commerce-admin/
├── actions/                ← Next.js Server Actions (one file per module)
├── app/                    ← Next.js App Router pages
│   ├── (auth)/             ← Login layout (no sidebar)
│   ├── (dashboard)/        ← Dashboard layout (sidebar + navbar)
│   │   ├── page.tsx        ← Dashboard home (analytics)
│   │   ├── categories/     ← Category CRUD pages
│   │   ├── brands/         ← Brand CRUD pages
│   │   ├── products/       ← Product CRUD pages + sales units
│   │   ├── orders/         ← Order management pages
│   │   ├── inventory/      ← Inventory management
│   │   ├── promotions/     ← Promotion CRUD pages
│   │   ├── shipping/       ← Shipping methods & zones
│   │   ├── admins/         ← Admin user management
│   │   ├── roles/          ← Role management
│   │   ├── audit-logs/     ← Audit log viewer
│   │   └── settings/       ← System settings
│   ├── layout.tsx          ← Root layout (providers)
│   └── globals.css         ← Tailwind base
├── components/
│   ├── ui/                 ← shadcn/ui auto-generated
│   ├── layout/             ← Sidebar, navbar, breadcrumbs
│   ├── data-table/         ← Reusable table components
│   ├── forms/              ← Module-specific form components
│   └── shared/             ← Status badges, dialogs, skeletons
├── lib/
│   ├── api/                ← Shared fetch wrapper (client.ts)
│   ├── hooks/              ← TanStack Query hooks (wrapping server actions)
│   ├── stores/             ← Zustand stores (auth, sidebar)
│   ├── validators/         ← Zod schemas (one per module form)
│   └── utils.ts            ← Utility functions
├── types/                  ← TypeScript interfaces (aligned with backend)
├── providers/              ← React context providers
└── middleware.ts           ← Auth guard middleware
```

---

## 5. Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api` |
| `NEXT_PUBLIC_APP_NAME` | App display name | `E-Commerce Admin` |
| `NEXT_PUBLIC_APP_URL` | Admin panel URL | `http://localhost:3000` |

### `.env.local` example

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME="E-Commerce Admin"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6. Authentication

### Flow
1. Admin visits `/login` → enters email + password
2. Login **server action** calls `POST /api/admin/v1/auth/login` → returns `{ token, user }`
3. Server action stores token in **HTTP-only cookie** (secure, not accessible to JS)
4. User info returned to client and stored in Zustand for UI rendering
5. All server actions read token from cookies and attach `Authorization: Bearer {token}`
6. `middleware.ts` checks cookie and redirects unauthenticated users to `/login`
7. On 401 response inside server action → redirect to `/login`
8. On logout → logout server action → `POST /api/admin/v1/auth/logout` → clear cookie + Zustand store

### Auth Store

```typescript
// Zustand store — only holds user info for client-side UI (no token)
interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  setUser: (user: AdminUser) => void;
  clearUser: () => void;
}
```

### Auth Guard (middleware.ts)

Reads the HTTP-only cookie set by the login server action:

```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
};
```

---

## 7. API Client (Server Actions + fetch)

All backend communication happens through **Next.js Server Actions** — `'use server'` functions that run exclusively on the server. The browser never calls the backend directly.

### Shared Fetch Wrapper

```typescript
// lib/api/client.ts
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

### Server Action Modules

Each backend module has a matching server action file in `actions/`:

```typescript
// actions/categories.ts
'use server';

import { apiFetch } from '@/lib/api/client';
import type { Category, CreateCategoryPayload, PaginatedResponse } from '@/types';

export async function getCategories(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<PaginatedResponse<Category>>(`/categories${query}`);
}

export async function getCategory(id: number) {
  return apiFetch<{ data: Category }>(`/categories/${id}`);
}

export async function createCategory(data: CreateCategoryPayload) {
  return apiFetch<{ data: Category }>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: number, data: Partial<CreateCategoryPayload>) {
  return apiFetch<{ data: Category }>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: number) {
  return apiFetch<void>(`/categories/${id}`, { method: 'DELETE' });
}
```

---

## 8. Data Fetching (TanStack Query + Server Actions)

### Query Hooks

Every module has query hooks that call **server actions** as their query/mutation functions:

```typescript
// lib/hooks/use-categories.ts
import {
  getCategories, getCategory, createCategory,
  updateCategory, deleteCategory,
} from '@/actions/categories';

export function useCategories(params?: ListParams) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => getCategories(params),
  });
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => getCategory(id).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create category');
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
    },
  });
}
```

### Query Key Convention

```
['categories']           — list
['categories', params]   — filtered list
['categories', id]       — single record
['orders', { status }]   — filtered orders
```

---

## 9. Forms & Validation

All forms use **React Hook Form** with **Zod** schemas for validation:

```typescript
// components/forms/category-form.tsx
const form = useForm<CategoryFormValues>({
  resolver: zodResolver(categorySchema),
  defaultValues: { name: '', slug: '', status: 'active', sort_order: 0 },
});
```

### Zod Schemas (aligned with backend Laravel validation)

```typescript
// lib/validators/category.ts
export const categorySchema = z.object({
  name: z.string().min(1, 'Required').max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Only lowercase, numbers, hyphens'),
  description: z.string().optional().nullable(),
  parent_id: z.number().nullable().optional(),
  status: z.enum(['active', 'inactive']),
  sort_order: z.coerce.number().int().min(0).default(0),
});
```

### Server Error Handling

Backend validation errors (422) map to form field errors:

```typescript
onError: (error: any) => {
  const errors = error?.errors;
  if (errors) {
    Object.entries(errors).forEach(([field, messages]) => {
      form.setError(field as any, { message: (messages as string[])[0] });
    });
  }
},
```

---

## 10. Data Tables

All list pages use a reusable `<DataTable>` component built on TanStack Table v8.

### Features
- Server-side pagination via URL params (`page`, `per_page`)
- Server-side sorting (`sort`, `direction`)
- Faceted filter dropdowns (status, category, brand)
- Text search with debounce
- Column visibility toggle
- Row action menus (edit, delete, change status)
- Responsive — horizontal scroll on mobile

### Column Definition Example

```typescript
const columns: ColumnDef<Product>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'category.name', header: 'Category' },
  { accessorKey: 'price', header: 'Price', cell: ({ row }) => formatCurrency(row.original.price) },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { id: 'actions', cell: ({ row }) => <RowActions product={row.original} /> },
];
```

---

## 11. UI Components (shadcn/ui)

### Required shadcn Components

Install via CLI: `npx shadcn@latest add [component]`

| Component | Usage |
|---|---|
| `button` | All buttons, actions |
| `input`, `textarea` | Form inputs |
| `select` | Dropdowns |
| `dialog` | Confirm delete, modals |
| `sheet` | Mobile sidebar |
| `table` | Data tables base |
| `card` | Dashboard cards, form wrappers |
| `badge` | Status badges |
| `dropdown-menu` | Row actions, user menu |
| `command` | Command palette (search) |
| `form` | React Hook Form integration |
| `toast` / `sonner` | Notifications |
| `tabs` | Order detail tabs |
| `skeleton` | Loading states |
| `separator` | Visual dividers |
| `breadcrumb` | Page breadcrumbs |
| `avatar` | User avatars |
| `sidebar` | Dashboard sidebar |
| `chart` | Dashboard charts (Recharts) |

---

## 12. Routing & Navigation

### Route Structure (App Router)

| Path | Page | Auth Required |
|---|---|---|
| `/login` | Login form | No |
| `/` | Dashboard (analytics) | Yes |
| `/categories` | Category list | Yes |
| `/categories/create` | Create category | Yes |
| `/categories/[id]/edit` | Edit category | Yes |
| `/brands` | Brand list | Yes |
| `/brands/create` | Create brand | Yes |
| `/brands/[id]/edit` | Edit brand | Yes |
| `/products` | Product list | Yes |
| `/products/create` | Create product | Yes |
| `/products/[id]/edit` | Edit product | Yes |
| `/products/[id]/sales-units` | Product sales units | Yes |
| `/orders` | Order list | Yes |
| `/orders/[id]` | Order detail + actions | Yes |
| `/inventory` | Stock overview | Yes |
| `/inventory/adjust` | Manual adjustment | Yes |
| `/promotions` | Promotion list | Yes |
| `/promotions/create` | Create promotion | Yes |
| `/promotions/[id]/edit` | Edit promotion | Yes |
| `/shipping/methods` | Shipping methods | Yes |
| `/shipping/zones` | Shipping zones + rates | Yes |
| `/admins` | Admin user list | Yes |
| `/admins/create` | Create admin | Yes |
| `/roles` | Role list | Yes |
| `/roles/create` | Create role | Yes |
| `/audit-logs` | Audit log viewer | Yes |
| `/settings` | System settings | Yes |

### Sidebar Navigation Items

```typescript
const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Catalog', icon: Package, children: [
    { label: 'Products', href: '/products', icon: ShoppingBag },
    { label: 'Categories', href: '/categories', icon: FolderTree },
    { label: 'Brands', href: '/brands', icon: Tag },
  ]},
  { label: 'Orders', href: '/orders', icon: ShoppingCart },
  { label: 'Inventory', href: '/inventory', icon: Warehouse },
  { label: 'Promotions', href: '/promotions', icon: Percent },
  { label: 'Shipping', icon: Truck, children: [
    { label: 'Methods', href: '/shipping/methods' },
    { label: 'Zones & Rates', href: '/shipping/zones' },
  ]},
  { label: 'Admin', icon: Shield, children: [
    { label: 'Users', href: '/admins' },
    { label: 'Roles', href: '/roles' },
    { label: 'Audit Logs', href: '/audit-logs' },
  ]},
  { label: 'Settings', href: '/settings', icon: Settings },
];
```

---

## 13. State Management

### Zustand Stores

| Store | Purpose | Persisted? |
|---|---|---|
| `auth-store` | Token, user, isAuthenticated | Yes (localStorage) |
| `sidebar-store` | Collapsed state | Yes (localStorage) |

React Query handles all server state. Zustand is only for UI/auth state.

---

## 14. Backend API Reference

### Base URL

```
{NEXT_PUBLIC_API_URL}/admin/v1
```

### Auth Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Admin login → returns token |
| `POST` | `/auth/logout` | Revoke current token |

### Categories

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/categories` | List (paginated) |
| `POST` | `/categories` | Create |
| `GET` | `/categories/{id}` | Show |
| `PUT` | `/categories/{id}` | Update |
| `DELETE` | `/categories/{id}` | Soft delete |

### Brands

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/brands` | List |
| `POST` | `/brands` | Create |
| `GET` | `/brands/{id}` | Show |
| `PUT` | `/brands/{id}` | Update |
| `DELETE` | `/brands/{id}` | Soft delete |

### Products

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/products` | List (paginated, filterable) |
| `POST` | `/products` | Create |
| `GET` | `/products/{id}` | Show |
| `PUT` | `/products/{id}` | Update |
| `DELETE` | `/products/{id}` | Soft delete |
| `GET` | `/products/{id}/sales-units` | List sales units |
| `POST` | `/products/{id}/sales-units` | Create sales unit |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/orders` | List (filterable: status, user_id, search) |
| `GET` | `/orders/{id}` | Show (with items, addresses, shipments) |
| `PATCH` | `/orders/{id}/status` | Update status (state machine) |
| `POST` | `/orders/{id}/cancel` | Cancel (releases stock) |
| `POST` | `/orders/{id}/refund` | Refund (Stripe + restore stock) |

### Inventory

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/inventory/adjust` | Manual stock adjustment |
| `GET` | `/inventory/{salesUnitId}/movements` | View stock movements |

### Promotions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/promotions` | List |
| `POST` | `/promotions` | Create |
| `GET` | `/promotions/{id}` | Show |
| `PUT` | `/promotions/{id}` | Update |
| `DELETE` | `/promotions/{id}` | Soft delete |

### Shipping

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/shipping-methods` | List methods |
| `POST` | `/shipping-methods` | Create method |
| `PUT` | `/shipping-methods/{id}` | Update method |
| `DELETE` | `/shipping-methods/{id}` | Delete method |
| `GET` | `/shipping-zones` | List zones |
| `POST` | `/shipping-zones` | Create zone |
| `POST` | `/shipping-zones/{id}/rates` | Add rate to zone |

### Admin Users & Roles

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admins` | List admins |
| `POST` | `/admins` | Create admin |
| `PUT` | `/admins/{id}` | Update admin |
| `DELETE` | `/admins/{id}` | Delete admin |
| `GET` | `/roles` | List roles |
| `POST` | `/roles` | Create role with permissions |

### Audit Logs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/audit-logs` | List (filterable) |

---

## 15. Theming & Dark Mode

- Use `next-themes` for system/dark/light toggle
- shadcn/ui supports dark mode out of the box via CSS variables
- Theme toggle in navbar user menu

---

## 16. Testing

| Layer | Tool | Focus |
|---|---|---|
| Unit | Vitest | Utility functions, validators |
| Component | React Testing Library | Form rendering, interactions |
| E2E | Playwright | Full flows (login → CRUD → logout) |

---

## 17. Deployment

### Build

```bash
npm run build    # Creates .next/ production build
npm run start    # Serves on port 3000
```

### Production Environment

```
Hosting: Vercel / Docker / Nginx
Node.js: 20+
Environment: Set NEXT_PUBLIC_API_URL to production backend URL
```

### Docker (optional)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

*Documentation aligned with Backend `documentation.md` v1.0 — E-Commerce Admin Panel*
