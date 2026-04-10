# Nespresso Brewscape — Project Status Report

**Date:** April 10, 2026
**Project:** Nespresso-themed e-commerce platform (monorepo)

---

## Architecture Overview

| Codebase | Stack | Port | Repo |
|---|---|---|---|
| **Customer Storefront** | Next.js 16 + React 19 + Tailwind v4 + Framer Motion 12 + Zustand | `3001` | nespresso-brewscape |
| **Admin Panel** | Next.js 16 + React 19 + shadcn/ui (Base UI) + TanStack Query | `3002` | cafrezzo-admin-panel |
| **Backend API** | Laravel 12 + Sanctum + spatie/laravel-permission | `8000` | cafrezoo-backend |

---

## 1. Admin Panel

### 1.1 Dashboard

| Feature | Status | Notes |
|---|---|---|
| Revenue summary (total, today) | **Working** | Aggregates from orders table |
| Product count + low stock alerts | **Working** | Real-time from inventory |
| Recent orders list (last 5) | **Working** | With status badges |
| Auto-refresh every 60s | **Working** | TanStack Query `refetchInterval` |

### 1.2 Products — Full CRUD

| Feature | Status | Notes |
|---|---|---|
| Product listing with search | **Working** | Paginated, filterable |
| Category filter | **Working** | Dropdown with all categories |
| Status filter (active/inactive/draft) | **Working** | Toggle switch in table rows |
| **Featured filter** | **Working** | Star toggle button in filter bar, filters `is_featured` via backend |
| Create product (4-step wizard) | **Working** | Details → Sale Units → Sections → Media |
| Edit product | **Working** | Same wizard pre-populated |
| Delete product (with confirmation) | **Working** | Modal confirmation dialog |
| Toggle featured (star icon) | **Working** | One-click toggle in product list |
| View product detail | **Working** | Full detail page with all sections |

#### Product Form — Step 1: Details
| Field | Status |
|---|---|
| Name (auto-generates slug) | **Working** |
| Tagline | **Working** |
| Description | **Working** |
| Category (dropdown) | **Working** |
| Brand (dropdown) | **Working** |
| Unit Type (dropdown) | **Working** |
| Selling Price | **Working** |
| Cost Price + margin calculation | **Working** |
| Status (active/inactive/draft) | **Working** |
| Weight | **Working** |
| Tags (multi-select) | **Working** |

#### Product Form — Step 2: Sale Units
| Feature | Status | Notes |
|---|---|---|
| Auto-create base unit from Step 1 | **Working** | Generated from name + unit type + price |
| Add multiple sale units | **Working** | Unlimited additional units |
| Direct pricing or % discount off base | **Working** | Price calculation preview shown |
| SKU per unit | **Working** | Mono-spaced input, uppercase |
| Initial stock per unit | **Working** | Visual green/amber indicator for stock > 0 vs 0 |
| Default unit toggle | **Working** | **Enforced: at least one must be default** |
| Active/inactive toggle per unit | **Working** | Deactivating default auto-promotes next active unit |
| Delete non-base units | **Working** | Deleting default auto-promotes next active unit |
| Base unit protection | **Working** | Cannot delete; deactivation requires other active units |
| Submit validation | **Working** | Blocks save if no unit is marked as default |

#### Product Form — Step 3: Sections (Rich Content)
| Feature | Status | Notes |
|---|---|---|
| Sections editor | **Working** | Add/remove/reorder content blocks |
| Section templates | **Working** | Apply pre-configured section sets |
| Section types: taste profile, notes, features, specs | **Working** | Stored as JSON in `sections` column |

#### Product Form — Step 4: Media
| Feature | Status | Notes |
|---|---|---|
| Image upload (up to 5) | **Working** | Via `/admin/v1/media/upload` |
| Set featured image | **Working** | Star icon on image thumbnail |
| Image size validation | **Working** | Oversized images flagged, blocked at submit |
| Drag reorder | **Working** | Sort order saved to backend |
| Delete images | **Working** | Remove from upload list |

### 1.3 Categories — Full CRUD

| Feature | Status |
|---|---|
| List with tree view (parent/child) | **Working** |
| Create with name, slug, icon, parent, storefront_page | **Working** |
| Edit | **Working** |
| Delete | **Working** |
| Storefront page assignment (`/shop`, `/machines`, `/accessories`, `/sweets`) | **Working** |

### 1.4 Brands — Full CRUD

| Feature | Status |
|---|---|
| List all brands | **Working** |
| Create (name, slug, logo, color) | **Working** |
| Edit | **Working** |
| Delete | **Working** |

### 1.5 Orders Management

| Feature | Status |
|---|---|
| Order listing (paginated) | **Working** |
| Order detail view | **Working** |
| Update order status | **Working** |
| Cancel order | **Working** |
| Refund order | **Working** |

### 1.6 Inventory Management

| Feature | Status | Notes |
|---|---|---|
| Stock overview per product | **Working** | Shows stock by sale unit |
| Stock adjustment form | **Working** | Select sale unit → adjust quantity |
| Inventory movements log | **Working** | Full audit trail per sale unit |

### 1.7 Promotions

| Feature | Status | Notes |
|---|---|---|
| Promotion listing | **Working** | |
| Create promotion | **Working** | Code, type, value, date range |
| Edit promotion | **Working** | |
| Delete promotion | **Working** | |
| Promotion conditions | **Working** | Min order, category/brand targeting |
| Promotion targets | **Working** | Product-level or order-level |
| **Storefront integration** | **Needs Testing** | Apply endpoint exists, checkout flow wired |

### 1.8 Shipping

| Feature | Status |
|---|---|
| Shipping methods CRUD | **Working** |
| Shipping zones CRUD | **Working** |
| Zone-based rates | **Working** |

### 1.9 Product Reviews (Admin)

| Feature | Status | Notes |
|---|---|---|
| View reviews per product | **Working** | Admin review list endpoint |
| Create review (admin-authored) | **Working** | For seeding/testing |
| Delete review | **Working** | |

### 1.10 Other Admin Features

| Feature | Status |
|---|---|
| Tags CRUD | **Working** |
| Unit Types CRUD | **Working** |
| Section Templates CRUD | **Working** |
| Admin Users + Roles (RBAC) | **Working** |
| Audit Logs viewer | **Working** |
| Site Settings | **Working** |
| Notifications (with 60s polling) | **Working** |
| Media upload (single + multi) | **Working** |
| i18n (EN, FR, AR) | **Working** |
| Dark mode | **Working** |

### 1.11 Admin Performance Config

| Setting | Value | Notes |
|---|---|---|
| TanStack Query staleTime | 5 minutes | Prevents refetch on tab switch |
| Notifications poll interval | 60 seconds | Was 15s, reduced to save resources |
| Debug console.logs | **Removed** | Were in product-form image handling |

---

## 2. Customer Storefront

### 2.1 Pages (22 total)

| Page | Route | API-Integrated | Notes |
|---|---|---|---|
| Home | `/` | **Yes** | Featured products from backend, brand marquee, testimonials |
| Shop | `/shop` | **Yes** | Full product catalog with filters, sort, pagination |
| Machines | `/machines` | **Yes** | Machine products with category pills, filters |
| Accessories | `/accessories` | **Yes** | Accessory products with category pills, filters |
| Sweets | `/sweets` | **Yes** | Sweet treats with category pills, filters |
| Product Detail | `/shop/[slug]` | **Yes** | Full PDP with images, intensity, notes, reviews, related |
| Checkout | `/checkout` | **Yes** | Cart → shipping → payment flow |
| Account | `/account` | **Yes** | Profile, addresses, order history |
| Wishlist | `/wishlist` | **Yes** | Persistent wishlist |
| Order Success | `/order-success` | **Yes** | Confirmation with confetti |
| Order Failed | `/order-failed` | **Yes** | Error state |
| Notifications | `/notifications` | **Yes** | User notification center |
| Blog | `/blog` | Static | Content pages |
| Brew Guide | `/brew-guide` | Static | Coffee brewing guide |
| Contact | `/contact` | Static | Contact form |
| FAQ | `/faq` | Static | Frequently asked questions |
| Visit Shop | `/visit-shop` | Static | Store locator |
| Wholesale | `/wholesale` | Static | B2B information |
| Loyalty | `/loyalty` | Static | Loyalty program info |
| Privacy | `/privacy` | Static | Privacy policy |
| Terms | `/terms` | Static | Terms of service |
| Shipping Info | `/shipping` | Static | Shipping policy |
| Returns | `/returns` | Static | Returns policy |

### 2.2 Four Storefronts — Product Filtering

All four storefronts share the same robust architecture:

**Common pattern across Shop, Machines, Accessories, Sweets:**
- `useProducts()` hook with `useMemo` stable params — no infinite re-fetches
- `useCategories()` + `useBrands()` hooks for real backend data
- Single source of truth: `filters.categories[0]` drives both pill UI and API query
- Category name → slug lookup before sending to backend
- `storefront_page` scoping per page (e.g., `/machines` only shows machine categories)
- Stale request cancellation via `requestIdRef` — no race conditions
- No-flash pattern: products remain visible until new data arrives

| Filter | Shop | Machines | Accessories | Sweets |
|---|---|---|---|---|
| Category pills (from backend) | **Yes** | **Yes** | **Yes** | **Yes** |
| Filter Drawer (side panel) | **Yes** | **Yes** | **Yes** | **Yes** |
| Brand filter | **Yes** | **Yes** | **Yes** | **Yes** |
| Price range slider | **Yes** | **Yes** | **Yes** | **Yes** |
| Intensity range slider | **Yes** | **Yes** | **Yes** | **Yes** |
| Tags filter | **Yes** | **Yes** | **Yes** | **Yes** |
| In-stock only toggle | **Yes** | **Yes** | **Yes** | **Yes** |
| Sort: relevance | **Yes** | **Yes** | **Yes** | **Yes** |
| Sort: price asc/desc | **Yes** | **Yes** | **Yes** | **Yes** |
| Sort: newest | **Yes** | **Yes** | **Yes** | **Yes** |
| Sort: popularity (client-side) | No | **Yes** | **Yes** | **Yes** |
| Reset all filters | **Yes** | **Yes** | **Yes** | **Yes** |
| Active filter count badge | **Yes** | **Yes** | **Yes** | **Yes** |
| Load more (pagination) | **Yes** | **Yes** | **Yes** | **Yes** |
| Recently viewed (shop only) | **Yes** | No | No | No |

### 2.3 Product Card (Premium Redesign)

| Feature | Status |
|---|---|
| 4:3 aspect ratio image with object-cover | **Working** |
| Branded SVG placeholder when no image | **Working** |
| Brand name (uppercase tracking) | **Working** |
| Product name + tagline | **Working** |
| Aromatic notes as green pills (up to 3) | **Working** |
| Inline intensity bars with Zap icon | **Working** |
| Price with green "Select" button | **Working** |
| Hover "View Details" overlay | **Working** |
| Best Seller / New / Eco badges | **Working** |

### 2.4 Product Detail Page

| Feature | Status | Notes |
|---|---|---|
| Image gallery with carousel | **Working** | Auto-scroll every 4s, thumbnail strip |
| Lightbox on click | **Working** | Full-screen image view |
| Wishlist heart button | **Working** | |
| Breadcrumb navigation | **Working** | Home → Shop → Category → Product |
| Tags display (best-seller, new, eco) | **Working** | |
| Star rating display | **Working** | From backend reviews |
| Price display | **Working** | From sale unit pricing |
| Intensity bar | **Working** | Full-width with label |
| Aromatic notes (green card) | **Working** | |
| Sale unit selector (multi-format) | **Working** | e.g., Single / Box of 6 / Carton |
| Quantity selector | **Working** | +/- buttons |
| Add to cart with total | **Working** | Animated button with confirmation |
| Share button | **Working** | |
| Description tab (rich text) | **Working** | With taste profile bars |
| Specifications tab | **Working** | Intensity, roast, origin, brew sizes |
| Reviews tab | **Working** | Rating summary + individual reviews |
| Related products grid | **Working** | Same-category products |
| Product Detail Panel (side sheet) | **Working** | Quick view from product grid |

### 2.5 Cart & Checkout

| Feature | Status |
|---|---|
| Cart drawer (slide-out) | **Working** |
| Add/remove/update quantities | **Working** |
| Cart persistence (context) | **Working** |
| Checkout flow | **Working** |

### 2.6 Auth & User

| Feature | Status |
|---|---|
| Login modal | **Working** |
| Registration | **Working** |
| Account page (profile edit) | **Working** |
| Protected routes | **Working** |

### 2.7 UI Components

| Component | Purpose |
|---|---|
| `ProductCard` | Premium product grid card |
| `ProductDetailPanel` | Side sheet quick-view panel |
| `FilterDrawer` | Mobile bottom-sheet / desktop left-drawer filters |
| `CartDrawer` | Slide-out shopping cart |
| `LoginModal` | Auth modal with login/register tabs |
| `ReviewModal` | Submit product review form |
| `IntensityBar` | Coffee intensity visualization |
| `RichText` | HTML content renderer for product descriptions |
| `SectionRenderer` | Renders product content sections |
| `LoadMoreButton` | Pagination "Load More" button |
| `ProductSkeleton` | Loading skeleton for product grid |
| `MobileCarousel` | Touch-friendly horizontal scroll |
| `TestimonialsSection` | Customer testimonials |
| `ProtectedRoute` | Auth guard wrapper |
| `Header` | Top navigation + mobile menu |
| `Footer` | Site footer with newsletter |
| `PromoStrip` | Rotating promo banner |
| `SiteChrome` | Layout wrapper |

### 2.8 State & Context

| Context/Store | Purpose |
|---|---|
| `CartContext` (Zustand) | Shopping cart state |
| `AuthContext` | User authentication state |
| `LanguageContext` | i18n (EN/FR) |
| `ThemeContext` | Dark/light mode |
| `WishlistContext` | Wishlist with localStorage |
| `RecentlyViewedContext` | Recently viewed products |
| `NotificationsContext` | User notifications |

---

## 3. Backend API

### 3.1 Modular Monolith — 11 Modules

| Module | Models | Controllers | Status |
|---|---|---|---|
| **Catalog** | Product, Category, Brand, ProductImage, ProductSalesUnit, ProductReview, Tag, UnitType | Admin + Storefront controllers | **Working** |
| **Inventory** | InventoryItem, InventoryMovement | AdminInventoryController | **Working** |
| **Cart** | Cart, CartItem | CartController | **Working** |
| **Orders** | Order, OrderItem, OrderAddress, OrderShipment, OrderPayment, OrderPromotion | Admin + Checkout + History controllers | **Working** |
| **Payments** | PaymentTransaction | PaymentController (Stripe) | **Working** |
| **Promotions** | Promotion, PromotionCondition, PromotionTarget | Admin + Storefront controllers | **Working** — Needs end-to-end testing |
| **Shipping** | ShippingMethod, ShippingZone, ShippingRate | Admin + Storefront controllers | **Working** |
| **Users** | User, UserAddress | Auth + Profile + Address controllers | **Working** |
| **Notifications** | AdminNotification | Admin + User notification controllers | **Working** |
| **AdminManagement** | AuditLog, SiteSetting | Dashboard, Settings, Media, AuditLog controllers | **Working** |
| **Reporting** | — | — | Scaffold only |

### 3.2 Database Schema (45 migrations)

Core tables: `users`, `products`, `categories`, `brands`, `product_images`, `product_sales_units`, `inventory_items`, `inventory_movements`, `carts`, `cart_items`, `orders`, `order_items`, `order_addresses`, `order_shipments`, `order_payments`, `order_promotions`, `payment_transactions`, `promotions`, `promotion_conditions`, `promotion_targets`, `shipping_methods`, `shipping_zones`, `shipping_rates`, `tags`, `unit_types`, `product_reviews`, `admin_notifications`, `audit_logs`, `site_settings`, `section_configs`, `personal_access_tokens`, `activity_log`, `permissions/roles`

### 3.3 Storefront API — Product Filters

The `CatalogController::products()` endpoint supports:

| Parameter | Type | Description |
|---|---|---|
| `category` | string | Category slug (includes child categories) |
| `category_id` | int | Category ID |
| `brand` | string | Brand slug |
| `brand_id` | int | Brand ID |
| `storefront_page` | string | Page scope: `/shop`, `/machines`, `/accessories`, `/sweets` |
| `featured` | boolean | Featured products only |
| `min_price` / `max_price` | number | Price range filter |
| `in_stock` | boolean | Only in-stock products |
| `intensity_min` / `intensity_max` | number | Intensity range (1-13) |
| `tags` | string | Comma-separated tag labels |
| `tag` | string | Single tag label |
| `search` | string | Full-text search (name, tagline, description) |
| `sort_by` | string | `price_asc`, `price_desc`, `newest`, `oldest`, `name_asc`, `name_desc` |
| `page` / `per_page` | int | Pagination |

### 3.4 Admin API Routes — Full Summary

| Resource | Endpoints | Methods |
|---|---|---|
| Products | `/products`, `/products/{id}` | GET, POST, PUT, DELETE |
| Product Featured | `/products/featured`, `/products/{id}/toggle-featured`, `/products/featured/order` | GET, POST, PUT |
| Product Sale Units | `/products/{id}/sale-units` | GET, POST |
| Product Reviews | `/products/{id}/reviews`, `/products/{id}/reviews/{reviewId}` | GET, POST, DELETE |
| Categories | `/categories`, `/categories/{id}` | GET, POST, PUT, DELETE |
| Brands | `/brands`, `/brands/{id}` | GET, POST, PUT, DELETE |
| Orders | `/orders`, `/orders/{id}`, `/orders/{id}/status`, `/orders/{id}/cancel`, `/orders/{id}/refund` | GET, PATCH, POST |
| Inventory | `/inventory/adjust`, `/inventory/{id}/movements` | POST, GET |
| Promotions | `/promotions`, `/promotions/{id}` | GET, POST, PUT, DELETE |
| Shipping | `/shipping/methods`, `/shipping/zones`, `/shipping/zones/{id}/rates` | GET, POST, PUT, DELETE |
| Tags | `/tags`, `/tags/{id}` | GET, POST, PUT, DELETE |
| Unit Types | `/unit-types`, `/unit-types/{id}` | GET, POST, PUT, DELETE |
| Section Templates | `/section-templates`, `/section-templates/{id}` | GET, POST, PUT, DELETE |
| Section Configs | `/section-configs`, `/section-configs/{type}` | GET, PUT |
| Admin Users | `/admins`, `/admins/{id}` | GET, POST, PUT, DELETE |
| Roles | `/roles` | GET, POST |
| Settings | `/settings` | GET, PUT |
| Dashboard | `/dashboard` | GET |
| Media | `/media/upload`, `/media/upload-multiple`, `/media` | POST, DELETE |
| Audit Logs | `/audit-logs` | GET |
| Notifications | `/notifications`, `/notifications/{id}/read`, `/notifications/read-all` | GET, POST |
| Auth | `/auth/login`, `/auth/logout` | POST |

### 3.5 Website API Routes — Full Summary

| Resource | Endpoints | Auth Required |
|---|---|---|
| Auth | `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password` | Partial |
| Products | `/products`, `/products/featured`, `/products/{slug}`, `/products/{slug}/reviews` | No |
| Categories | `/categories` | No |
| Brands | `/brands` | No |
| Cart | `/cart`, `/cart/items`, `/cart/items/{item}`, `/cart/merge` | Partial |
| Reviews | `POST /products/{slug}/reviews` | Yes |
| Promotions | `POST /promotions/apply` | Yes |
| Checkout | `POST /checkout` | Yes |
| Orders | `/orders`, `/orders/{order}`, `/orders/{order}/payment-status` | Yes |
| Profile | `/profile`, `/profile/password` | Yes |
| Addresses | `/addresses`, `/addresses/{id}` | Yes |
| Shipping | `/shipping-methods` | No |
| Notifications | `/notifications`, `/notifications/{id}/read`, `/notifications/read-all` | Yes |
| Localization | `/locales`, `/translations/{locale}` | No |
| Payments | `POST /payments/webhook` | Stripe signature |

---

## 4. What Needs Testing

| Area | Priority | Details |
|---|---|---|
| **Promotions end-to-end** | High | Backend CRUD works; `POST /promotions/apply` wired; needs full checkout flow test with promo code |
| **Stripe payment flow** | High | Webhook endpoint exists; needs live/test key integration verification |
| **Product images on storefront** | Medium | 12/15 products have no images — need to upload via admin panel |
| **Review submission from storefront** | Medium | `ReviewModal` wired to `POST /products/{slug}/reviews`; needs login + submit test |
| **Order status updates** | Medium | Admin can update; verify email notifications fire |
| **Inventory auto-deduction on order** | Medium | Verify stock decrements and movements logged on checkout |

---

## 5. Recent Session Fixes (April 10, 2026)

- **Product filtering robustness** — Rewrote `useProducts` hook with stale-request cancellation, no-flash pattern, `useMemo` stable params across all 4 storefronts
- **Category state unification** — Single source of truth via `filters.categories[0]` instead of dual state
- **Sale unit default enforcement** — 4-layer protection: block toggle-off, auto-promote on deactivate, auto-promote on delete, submit guard
- **Stock UX improvement** — Visual green/amber indicator on stock input field
- **Featured filter** — Added to admin product list + backend controller
- **Performance** — Removed 6 debug console.logs, reduced notification polling 15s → 60s, staleTime 30s → 5min
- **ProductCard premium redesign** — 4:3 images, brand name, intensity bars, note pills, hover overlay
- **Detail page hooks fix** — Moved `useEffect`/`useProducts` above conditional returns, fixing React crash
- **Nav reorder** — Shop before Contact, Contact at end
- **Home page** — Featured products only, removed hardcoded category pills
