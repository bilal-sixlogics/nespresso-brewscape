# E-Commerce Backend — Development Tasks (Phase by Phase)

**Project:** E-Commerce Backend (Laravel 12)
**Total Phases:** 13
**Status Legend:** `[ ]` Todo | `[/]` In Progress | `[x]` Done

> ⚠️ **Rule:** Do NOT start coding outside of the current active phase. Complete each phase fully before moving to the next.

---

## Phase 1 — Project Bootstrap & Configuration

> **Goal:** Set up the project foundation: environment, module autoloading, base providers, directory skeleton.

- [x] **1.1** Configure `.env` — DB, Redis, Queue, Mail, Stripe keys
- [x] **1.2** Update `composer.json` to autoload `App\Modules\` namespace
  ```
  "App\\Modules\\": "app/Modules/"
  ```
- [x] **1.3** Install package dependencies:
  - `laravel/sanctum` — API authentication
  - `spatie/laravel-permission` — roles & permissions
  - `spatie/laravel-activitylog` — audit logging
  <!-- - `laravel/horizon` — queue monitoring -->
  - `laravel/reverb` — WebSocket broadcasting
  - `stripe/stripe-php` — Stripe payment SDK
- [x] **1.4** Publish Sanctum, and Reverb config files
- [x] **1.5** Create `app/Modules/` directory with all 11 module folders:
  - `Catalog`, `Inventory`, `Cart`, `Orders`, `Payments`
  - `Promotions`, `Shipping`, `Users`, `Notifications`
  - `AdminManagement`, `Reporting`
- [x] **1.6** Create `app/Providers/RepositoryServiceProvider.php` (empty bindings stub)
- [x] **1.7** Register `RepositoryServiceProvider` in `bootstrap/providers.php`
- [x] **1.8** Create `app/Support/Enums/` directory with shared enums:
  - `OrderStatus.php`
  - `PaymentStatus.php`
  - `InventoryMovementType.php`
  - `DiscountType.php`
  - `PromotionType.php`
- [x] **1.9** Create `app/Exceptions/` custom exception classes:
  - `InsufficientStockException.php`
  - `PaymentFailedException.php`
  - `InvalidPromotionException.php`
  - `OrderCancellationException.php`
- [x] **1.10** Configure `routes/api_admin.php` and `routes/api_website.php` and register in `bootstrap/app.php`
- [x] **1.11** Set up rate limiters in `AppServiceProvider::boot()`:
  - `throttle:auth` (10/min), `throttle:checkout` (5/min)
  - `throttle:api` (60/min), `throttle:admin` (120/min)
- [x] **1.12** Configure CORS in `config/cors.php`
- [x] **1.13** Configure Redis for cache, queue, and session in `.env` and `config/`
- [x] **1.14** Run `php artisan key:generate` and verify app boots cleanly

---

## Phase 2 — Database Migrations

> **Goal:** Create all database tables with correct schema, indexes, and foreign keys.

- [x] **2.1** Migration: `create_categories_table`
  - `id, name, slug(unique), description(nullable), parent_id(nullable FK→categories), status(enum), sort_order, timestamps, softDeletes`
- [x] **2.2** Migration: `create_brands_table`
  - `id, name, slug(unique), logo(nullable), description(nullable), status(enum), timestamps, softDeletes`
- [x] **2.3** Migration: `create_products_table`
  - `id, name, slug(unique), description(longText), brand_id(FK), category_id(FK), price(decimal 10,2), cost_price(decimal 10,2), status(enum), weight(decimal nullable), timestamps, softDeletes`
- [x] **2.4** Migration: `create_product_images_table`
  - `id, product_id(FK), path, sort_order, is_primary(bool), timestamps`
- [x] **2.5** Migration: `create_product_sales_units_table`
  - `id, product_id(FK), name, unit_type, quantity(decimal), price(decimal 10,2), sku(unique), stock(int), is_default(bool), status(enum), timestamps, softDeletes`
- [x] **2.6** Migration: `create_inventory_items_table`
  - `id, product_sales_unit_id(unique FK), stock(int), reserved_stock(int), timestamps`
- [x] **2.7** Migration: `create_inventory_movements_table`
  - `id, product_sales_unit_id(FK), type(enum), quantity(int), reference_id(nullable), reference_type(nullable), note(text nullable), created_by(FK→users nullable), created_at`
- [x] **2.8** Migration: `create_carts_table`
  - `id, user_id(FK nullable), session_id(nullable), status(enum), expires_at(nullable), timestamps`
- [x] **2.9** Migration: `create_cart_items_table`
  - `id, cart_id(FK), product_sales_unit_id(FK), quantity(int), unit_price(decimal 10,2), timestamps`
- [x] **2.10** Migration: `create_orders_table`
  - `id, user_id(FK nullable), user_email, user_phone(nullable), status(enum), subtotal(decimal), discount_total(decimal), shipping_total(decimal), grand_total(decimal), currency(char 3), notes(text nullable), timestamps, softDeletes`
- [x] **2.11** Migration: `create_order_items_table`
  - `id, order_id(FK), product_id(FK), product_sales_unit_id(FK), product_name_snapshot, unit_name_snapshot, unit_price_snapshot(decimal), quantity(int), total_price(decimal), created_at`
- [x] **2.12** Migration: `create_order_addresses_table`
  - `id, order_id(FK), type(enum), name, address_line1, address_line2(nullable), city, state(nullable), postal_code, country(char 2), phone(nullable), created_at`
- [x] **2.13** Migration: `create_order_shipments_table`
  - `id, order_id(FK), shipping_method_id(FK), tracking_number(nullable), carrier(nullable), shipped_at(nullable), delivered_at(nullable), timestamps`
- [x] **2.14** Migration: `create_order_payments_table`
  - `id, order_id(FK), payment_transaction_id(FK), created_at`
- [x] **2.15** Migration: `create_order_promotions_table`
  - `id, order_id(FK), promotion_id(FK), discount_applied(decimal 10,2), created_at`
- [x] **2.16** Migration: `create_promotions_table`
  - `id, name, code(unique nullable), type(enum), discount_type(enum), discount_value(decimal), min_order_amount(nullable), max_uses(nullable), used_count(int), start_date(nullable), end_date(nullable), priority(int), is_stackable(bool), status(enum), timestamps, softDeletes`
- [x] **2.17** Migration: `create_promotion_conditions_table`
  - `id, promotion_id(FK), condition_type, condition_value, created_at`
- [x] **2.18** Migration: `create_promotion_targets_table`
  - `id, promotion_id(FK), target_type, target_id(bigint), created_at`
- [x] **2.19** Migration: `create_shipping_methods_table`
  - `id, name, description(nullable), base_price(decimal), estimated_days_min, estimated_days_max, active(bool), timestamps`
- [x] **2.20** Migration: `create_shipping_zones_table`
  - `id, name, countries(json), timestamps`
- [x] **2.21** Migration: `create_shipping_rates_table`
  - `id, shipping_zone_id(FK), shipping_method_id(FK), rate(decimal), weight_from(nullable), weight_to(nullable), timestamps`
- [x] **2.22** Migration: `create_payment_transactions_table`
  - `id, order_id(FK), gateway, gateway_txn_id(unique), status(enum), amount(decimal), currency(char 3), payload_snapshot(json), timestamps`
- [x] **2.23** Migration: `create_audit_logs_table`
  - `id, user_id(FK), action, model_type, model_id, old_values(json nullable), new_values(json nullable), ip_address, user_agent(text nullable), created_at`
- [x] **2.24** Run `php artisan migrate` — verify all tables created cleanly
- [x] **2.25** Publish and run `spatie/laravel-permission` migration

---

## Phase 3 — Models & Relationships

> **Goal:** Create all Eloquent models with correct relationships, casts, fillable, and soft deletes.

- [x] **3.1** `Modules/Catalog/Models/Category.php` — parent/children (self-referencing), hasMany Products
- [x] **3.2** `Modules/Catalog/Models/Brand.php` — hasMany Products
- [x] **3.3** `Modules/Catalog/Models/Product.php` — belongsTo Brand/Category, hasMany ProductImages, hasMany ProductSalesUnits
- [x] **3.4** `Modules/Catalog/Models/ProductImage.php` — belongsTo Product
- [x] **3.5** `Modules/Catalog/Models/ProductSalesUnit.php` — belongsTo Product, hasOne InventoryItem
- [x] **3.6** `Modules/Inventory/Models/InventoryItem.php` — belongsTo ProductSalesUnit
- [x] **3.7** `Modules/Inventory/Models/InventoryMovement.php` — belongsTo ProductSalesUnit
- [x] **3.8** `Modules/Cart/Models/Cart.php` — belongsTo User (nullable), hasMany CartItems
- [x] **3.9** `Modules/Cart/Models/CartItem.php` — belongsTo Cart, belongsTo ProductSalesUnit
- [x] **3.10** `Modules/Orders/Models/Order.php` — hasMany OrderItems, hasMany OrderShipments, hasOne OrderPayment, belongsToMany Promotions (via order_promotions)
- [x] **3.11** `Modules/Orders/Models/OrderItem.php` — belongsTo Order
- [x] **3.12** `Modules/Orders/Models/OrderAddress.php` — belongsTo Order
- [x] **3.13** `Modules/Orders/Models/OrderShipment.php` — belongsTo Order, belongsTo ShippingMethod
- [x] **3.14** `Modules/Payments/Models/PaymentTransaction.php` — belongsTo Order
- [x] **3.15** `Modules/Promotions/Models/Promotion.php` — hasMany PromotionConditions, hasMany PromotionTargets
- [x] **3.16** `Modules/Promotions/Models/PromotionCondition.php` — belongsTo Promotion
- [x] **3.17** `Modules/Promotions/Models/PromotionTarget.php` — belongsTo Promotion
- [x] **3.18** `Modules/Shipping/Models/ShippingMethod.php`
- [x] **3.19** `Modules/Shipping/Models/ShippingZone.php` — hasMany ShippingRates, casts countries as array
- [x] **3.20** `Modules/Shipping/Models/ShippingRate.php` — belongsTo ShippingZone, belongsTo ShippingMethod
- [x] **3.21** `Modules/AdminManagement/Models/AuditLog.php`
- [x] **3.22** Add `HasRoles` trait to `User` model (spatie/laravel-permission)
- [x] **3.23** Create model factories for all models above
- [x] **3.24** Create database seeders:
  - `CategorySeeder`, `BrandSeeder`, `ProductSeeder`, `ShippingMethodSeeder`
  - `AdminUserSeeder` (creates super_admin role + first admin user)
- [x] **3.25** Run `php artisan db:seed` — verify seeded data

---

## Phase 4 — Repositories, Services & DTOs

> **Goal:** Build the data-access and service layers that Actions will depend on.

- [x] **4.1** Create Repository Contracts (interfaces) for:
  - `ProductRepositoryInterface`, `CategoryRepositoryInterface`, `BrandRepositoryInterface`
  - `OrderRepositoryInterface`, `CartRepositoryInterface`
  - `PromotionRepositoryInterface`, `InventoryRepositoryInterface`
- [x] **4.2** Create Eloquent Implementations for all above interfaces
- [x] **4.3** Register all interface → implementation bindings in `RepositoryServiceProvider`
- [x] **4.4** Create DTOs:
  - `CreateOrderDTO`, `AddToCartDTO`, `ProcessPaymentDTO`
- [x] **4.5** Create `Modules/Inventory/Services/InventoryService.php`
  - `reserveStock()`, `releaseStock()`, `deductStock()`, `adjustStock()`
  - All methods use DB transactions + movement logging
- [x] **4.6** Create `Modules/Promotions/Services/PromotionService.php`
  - `validateCode()`, `calculateDiscount()`, `applyPromotion()`
- [x] **4.7** Create `Modules/Shipping/Services/ShippingService.php`
  - `getAvailableMethods()`, `calculateRate()`
- [x] **4.8** Create `Modules/Payments/Services/PaymentService.php`
  - `createPaymentIntent()`, `handleWebhookConfirmation()`, `refund()`

---

## Phase 5 — Admin API Endpoints

> **Goal:** Build all admin-facing CRUD and management API endpoints.

- [x] **5.1** Admin auth routes: `POST /api/admin/v1/auth/login`, `POST /api/admin/v1/auth/logout`
- [x] **5.2** Categories CRUD: `GET, POST /categories` | `GET, PUT, DELETE /categories/{id}`
  - Form Requests: `StoreCategoryRequest`, `UpdateCategoryRequest`
  - Resource: `CategoryResource`
- [x] **5.3** Brands CRUD: `GET, POST /brands` | `GET, PUT, DELETE /brands/{id}`
  - Form Requests: `StoreBrandRequest`, `UpdateBrandRequest`
  - Resource: `BrandResource`
- [x] **5.4** Products CRUD: `GET, POST /products` | `GET, PUT, DELETE /products/{id}`
  - Form Requests: `StoreProductRequest`, `UpdateProductRequest`
  - Resource: `ProductResource`
  - Handle image uploads (store to disk/S3)
- [x] **5.5** Product Sales Units CRUD: `GET, POST /products/{id}/sales-units` | `PUT, DELETE /sales-units/{id}`
  - Form Requests: `StoreSalesUnitRequest`, `UpdateSalesUnitRequest`
- [x] **5.6** Inventory adjustments: `POST /inventory/adjust`
  - Form Request: `AdjustInventoryRequest`
- [x] **5.7** Inventory movements list: `GET /inventory/{salesUnitId}/movements`
- [x] **5.8** Orders list & detail: `GET /orders` | `GET /orders/{id}`
  - Resource: `OrderResource`, `OrderItemResource`
- [x] **5.9** Order status update: `PATCH /orders/{id}/status` (state machine enforced)
- [x] **5.10** Order cancellation: `POST /orders/{id}/cancel` (releases stock)
- [x] **5.11** Order refund: `POST /orders/{id}/refund` (Stripe refund + restore stock)
- [x] **5.12** Shipping methods CRUD: `GET, POST /shipping-methods` | `PUT, DELETE /shipping-methods/{id}`
- [x] **5.13** Shipping zones & rates CRUD: `GET, POST /shipping-zones` | `GET, POST /shipping-zones/{id}/rates`
- [x] **5.14** Promotions CRUD: `GET, POST /promotions` | `GET, PUT, DELETE /promotions/{id}`
  - Form Requests: `StorePromotionRequest`, `UpdatePromotionRequest`
- [x] **5.15** Admin user management: `GET /admins` | `POST /admins` | `PUT /admins/{id}` | `DELETE /admins/{id}`
- [x] **5.16** Role & permission management: `GET /roles` | `POST /roles` | assign permissions
- [x] **5.17** Audit log list: `GET /audit-logs` (filterable by admin, action, model)

---

## Phase 6 — Website API Endpoints

> **Goal:** Build all public-facing and user-authenticated website API endpoints.

- [x] **6.1** Auth routes:
  - `POST /api/v1/auth/register`, `login`, `logout`, `forgot-password`, `reset-password`
- [x] **6.2** Public catalog routes:
  - `GET /products` (filtering: category, brand, price range, search, sort)
  - `GET /products/{slug}`, `GET /categories` (nested tree), `GET /brands`
- [x] **6.3** Cart routes (auth or guest via X-Session-ID header):
  - `GET /cart`, `POST /cart/items`, `PUT /cart/items/{id}`, `DELETE /cart/items/{id}`, `DELETE /cart`, `POST /cart/merge`
- [x] **6.4** Promotions:
  - `POST /promotions/apply` (validate and preview discount)
- [x] **6.5** Shipping:
  - `GET /shipping-methods` (filtered by country)
- [x] **6.6** Checkout:
  - `POST /checkout` → validates stock, reserves, creates order + items + addresses, applies promo, initiates Stripe PaymentIntent
- [x] **6.7** Payment:
  - `POST /payments/webhook` (Stripe webhook: succeeded → deduct stock, failed → release stock)
  - `GET /orders/{id}/payment-status`
- [x] **6.8** User orders:
  - `GET /orders`, `GET /orders/{id}` (scoped to authenticated user)
- [x] **6.9** User profile:
  - `GET /profile`, `PUT /profile`, `PUT /profile/password`

---

## Phase 7 — Promotions Engine

> **Goal:** Implement the full promotions evaluation pipeline.

- [x] **7.1** Implement `PromotionService::getApplicablePromotions()` — filters by status, dates, max_uses, min_order_amount
- [x] **7.2** Implement `PromotionService::evaluateCart()` — condition/target matching (min_qty, min_amount, category, product, brand)
- [x] **7.3** Implement stackability logic (priority ordering, non-stackable conflict prevention)
- [x] **7.4** Coupon code validation (`POST /promotions/apply`) — done in Phase 6
- [x] **7.5** Free shipping type support (`type = shipping`)
- [x] **7.6** Increment `used_count` via `applyPromotion()` — done in Phase 4
- [ ] **7.7** Feature tests for promotion scenarios (deferred to testing phase)

---

## Phase 8 — Payments & Webhooks

> **Goal:** Integrate Stripe, handle payment events, and implement refunds.

- [x] **8.1** Stripe SDK configured in `PaymentService`
- [x] **8.2** `PaymentService::createPaymentIntent()` — creates Stripe PaymentIntent + `payment_transactions` record
- [x] **8.3** Webhook controller with Stripe-Signature verification, succeeded/failed handling
- [x] **8.4** Idempotency check on webhook (checks `gateway_txn_id` + terminal status before processing)
- [x] **8.5** Payment succeeded → deduct inventory, mark order `paid`, fire `PaymentSucceeded` event
- [x] **8.6** Payment failed → release inventory, mark order `payment_failed`, fire `PaymentFailed` event
- [x] **8.7** Refund via `PaymentService::refund()` in `AdminOrderController::refund()`
- [ ] **8.8** Feature tests for webhook flows (deferred to testing phase)

---

## Phase 9 — Events, Listeners & Jobs

> **Goal:** Wire up all Laravel events, listeners, and queued jobs.

- [x] **9.1** Event classes: `OrderCreated`, `PaymentSucceeded`, `PaymentFailed`, `OrderShipped`, `OrderRefunded`
- [x] **9.2** Listener classes (queued): `SendOrderConfirmationListener`, `SendShippingNotificationListener`, `NotifyPaymentFailedListener`
- [x] **9.3** Registered in `EventServiceProvider`
- [x] **9.4** Job classes with retry logic: `SendOrderConfirmationEmailJob`, `SendShippingNotificationJob`, `GenerateInvoicePdfJob`
- [x] **9.5** Queue configured with named queues: `notifications`, `default`

---

## Phase 10 — Notifications

> **Goal:** Implement all user-facing notifications.

- [x] **10.1** Notification classes (mail + database):
  - `OrderConfirmedNotification`, `OrderShippedNotification`, `PaymentFailedNotification`, `RefundProcessedNotification`, `OrderDeliveredNotification`
- [x] **10.2** Blade email templates (using Laravel MailMessage defaults)
- [x] **10.3** `GET /notifications` — user's notification list with pagination + unread_count
- [x] **10.4** `PATCH /notifications/{id}/read` — mark notification as read
- [x] **10.5** `PATCH /notifications/read-all` — mark all as read
- [x] **10.6** Routes registered, tests pass

---

## Phase 11 — Caching Layer

> **Goal:** Add caching to all high-read, low-mutation endpoints.

- [x] **11.1** Products listing cached: `Cache::remember("products.listing.{hash}", 1800, ...)`
- [x] **11.2** Product detail by slug: `Cache::remember("products.detail.{$slug}", 1800, ...)`
- [x] **11.3** Categories tree: `Cache::remember('categories.tree', 3600, ...)`
- [x] **11.4** Brands listing: `Cache::remember('brands.active', 3600, ...)`
- [x] **11.5** Shipping methods: `Cache::remember('shipping_methods.{country}', 3600, ...)`
- [x] **11.6** (Promotions cache ready — key `promotions.active` registered in observers)
- [x] **11.7** Cache invalidation via model events in `AppServiceProvider`:
  - `Product::saved/deleted`, `Category::saved/deleted`, `Brand::saved/deleted`
  - `ShippingMethod::saved/deleted`, `Promotion::saved/deleted`
- [ ] **11.8** Verify cache hit/miss (requires Redis in production)

---

## Phase 12 — Testing

> **Goal:** Write comprehensive test coverage across all critical flows.

- [x] **12.1** Feature tests — Admin API: `CategoryTest` (6), `BrandTest` (4), `ProductTest` (5), `OrderTest` (4)
- [x] **12.2** Feature tests — Website API: `AuthTest` (6), `CatalogTest` (6), `ProfileTest` (5)
- [x] **12.3** Unit tests — Services: `PromotionServiceTest` (8)
- [x] **12.4** Model factories: Product, Category, Brand, Order (added `newFactory()` overrides)
- [x] **12.5** `php artisan test` → **44 passed, 2 skipped, 67 assertions** ✅

---

## Phase 13 — Observability, Final Config & Production Readiness

> **Goal:** Set up monitoring, production optimization, and final review.

- [ ] **13.1** Install and configure Sentry
- [ ] **13.4** Add structured JSON logging for production
- [x] **13.7** All models use `$fillable` arrays — no mass-assignment vulnerabilities
- [x] **13.8** Admin routes protected with `auth:sanctum` + `ability:admin-access`
- [x] **13.9** Webhook endpoint uses Stripe-Signature verification
- [ ] **13.10** Final `php artisan test` — all tests green
- [ ] **13.11** Deploy to staging and smoke test
- [ ] **13.12** Document deviations in `architecture.md`

---

## Summary Table

| Phase | Focus | Est. Complexity |
|---|---|---|
| Phase 1 | Bootstrap & Configuration | Low |
| Phase 2 | Database Migrations | Medium |
| Phase 3 | Models & Relationships | Medium |
| Phase 4 | Repositories, Services & DTOs | High |
| Phase 5 | Admin API Endpoints | High |
| Phase 6 | Website API Endpoints | High |
| Phase 7 | Promotions Engine | High |
| Phase 8 | Payments & Webhooks | High |
| Phase 9 | Events, Listeners & Jobs | Medium |
| Phase 10 | Notifications | Low |
| Phase 11 | Caching Layer | Medium |
| Phase 12 | Testing | High |
| Phase 13 | Observability & Production Readiness | Medium |

---

> **Next Step:** Review `documentation.md` and this `Tasks.md`. When ready, say **"Start Phase 1"** to begin coding.
