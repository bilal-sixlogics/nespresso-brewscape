# E-Commerce Backend — Developer Documentation

**Version:** 1.0.0
**Laravel:** 12.x | **PHP:** 8.2+ | **Date:** 2026-03-05

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Domain Modules](#domain-modules)
5. [API Conventions](#api-conventions)
6. [Authentication & Authorization](#authentication--authorization)
7. [Database Schema Summary](#database-schema-summary)
8. [Request Lifecycle](#request-lifecycle)
9. [Repository Pattern](#repository-pattern)
10. [Actions / Use Cases](#actions--use-cases)
11. [DTOs](#dtos)
12. [Events & Jobs Catalogue](#events--jobs-catalogue)
13. [Caching Strategy](#caching-strategy)
14. [Security Rules](#security-rules)
15. [Testing Strategy](#testing-strategy)
16. [Deployment & Infrastructure](#deployment--infrastructure)
17. [Environment Variables](#environment-variables)

---

## 1. Overview

This is a **Laravel 12 API-only backend** for an e-commerce platform. It exposes two distinct API surfaces:

- **Admin API** (`/api/admin/v1/`) — used by the admin panel to manage products, orders, promotions, inventory, and users.
- **Website API** (`/api/v1/`) — used by the frontend website (SPA/SSR) and optionally a mobile app for browsing products, managing carts, and placing orders.

The application follows a **Modular Monolith** (Domain-Driven) architecture. All business logic is organized into domain modules under `app/Modules/`. The codebase is designed for clarity, maintainability, and horizontal scalability.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Laravel 12.x |
| Language | PHP 8.2+ |
| Database | MySQL 8.x |
| Cache / Queue / Session | Redis |
| Queue Dashboard | Laravel Horizon |
| Real-time | Laravel Reverb (WebSocket) |
| Authentication | Laravel Sanctum |
| File Storage | Local / S3-compatible |
| Payment Gateway | Stripe |
| Error Tracking | Sentry |
| Testing | PhpUnit + Laravel Feature Tests |
| Code Style | Laravel Pint (PSR-12) |

---

## 3. Project Structure

```
app/
├── Modules/                ← All domain modules live here
│   ├── Catalog/
│   ├── Inventory/
│   ├── Cart/
│   ├── Orders/
│   ├── Payments/
│   ├── Promotions/
│   ├── Shipping/
│   ├── Users/
│   ├── Notifications/
│   ├── AdminManagement/
│   └── Reporting/
├── Http/
│   └── Middleware/
├── Exceptions/
│   └── Handler.php
├── Providers/
│   ├── AppServiceProvider.php
│   └── RepositoryServiceProvider.php
└── Support/
    ├── Enums/
    ├── Helpers/
    └── Traits/

routes/
├── api_admin.php           ← Admin API routes
└── api_website.php         ← Website (public + user) routes
```

### Module Internal Structure

Every module shares this consistent internal layout:

```
Modules/{Name}/
  ├── Models/
  ├── Repositories/
  │   ├── Contracts/        ← interfaces
  │   └── Eloquent/         ← implementations
  ├── Actions/              ← business use cases
  ├── DTOs/                 ← readonly data transfer objects
  ├── Http/
  │   ├── Controllers/
  │   │   ├── Admin/
  │   │   └── Website/
  │   ├── Requests/         ← Form Request validators
  │   └── Resources/        ← API Resource transformers
  ├── Events/
  ├── Listeners/
  ├── Jobs/
  ├── Policies/
  └── Providers/
```

---

## 4. Domain Modules

| Module | Responsibility |
|---|---|
| **Users** | Registration, login, profile, address book |
| **Catalog** | Products, brands, categories, product images, sales units |
| **Inventory** | Stock tracking, reservations, movements, adjustments |
| **Cart** | Cart creation, item management, guest cart merging |
| **Orders** | Order lifecycle, state machine, order items, shipments |
| **Payments** | Stripe integration, webhook processing, payment transactions |
| **Promotions** | Coupon codes, automatic discounts, promotion evaluation pipeline |
| **Shipping** | Shipping methods, zones, rates, carrier integration |
| **Notifications** | Email & in-app notifications for order events |
| **AdminManagement** | Admin user management, roles, permissions, audit logs |
| **Reporting** | Sales reports, inventory reports, revenue analytics |

---

## 5. API Conventions

### Base URLs

| API | Base URL |
|---|---|
| Website (public) | `/api/v1/` |
| Admin | `/api/admin/v1/` |

### Versioning

URL-based versioning (`/v1/`, `/v2/`). Breaking changes introduce a new version.

### HTTP Methods

| Method | Purpose |
|---|---|
| `GET` | Fetch resource(s) |
| `POST` | Create resource |
| `PUT` | Full update of resource |
| `PATCH` | Partial update |
| `DELETE` | Soft delete resource |

### Response Format

**Success (single resource):**
```json
{
  "data": { "id": 1, "name": "Product Name" },
  "message": "Success",
  "status": true
}
```

**Success (paginated list):**
```json
{
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 100
  },
  "links": { "first": "...", "last": "...", "next": "...", "prev": null },
  "status": true
}
```

**Validation Error (422):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  },
  "status": false
}
```

**General Error:**
```json
{
  "message": "Insufficient stock for the requested item.",
  "status": false,
  "code": 422
}
```

### Pagination

Default: 20 items per page.
Query param: `?per_page=50&page=2`

### Filtering & Sorting

Query params:
- Filter: `?status=active&category_id=3`
- Sort: `?sort=price&direction=asc`
- Search: `?search=laptop`

---

## 6. Authentication & Authorization

### Authentication (Sanctum)

| Client | Method |
|---|---|
| Admin Panel | Sanctum token with `admin-access` ability |
| Website (SPA) | Sanctum SPA cookie-based auth |
| Website (Mobile) | Sanctum personal access token |

### Authorization (Policies)

- Every admin action is authorized through a **Policy class**.
- Form Request `authorize()` calls the relevant Policy.
- Role-based permissions via `spatie/laravel-permission`.

### Roles & Permissions

| Role | Permissions |
|---|---|
| `super_admin` | All permissions |
| `admin` | Manage products, orders, promotions, shipping |
| `manager` | View reports, manage orders |
| `support` | View orders, process refunds |

---

## 7. Database Schema Summary

| Table | Module | Notes |
|---|---|---|
| `users` | Users | Auth, profile |
| `categories` | Catalog | Hierarchical (self-referencing) |
| `brands` | Catalog | Product brands |
| `products` | Catalog | Core product record |
| `product_images` | Catalog | Multiple images per product |
| `product_sales_units` | Catalog | Packaging variants (5KG, 10KG) |
| `inventory_items` | Inventory | Current stock per sales unit |
| `inventory_movements` | Inventory | Stock transaction log |
| `carts` | Cart | User & guest carts |
| `cart_items` | Cart | Line items in cart |
| `orders` | Orders | Order header with totals |
| `order_items` | Orders | Snapshotted line items |
| `order_addresses` | Orders | Shipping + billing addresses |
| `order_shipments` | Orders | Shipment tracking |
| `order_payments` | Orders | Payment link |
| `order_promotions` | Orders | Promotions applied to order |
| `promotions` | Promotions | Rules + discount config |
| `promotion_conditions` | Promotions | Eligibility conditions |
| `promotion_targets` | Promotions | Target products/categories |
| `shipping_methods` | Shipping | Available methods |
| `shipping_zones` | Shipping | Geographic zones |
| `shipping_rates` | Shipping | Rate per zone + method |
| `payment_transactions` | Payments | Gateway transaction log |
| `audit_logs` | AdminManagement | All admin CUD actions |
| `notifications` | Notifications | Laravel notification store |
| `roles`, `permissions` | AdminManagement | spatie/laravel-permission |

**All monetary columns:** `DECIMAL(10,2)` — never `FLOAT`.
**All critical tables:** Include `deleted_at` (SoftDeletes).

---

## 8. Request Lifecycle

```
HTTP Request
   ↓
Route (api_admin.php / api_website.php)
   ↓
Middleware (auth:sanctum, throttle, ability)
   ↓
Form Request (authorize → validate → prepareForValidation)
   ↓
Controller (construct DTO → call Action)
   ↓
Action (business logic → Repository → Events)
   ↓
Repository (Eloquent queries)
   ↓
API Resource (transform model → JSON)
   ↓
HTTP Response
```

---

## 9. Repository Pattern

Repositories abstract all database queries. Controllers and Actions only interact with Repository interfaces.

```php
// Interface
interface ProductRepositoryInterface {
    public function findBySlug(string $slug): ?Product;
    public function listActive(array $filters): LengthAwarePaginator;
    public function create(array $data): Product;
    public function update(Product $product, array $data): Product;
}

// Eloquent Implementation
class EloquentProductRepository implements ProductRepositoryInterface {
    public function findBySlug(string $slug): ?Product {
        return Product::where('slug', $slug)->active()->first();
    }
    // ...
}
```

Bindings registered in `RepositoryServiceProvider`.

---

## 10. Actions / Use Cases

Each Action encapsulates **one business operation**. Actions receive a DTO and return a model or value object.

```php
class CreateOrderAction
{
    public function __construct(
        private OrderRepositoryInterface $orders,
        private InventoryService $inventory,
        private PromotionService $promotions,
    ) {}

    public function execute(CreateOrderDTO $dto): Order
    {
        return DB::transaction(function () use ($dto) {
            $this->inventory->reserveStock($dto->items);
            $order = $this->orders->create($dto);
            $this->promotions->applyToOrder($order, $dto->couponCode);
            event(new OrderCreated($order));
            return $order;
        });
    }
}
```

---

## 11. DTOs

PHP 8.2 readonly classes carry validated data from Controllers to Actions:

```php
readonly class CreateOrderDTO
{
    public function __construct(
        public ?int $userId,
        public string $userEmail,
        public array $items,          // [['product_sales_unit_id' => X, 'quantity' => Y]]
        public int $shippingMethodId,
        public ?string $couponCode,
        public array $shippingAddress,
    ) {}

    public static function fromRequest(CheckoutRequest $request): self
    {
        return new self(
            userId: auth()->id(),
            userEmail: $request->email,
            items: $request->items,
            shippingMethodId: $request->shipping_method_id,
            couponCode: $request->coupon_code,
            shippingAddress: $request->shipping_address,
        );
    }
}
```

---

## 12. Events & Jobs Catalogue

### Events

| Event Class | Fired By | Key Listeners |
|---|---|---|
| `OrderCreated` | `CreateOrderAction` | `SendOrderConfirmation`, `UpdateReporting` |
| `StockReserved` | `InventoryService` | *(monitoring)* |
| `StockReleased` | `InventoryService` | *(monitoring)* |
| `PaymentSucceeded` | Payment webhook | `ReduceInventoryListener`, `MarkOrderPaidListener`, `SendInvoiceListener` |
| `PaymentFailed` | Payment webhook | `ReleaseStockListener`, `NotifyPaymentFailedListener` |
| `PaymentRefunded` | `RefundOrderAction` | `RestoreStockListener`, `SendRefundEmailListener` |
| `OrderShipped` | Admin API | `SendShippingNotification` |
| `PromotionApplied` | `PromotionService` | *(analytics)* |

### Queue Jobs

| Job Class | Queue | Trigger |
|---|---|---|
| `SendOrderConfirmationEmailJob` | `default` | `OrderCreated` event |
| `SendShippingNotificationJob` | `default` | `OrderShipped` event |
| `GenerateInvoicePdfJob` | `default` | `PaymentSucceeded` event |
| `ProcessPaymentRefundJob` | `payments` | `RefundOrderAction` |
| `UpdateInventoryReportJob` | `reporting` | Post-payment |
| `SendPushNotificationJob` | `notifications` | Various order events |

---

## 13. Caching Strategy

All caching uses **Redis** with **tagged cache** for granular invalidation.

| Cache Tag | Keys | TTL | Busted On |
|---|---|---|---|
| `products` | `products.listing.*`, `products.detail.*` | 30 min | Product CUD |
| `categories` | `categories.tree` | 60 min | Category CUD |
| `brands` | `brands.listing` | 60 min | Brand CUD |
| `shipping` | `shipping_methods.active` | 60 min | Method update |
| `promotions` | `promotions.active` | 10 min | Promotion CUD |

```php
// Writing to cache
cache()->tags(['products'])->remember("products.listing.page.{$page}", 1800, fn() => ...);

// Invalidating on update
cache()->tags(['products'])->flush();
```

---

## 14. Security Rules

| Rule | How It's Enforced |
|---|---|
| Never trust frontend price | Server recalculates all totals in Actions |
| Never trust frontend stock | Stock check in `InventoryService` with DB lock |
| Webhook integrity | Stripe signature verified before processing |
| Rate limiting | `RateLimiter::for()` in `AppServiceProvider`, applied per route group |
| Admin audit trail | `AuditLog` record on every admin CUD |
| SQL injection | Eloquent ORM exclusively (no raw queries unless parameterized) |
| Mass assignment | All models use explicit `$fillable` |
| Soft deletes | `deleted_at` on all critical tables |
| Money storage | `DECIMAL(10,2)` columns only |
| CORS | Configured in `config/cors.php` per environment |
| Token scopes | `auth:sanctum` + `ability:admin-access` middleware on admin routes |

---

## 15. Testing Strategy

### Feature Tests (HTTP layer)

Test full request → response cycles including auth, validation, and DB state.

```
tests/Feature/
├── Admin/
│   ├── ProductTest.php      → CRUD, validation, unauthorized access
│   ├── OrderTest.php        → status transitions, refund
│   └── PromotionTest.php    → creation, application
└── Website/
    ├── AuthTest.php         → register, login, logout
    ├── CartTest.php         → add, update, remove
    ├── CheckoutTest.php     → full checkout flow
    └── OrderTest.php        → order history, detail
```

### Unit Tests (Isolated Logic)

Test Actions and Services with mocked repositories.

```
tests/Unit/
├── Actions/
│   ├── CreateOrderActionTest.php
│   └── ApplyPromotionActionTest.php
└── Services/
    └── InventoryServiceTest.php
```

### Rules

- Use `RefreshDatabase` + SQLite in-memory for speed.
- Model factories for every model.
- Minimum **80% code coverage** on Actions, Services, Repositories.
- Run: `php artisan test --coverage`

---

## 16. Deployment & Infrastructure

### Local (Development)

```bash
composer run dev
# Starts: php artisan serve | queue:listen | npm run dev
```

### Production Setup

```
Web Server:     Nginx + PHP-FPM
Queue Worker:   Laravel Horizon (supervised by Supervisor)
Cache/Queue:    Redis (dedicated server)
Database:       MySQL 8 (primary + read replica in Phase 2)
File Storage:   S3-compatible (MinIO / AWS S3)
Monitoring:     Horizon dashboard + Sentry
```

### Key Artisan Commands

```bash
php artisan migrate --force          # Run migrations
php artisan db:seed                  # Seed initial data
php artisan horizon                  # Start queue worker
php artisan config:cache             # Cache config (production)
php artisan route:cache              # Cache routes (production)
php artisan optimize                 # Full production optimization
```

---

## 17. Environment Variables

| Variable | Description |
|---|---|
| `APP_ENV` | `local` / `production` |
| `APP_KEY` | Laravel app encryption key |
| `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | MySQL connection |
| `REDIS_HOST`, `REDIS_PORT` | Redis connection |
| `QUEUE_CONNECTION` | `redis` (production) |
| `CACHE_DRIVER` | `redis` (production) |
| `SESSION_DRIVER` | `redis` (production) |
| `STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET` | Stripe credentials |
| `MAIL_MAILER`, `MAIL_HOST`, etc. | Email sending config |
| `FILESYSTEM_DISK` | `local` or `s3` |
| `AWS_*` | S3 credentials (if applicable) |
| `SENTRY_LARAVEL_DSN` | Sentry error tracking |
| `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET` | Laravel Reverb |

---

*Documentation generated from architecture.md — E-Commerce Backend v1.0*
