# E-Commerce Backend Architecture (Laravel)

Version: ID-ARCH-00002
Updated: 2026-03-05
Laravel Version: 12.x | PHP: 8.2+

Focus: **Backend Architecture for Admin APIs and Website APIs only.**

---

# 1. Architecture Principles

Core principles:

- **Modular Monolith** (Domain-Driven Design)
- **API-first backend** — all interactions via JSON API
- **Separate API layers:**
  - Admin APIs (`/api/admin/v1/`)
  - Website APIs (`/api/v1/`)
- **Event-driven internal architecture** (Laravel Events + Listeners)
- **Redis** for cache, queues, and sessions
- **Strict backend validation** — never trust frontend data (Form Requests)
- **Transactional consistency** for orders, inventory, and payments
- **Repository pattern** — decouple data access from business logic
- **Actions / Use Cases** — single-responsibility business operations
- **DTOs** — type-safe data transfer between layers
- **Soft Deletes** — no hard deletes on critical business records
- **Audit Logging** — all admin actions recorded
- **Money as DECIMAL(10,2)** — never use float for currency

---

# 2. System Components

```
Clients:
  - Website Frontend (SPA/SSR)
  - Admin Panel (SPA)
  - Mobile App (optional, future)

Backend Stack:
  - Laravel 12.x Application (PHP 8.2+)
  - MySQL 8.x (primary database)
  - Redis (cache + queue + session)
  - Local / S3-compatible Object Storage (product images)
  - Stripe (payment gateway)
  - Shipping Provider (pluggable)
  - Laravel Horizon (queue dashboard)
  - Laravel Reverb (WebSocket / real-time events)
  - Sentry (error tracking)
```

---

# 3. Domain Modules

```
app/Modules/
  ├── Users/
  ├── Catalog/
  ├── Inventory/
  ├── Cart/
  ├── Orders/
  ├── Payments/
  ├── Promotions/
  ├── Shipping/
  ├── Notifications/
  ├── AdminManagement/
  └── Reporting/
```

### Module Internal Structure

Each module follows this structure:

```
Modules/{Name}/
  ├── Models/
  ├── Migrations/           ← module-specific migrations (optional)
  ├── Repositories/
  │   ├── Contracts/        ← interfaces
  │   └── Eloquent/         ← Eloquent implementations
  ├── Actions/              ← single-responsibility use-case classes
  ├── DTOs/                 ← Data Transfer Objects (readonly classes)
  ├── Http/
  │   ├── Controllers/
  │   │   ├── Admin/
  │   │   └── Website/
  │   ├── Requests/         ← Form Request validation classes
  │   └── Resources/        ← API Resource transformers
  ├── Events/
  ├── Listeners/
  ├── Jobs/
  ├── Policies/
  └── Providers/            ← module service provider
```

---

# 4. Laravel Directory Structure

```
app/
├── Modules/
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
│   ├── Middleware/
│   └── Kernel.php
├── Exceptions/
│   └── Handler.php         ← global error handling
├── Providers/
│   ├── AppServiceProvider.php
│   └── RepositoryServiceProvider.php  ← binds interfaces → implementations
└── Support/
    ├── Enums/              ← shared PHP 8.1+ backed enums
    ├── Helpers/
    └── Traits/

routes/
├── api_admin.php           ← admin API routes (auth:sanctum + admin middleware)
└── api_website.php         ← public/authenticated website routes

database/
├── migrations/
├── factories/
└── seeders/

config/
tests/
├── Feature/
│   ├── Admin/
│   └── Website/
└── Unit/
```

---

# 5. Service Provider & Binding Strategy

### RepositoryServiceProvider

All repository interface → Eloquent implementation bindings are registered here:

```php
// app/Providers/RepositoryServiceProvider.php
$this->app->bind(ProductRepositoryInterface::class, EloquentProductRepository::class);
$this->app->bind(OrderRepositoryInterface::class, EloquentOrderRepository::class);
// ...etc
```

### Module Service Providers

Each module may have its own `ModuleServiceProvider` registered in `bootstrap/providers.php` to handle module-level bindings, event registrations, and route loading.

---

# 6. Request Validation (Form Requests)

All incoming data is validated via dedicated **Form Request** classes (never inline in controllers).

```
Modules/Catalog/Http/Requests/
  ├── StoreProductRequest.php
  ├── UpdateProductRequest.php
  └── ListProductRequest.php
```

Rules:
- `authorize()` delegates to Policies.
- `rules()` defines strict validation.
- `prepareForValidation()` sanitizes input before rules run.
- Custom error messages defined in `messages()`.

---

# 7. API Resources (Response Transformers)

All API responses are wrapped in **Laravel API Resources** — never return raw Eloquent models.

```
Modules/Catalog/Http/Resources/
  ├── ProductResource.php
  ├── ProductCollection.php
  ├── CategoryResource.php
  └── BrandResource.php
```

Standard API response envelope:

```json
{
  "data": { ... },
  "message": "Success",
  "status": true
}
```

Paginated collections:

```json
{
  "data": [ ... ],
  "meta": { "current_page": 1, "last_page": 5, "total": 100 },
  "links": { "first": "...", "last": "...", "next": "..." }
}
```

Error responses:

```json
{
  "message": "Validation failed",
  "errors": { "field": ["Error message."] },
  "status": false
}
```

---

# 8. DTOs (Data Transfer Objects)

PHP 8.2 **readonly classes** used as DTOs to pass structured data between layers.

```php
// Modules/Orders/DTOs/CreateOrderDTO.php
readonly class CreateOrderDTO
{
    public function __construct(
        public int $userId,
        public string $userEmail,
        public array $items,
        public int $shippingMethodId,
        public ?string $couponCode,
    ) {}
}
```

DTOs are created from Form Requests and passed to Actions. Controllers never call repositories directly.

---

# 9. Actions / Use Cases

Single-responsibility classes that encapsulate one business operation.

```
Modules/Orders/Actions/
  ├── CreateOrderAction.php
  ├── CancelOrderAction.php
  ├── RefundOrderAction.php
  └── MarkOrderShippedAction.php
```

```php
// Modules/Orders/Actions/CreateOrderAction.php
class CreateOrderAction
{
    public function __construct(
        private OrderRepositoryInterface $orders,
        private InventoryService $inventory,
    ) {}

    public function execute(CreateOrderDTO $dto): Order
    {
        // 1. Validate stock
        // 2. Reserve inventory (DB transaction)
        // 3. Snapshot prices
        // 4. Create order record
        // 5. Dispatch OrderCreated event
    }
}
```

---

# 10. Error Handling

Global exception handling in `app/Exceptions/Handler.php`.

Custom exception classes per domain:

```
app/Exceptions/
  ├── InsufficientStockException.php
  ├── PaymentFailedException.php
  ├── InvalidPromotionException.php
  ├── OrderCancellationException.php
  └── UnauthorizedAdminActionException.php
```

All uncaught exceptions render as JSON in API context:

```json
{
  "message": "Insufficient stock for the requested item.",
  "status": false,
  "code": 422
}
```

---

# 11. Catalog Architecture

Product structure is simplified — **no variants**. Products belong to: Brand, Category.

### 11.1 Categories

```sql
categories
  id               BIGINT UNSIGNED PK
  name             VARCHAR(255)
  slug             VARCHAR(255) UNIQUE
  description      TEXT NULL
  parent_id        BIGINT NULL (FK → categories.id)  ← hierarchical
  status           ENUM('active','inactive') DEFAULT 'active'
  sort_order       INT DEFAULT 0
  created_at, updated_at, deleted_at (SoftDeletes)
```

Supports: `Category → Subcategory → Sub-subcategory`

### 11.2 Brands

```sql
brands
  id               BIGINT UNSIGNED PK
  name             VARCHAR(255)
  slug             VARCHAR(255) UNIQUE
  logo             VARCHAR(500) NULL
  description      TEXT NULL
  status           ENUM('active','inactive') DEFAULT 'active'
  created_at, updated_at, deleted_at (SoftDeletes)
```

### 11.3 Products

```sql
products
  id               BIGINT UNSIGNED PK
  name             VARCHAR(255)
  slug             VARCHAR(255) UNIQUE
  description      LONGTEXT (Rich Text)
  brand_id         FK → brands.id
  category_id      FK → categories.id
  price            DECIMAL(10,2)
  cost_price       DECIMAL(10,2)
  status           ENUM('active','inactive','draft')
  weight           DECIMAL(8,2) NULL
  created_at, updated_at, deleted_at (SoftDeletes)
```

**Important rule:** Orders must **snapshot price at time of purchase**. Never rely on product price after order creation.

### 11.4 Product Images

```sql
product_images
  id               BIGINT UNSIGNED PK
  product_id       FK → products.id
  path             VARCHAR(500)
  sort_order       INT DEFAULT 0
  is_primary       BOOLEAN DEFAULT false
  created_at, updated_at
```

---

# 12. Product Sales Units (Packaging)

Products sold in different packaging units (no variants).

```
Example:
  Rice → 5KG Pack | 10KG Bag | Carton of 5 Pieces
```

```sql
product_sales_units
  id               BIGINT UNSIGNED PK
  product_id       FK → products.id
  name             VARCHAR(255)   (e.g. "5KG Pack")
  unit_type        VARCHAR(50)    (e.g. "kg", "piece", "carton")
  quantity         DECIMAL(8,2)
  price            DECIMAL(10,2)
  sku              VARCHAR(100) UNIQUE
  stock            INT DEFAULT 0
  is_default       BOOLEAN DEFAULT false
  status           ENUM('active','inactive')
  created_at, updated_at, deleted_at (SoftDeletes)
```

---

# 13. Inventory Architecture

```sql
inventory_items
  id                    BIGINT UNSIGNED PK
  product_sales_unit_id FK → product_sales_units.id
  stock                 INT DEFAULT 0
  reserved_stock        INT DEFAULT 0
  created_at, updated_at

inventory_movements
  id                    BIGINT UNSIGNED PK
  product_sales_unit_id FK → product_sales_units.id
  type                  ENUM('sale','adjustment','refund','reservation','release')
  quantity              INT
  reference_id          BIGINT NULL    (order_id, adjustment_id, etc.)
  reference_type        VARCHAR(100) NULL
  note                  TEXT NULL
  created_by            FK → users.id NULL
  created_at
```

### Inventory Flow

```
Checkout         → reserve_stock  (reserved_stock++)
Payment success  → reduce_stock   (stock--, reserved_stock--)
Payment fail     → release_stock  (reserved_stock--)
Refund           → restore_stock  (stock++)
```

**Rules:**
- Use DB transactions + `lockForUpdate()` to prevent race conditions.
- Emit `StockReserved`, `StockReleased`, `StockRestored` events.

---

# 14. Cart Architecture

```sql
carts
  id               BIGINT UNSIGNED PK
  user_id          FK → users.id NULL (guest carts allowed)
  session_id       VARCHAR(100) NULL  (for guest carts)
  status           ENUM('active','converted','abandoned')
  expires_at       TIMESTAMP NULL
  created_at, updated_at

cart_items
  id                    BIGINT UNSIGNED PK
  cart_id               FK → carts.id
  product_sales_unit_id FK → product_sales_units.id
  quantity              INT
  unit_price            DECIMAL(10,2)  ← snapshot at cart add time
  created_at, updated_at
```

**Rules:**
- Backend recalculates all totals at checkout — never trust frontend totals.
- Promotions applied server-side only.
- Stock validated before checkout.
- Guest carts merged with user cart on login.

---

# 15. Order Architecture

### Order State Machine

```
Draft → Pending Payment → Paid → Processing → Shipped → Delivered
                                                              ↓
                         Cancelled ←──────── (from any pre-shipped state)
                         Refunded  ←──────── (from Delivered)
```

```sql
orders
  id               BIGINT UNSIGNED PK
  user_id          FK → users.id NULL  (nullable: guest checkout)
  user_email       VARCHAR(255)
  user_phone       VARCHAR(50) NULL
  status           ENUM('draft','pending_payment','paid','processing','shipped','delivered','cancelled','refunded')
  subtotal         DECIMAL(10,2)
  discount_total   DECIMAL(10,2) DEFAULT 0
  shipping_total   DECIMAL(10,2)
  grand_total      DECIMAL(10,2)
  currency         CHAR(3) DEFAULT 'USD'
  notes            TEXT NULL
  created_at, updated_at, deleted_at (SoftDeletes)

order_items
  id                        BIGINT UNSIGNED PK
  order_id                  FK → orders.id
  product_id                FK → products.id
  product_sales_unit_id     FK → product_sales_units.id
  product_name_snapshot     VARCHAR(255)   ← never changes
  unit_name_snapshot        VARCHAR(255)   ← never changes
  unit_price_snapshot       DECIMAL(10,2)  ← never changes
  quantity                  INT
  total_price               DECIMAL(10,2)
  created_at

order_addresses
  id               BIGINT UNSIGNED PK
  order_id         FK → orders.id
  type             ENUM('shipping','billing')
  name             VARCHAR(255)
  address_line1    VARCHAR(500)
  address_line2    VARCHAR(500) NULL
  city             VARCHAR(100)
  state            VARCHAR(100) NULL
  postal_code      VARCHAR(20)
  country          CHAR(2)
  phone            VARCHAR(50) NULL
  created_at

order_shipments
  id               BIGINT UNSIGNED PK
  order_id         FK → orders.id
  shipping_method_id  FK → shipping_methods.id
  tracking_number  VARCHAR(255) NULL
  carrier          VARCHAR(100) NULL
  shipped_at       TIMESTAMP NULL
  delivered_at     TIMESTAMP NULL
  created_at, updated_at

order_payments
  id               BIGINT UNSIGNED PK
  order_id         FK → orders.id
  transaction_id   FK → payment_transactions.id
  created_at

order_promotions
  id               BIGINT UNSIGNED PK
  order_id         FK → orders.id
  promotion_id     FK → promotions.id
  discount_applied DECIMAL(10,2)
  created_at
```

**Snapshotting rule:** Order items must always snapshot `product_name`, `unit_name`, `unit_price` — so historical orders are immutable.

---

# 16. Promotions Architecture

Supports:
- Product discount (specific product or category)
- Cart total discount
- Shipping discount / free shipping thresholds

```sql
promotions
  id               BIGINT UNSIGNED PK
  name             VARCHAR(255)
  code             VARCHAR(100) UNIQUE NULL  (coupon code, null = automatic)
  type             ENUM('product','cart','shipping')
  discount_type    ENUM('percentage','fixed')
  discount_value   DECIMAL(10,2)
  min_order_amount DECIMAL(10,2) NULL
  max_uses         INT NULL
  used_count       INT DEFAULT 0
  start_date       TIMESTAMP NULL
  end_date         TIMESTAMP NULL
  priority         INT DEFAULT 0
  is_stackable     BOOLEAN DEFAULT false
  status           ENUM('active','inactive')
  created_at, updated_at, deleted_at (SoftDeletes)

promotion_conditions
  id               BIGINT UNSIGNED PK
  promotion_id     FK → promotions.id
  condition_type   VARCHAR(100)  (min_qty, min_amount, category_id, product_id)
  condition_value  VARCHAR(255)
  created_at

promotion_targets
  id               BIGINT UNSIGNED PK
  promotion_id     FK → promotions.id
  target_type      VARCHAR(100)  (product, category, brand)
  target_id        BIGINT
  created_at
```

### Promotion Evaluation Pipeline

```
1. Collect applicable promotions (by type, validity, conditions)
2. Validate each promotion's conditions against cart
3. Sort by priority (highest priority first)
4. Apply rules (calculate discounts)
5. Prevent stacking if is_stackable = false
6. Return discount breakdown
```

---

# 17. Shipping Architecture

```sql
shipping_methods
  id               BIGINT UNSIGNED PK
  name             VARCHAR(255)   (Standard, Express)
  description      TEXT NULL
  base_price       DECIMAL(10,2)
  estimated_days_min INT
  estimated_days_max INT
  active           BOOLEAN DEFAULT true
  created_at, updated_at

shipping_zones
  id               BIGINT UNSIGNED PK
  name             VARCHAR(255)
  countries        JSON           (array of country codes)
  created_at, updated_at

shipping_rates
  id               BIGINT UNSIGNED PK
  shipping_zone_id FK → shipping_zones.id
  shipping_method_id FK → shipping_methods.id
  rate             DECIMAL(10,2)
  weight_from      DECIMAL(8,2) NULL
  weight_to        DECIMAL(8,2) NULL
  created_at, updated_at
```

- Shipping cost calculated dynamically during checkout.
- Promotions may override/zero shipping cost.
- Pluggable: external provider (e.g., EasyPost) can be integrated behind an interface.

---

# 18. Payment Architecture

```sql
payment_transactions
  id               BIGINT UNSIGNED PK
  order_id         FK → orders.id
  gateway          VARCHAR(100)   (stripe, paypal, etc.)
  gateway_txn_id   VARCHAR(255) UNIQUE
  status           ENUM('pending','succeeded','failed','refunded')
  amount           DECIMAL(10,2)
  currency         CHAR(3)
  payload_snapshot JSON           (full gateway response stored)
  created_at, updated_at
```

### Webhook Rules

- **Idempotent processing** — check `gateway_txn_id` before processing.
- **Signature verification** — verify webhook signature from gateway.
- **Database transaction** — wrap status updates in DB transaction.
- **Emit events** — `PaymentSucceeded`, `PaymentFailed`, `PaymentRefunded`.

### Events

```
PaymentSucceeded  → reduce inventory, mark order Paid, send confirmation email
PaymentFailed     → release inventory reservation, notify user
PaymentRefunded   → restore inventory, mark order Refunded
```

---

# 19. Authentication & Authorization

### Authentication (Laravel Sanctum)

- **Admin API:** Sanctum token with `admin` ability scope.
- **Website API:** Sanctum token for authenticated users (SPA cookies or tokens).
- **Public endpoints:** No auth required (product listing, categories, etc.).

### Token Scopes / Abilities

```
admin-access   → all admin endpoints
user-access    → website order/profile/cart endpoints
```

### Authorization (Policies)

Each module has Policies registered in its Service Provider:

```
Modules/Catalog/Policies/ProductPolicy.php
Modules/Orders/Policies/OrderPolicy.php
Modules/AdminManagement/Policies/AdminPolicy.php
```

### Role-Based Access Control

```sql
-- Using spatie/laravel-permission (recommended) OR custom:
roles: super_admin, admin, manager, support
permissions: product.create, order.refund, promotion.manage, ...
```

---

# 20. Audit Logging

All admin CUD (create/update/delete) actions are logged.

```sql
audit_logs
  id               BIGINT UNSIGNED PK
  user_id          FK → users.id
  action           VARCHAR(100)   (created, updated, deleted)
  model_type       VARCHAR(255)
  model_id         BIGINT
  old_values       JSON NULL
  new_values       JSON NULL
  ip_address       VARCHAR(45)
  user_agent       TEXT NULL
  created_at
```

Use a trait `HasAuditLog` applied to models that need tracking, or `spatie/laravel-activitylog`.

---

# 21. Admin API Architecture

```
Base URL: /api/admin/v1/

Middleware stack:
  - auth:sanctum
  - ability:admin-access
  - throttle:admin
  - LogAdminRequest (custom)

Responsibilities:
  - Product CRUD
  - Brand CRUD
  - Category CRUD
  - Product Sales Units CRUD
  - Inventory adjustments & movements
  - Orders management (view, update status, cancel, refund)
  - Shipping configuration
  - Promotion configuration
  - User management
  - Audit log viewing
  - Dashboard reporting
```

---

# 22. Website API Architecture

```
Base URL: /api/v1/

Public endpoints (no auth):
  GET /products
  GET /products/{slug}
  GET /categories
  GET /brands
  GET /shipping-methods

Authenticated endpoints (auth:sanctum):
  POST /auth/register
  POST /auth/login
  POST /auth/logout
  GET  /profile
  PUT  /profile
  GET  /cart
  POST /cart/items
  PUT  /cart/items/{id}
  DELETE /cart/items/{id}
  POST /checkout
  GET  /orders
  GET  /orders/{id}
  POST /promotions/apply
```

All responses handled via Laravel API Resources.

---

# 23. Rate Limiting

Defined in `AppServiceProvider::boot()` using `RateLimiter::for()`:

```
throttle:auth       → 10 req/min  (login, register)
throttle:checkout   → 5 req/min   (checkout, payment)
throttle:api        → 60 req/min  (general website API)
throttle:admin      → 120 req/min (admin API)
```

---

# 24. Events & Jobs

Use **Laravel Reverb** for real-time broadcasting.

### Key Events

| Event | Dispatcher | Listeners |
|---|---|---|
| `OrderCreated` | CreateOrderAction | SendOrderConfirmation, UpdateReporting |
| `StockReserved` | InventoryService | — |
| `PaymentSucceeded` | PaymentWebhook | ReduceStock, MarkOrderPaid, SendInvoice |
| `PaymentFailed` | PaymentWebhook | ReleaseStock, NotifyUser |
| `OrderShipped` | Admin API | SendShippingNotification |
| `PromotionApplied` | CartService | — |
| `PaymentRefunded` | RefundAction | RestoreStock, SendRefundEmail |

### Heavy Jobs (Queue)

```
SendOrderConfirmationEmail    → default queue
GenerateInvoicePdfJob         → default queue
UpdateInventoryReportJob      → reporting queue
ProcessPaymentRefundJob       → payments queue
SendPushNotificationJob       → notifications queue
```

---

# 25. Caching Strategy

Redis caching with tagged cache for easy invalidation.

| Cache Key | TTL | Invalidated On |
|---|---|---|
| `products.listing.*` | 30 min | Product create/update/delete |
| `categories.tree` | 60 min | Category create/update/delete |
| `brands.listing` | 60 min | Brand create/update/delete |
| `shipping_methods.active` | 60 min | Shipping method update |
| `promotions.active` | 10 min | Promotion create/update/delete |

Use cache tags: `cache()->tags(['products'])->remember(...)` for easy flush.

---

# 26. Notifications

Laravel Notifications system:

```
Modules/Notifications/
  ├── OrderConfirmedNotification.php    (mail + database)
  ├── OrderShippedNotification.php      (mail + database)
  ├── OrderDeliveredNotification.php    (mail + database)
  ├── PaymentFailedNotification.php     (mail + database)
  └── RefundProcessedNotification.php   (mail + database)
```

Notification channels: **Mail**, **Database** (stored in `notifications` table).

Future: SMS, Push (Firebase FCM).

---

# 27. Security Strategy

Critical rules:

| Rule | Implementation |
|---|---|
| Never trust frontend price | Recalculate totals server-side in every Action |
| Webhook security | Verify gateway signature on every webhook |
| Rate limiting | Throttle on checkout and auth endpoints |
| Admin audit | Log all CUD actions |
| Soft deletes | Never hard delete critical records |
| Money precision | DECIMAL(10,2) for all monetary fields |
| SQL injection prevention | Eloquent ORM (never raw queries) |
| Mass assignment | `$fillable` (explicit) or `$guarded = []` (never blindly) |
| CORS | Configured per environment |
| API tokens | Short-lived, ability-scoped Sanctum tokens |

---

# 28. Testing Strategy

```
tests/
├── Feature/
│   ├── Admin/
│   │   ├── ProductTest.php
│   │   ├── OrderTest.php
│   │   └── PromotionTest.php
│   └── Website/
│       ├── CartTest.php
│       ├── CheckoutTest.php
│       └── OrderTest.php
└── Unit/
    ├── Actions/
    │   ├── CreateOrderActionTest.php
    │   └── ApplyPromotionActionTest.php
    └── Services/
        └── InventoryServiceTest.php
```

**Rules:**
- Feature tests cover full HTTP request → response cycle.
- Unit tests cover Actions and Services in isolation (mocked repositories).
- Use `RefreshDatabase` trait (SQLite in-memory for speed).
- Model factories for every model.
- Minimum 80% coverage on business logic layers.

---

# 29. Observability

| Tool | Purpose |
|---|---|
| Laravel Horizon | Queue monitoring dashboard |
| Sentry | Error tracking and alerting |
| Laravel Pail | Local log tailing |
| Structured Logs | JSON logs for production log aggregator |
| Business metrics | Order count, revenue, abandoned carts tracked |

---

# 30. Scalability Plan

### Phase 1 — MVP (Current)
- Single MySQL database
- Horizontal app scaling (multiple PHP workers)
- Redis cache & queue
- Single queue worker

### Phase 2 — Growth
- MySQL read replicas
- Separate queue workers per queue (payments, notifications, default)
- CDN for product images

### Phase 3 — Scale
- Extract Payment module to microservice if throughput demands it
- Consider read-model / CQRS for Reporting module

---

# END
