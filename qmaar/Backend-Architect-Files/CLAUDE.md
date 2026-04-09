# E-Commerce Backend — CLAUDE.md

## Project

Laravel 12 API-only backend for a coffee e-commerce platform. Modular monolith architecture. Two API surfaces: Website (`/api/v1/`) and Admin (`/api/admin/v1/`).

## Tech Stack

- **Framework:** Laravel 12.x (PHP 8.2+)
- **Database:** MySQL 8.x
- **Cache/Queue/Session:** Redis
- **Auth:** Laravel Sanctum (SPA cookies + API tokens)
- **Roles:** spatie/laravel-permission
- **Audit:** spatie/laravel-activitylog
- **Real-time:** Laravel Reverb (WebSocket)
- **Payments:** Stripe (stripe/stripe-php)
- **Queue Dashboard:** Laravel Horizon
- **Error Tracking:** Sentry
- **Code Style:** Laravel Pint (PSR-12)
- **Testing:** PHPUnit + Laravel Feature Tests

## Architecture Rules

### Modular Monolith
All business logic lives in `app/Modules/`. 11 domain modules:
- Catalog, Inventory, Cart, Orders, Payments, Promotions, Shipping, Users, Notifications, AdminManagement, Reporting

### Patterns — ALWAYS follow these
- **Repository Pattern:** Controllers/Actions use interfaces, never Eloquent directly. Bind in `RepositoryServiceProvider`.
- **Actions (Use Cases):** Single-responsibility classes. One public `execute()` method. Wrap mutations in DB transactions.
- **DTOs:** PHP 8.2 readonly classes for data transfer between layers. Never pass raw arrays.
- **Form Requests:** ALL validation in FormRequest classes. Never validate in controllers.
- **API Resources:** Transform models to JSON via Resource classes. Never return raw models.
- **Policies:** Per-model authorization. Check permissions before every mutation.
- **Events + Listeners:** Decouple side effects. Payment → email + inventory + reporting via queued listeners.
- **Services:** Complex cross-module logic (PromotionEvaluationService, InventoryService).

### Request Lifecycle
```
Route → Middleware → FormRequest (validate) → Controller → Action/Service → Repository → Model → Event → API Resource → JSON
```

### Module Directory Structure
```
Modules/{ModuleName}/
├── Models/
├── Repositories/        (Interface + Implementation)
├── Actions/             (CreateXAction, UpdateXAction)
├── DTOs/                (readonly data classes)
├── Http/
│   ├── Controllers/     (Admin/ + Website/)
│   ├── Requests/        (StoreXRequest, UpdateXRequest, ListXRequest)
│   └── Resources/       (XResource, XCollection)
├── Policies/
├── Events/
├── Listeners/
└── Services/            (if needed)
```

## Code Quality Rules

### CRITICAL — Never do these
- **Never trust frontend prices.** Recalculate all totals server-side in Actions.
- **Never use float for money.** Always `DECIMAL(10,2)`.
- **Never hard delete critical records.** Use SoftDeletes on products, categories, brands, orders.
- **Never use raw SQL.** Eloquent only — prevents SQL injection.
- **Never use `$guarded = []`.** Always explicit `$fillable` on models.
- **Never skip webhook signature verification.** Verify Stripe signatures.
- **Never store tokens in frontend-accessible storage.** Use HTTP-only cookies for Sanctum SPA.

### ALWAYS do these
- **Wrap mutations in DB transactions** (`DB::transaction(fn() => ...)`).
- **Use `lockForUpdate()`** for inventory operations (prevents race conditions).
- **Log all admin CUD actions** via audit trait / spatie/activitylog.
- **Emit events** after significant operations (OrderCreated, PaymentSucceeded).
- **Cache public data** with Redis tags (products, categories, brands, shipping).
- **Invalidate cache** on CUD operations via event listeners.
- **Return consistent API format:** `{ "data": {...}, "meta": {...} }` for success, `{ "message": "...", "errors": {...} }` for errors.
- **Use Form Requests** for every endpoint that accepts input.
- **Use API Resources** for every response.
- **Write a model factory** for every model.

### Naming Conventions
- Models: singular (`Product`, `OrderItem`)
- Tables: plural snake_case (`products`, `order_items`)
- Controllers: `{Model}Controller` (`ProductController`)
- Actions: `{Verb}{Model}Action` (`CreateProductAction`)
- DTOs: `{Model}Data` (`ProductData`)
- Requests: `{Store|Update|List}{Model}Request`
- Resources: `{Model}Resource`, `{Model}Collection`
- Events: `{Model}{PastVerb}` (`OrderCreated`, `PaymentSucceeded`)
- Repositories: `{Model}RepositoryInterface`, `Eloquent{Model}Repository`

## Database Rules

- All PKs: `BIGINT UNSIGNED AUTO_INCREMENT`
- All FKs: indexed, with appropriate ON DELETE (CASCADE for children, RESTRICT for references)
- All monetary columns: `DECIMAL(10,2)` — never FLOAT
- All dates: `TIMESTAMP` (not DATETIME)
- Soft deletes on: products, categories, brands, sale_units, orders, discount_rules
- Order items are IMMUTABLE — snapshot product name, unit label, price at order time
- Stock is ONE number per product (base units). Sale units define packaging multipliers.
- `reserved_stock` prevents race conditions during checkout (held 15 min, released on failure/timeout).

## API Design

### Website API (`/api/v1/`)
- Public: product listing, product detail, categories, brands, tags, shipping methods
- Auth: cart CRUD, checkout, orders, profile, addresses, wishlist, coupon validation
- Rate limits: `throttle:api` (60/min), `throttle:auth` (10/min), `throttle:checkout` (5/min)

### Admin API (`/api/admin/v1/`)
- Full CRUD: products, sale units, categories, brands, tags, unit types, section templates, section configs
- Management: orders (status transitions, cancel, refund), inventory (add stock, adjustments), discounts, shipping, admin users, roles
- Read-only: activity logs, dashboard stats
- Rate limit: `throttle:admin` (120/min)
- Middleware: `auth:sanctum`, `ability:admin-access`

### Pagination
- Offset pagination for admin (page numbers)
- Cursor pagination for append-only tables (stock_movements, activity_logs)
- Default: 20 per page, max 100

### Filtering
- Query params: `?category_id=1&brand_id=2&min_price=10&max_price=50&status=active&search=lavazza`
- All filtering done in repository methods, not controllers
- Use Eloquent scopes for reusable filters

## Discount Engine

- Discounts are NEVER on the product. Always calculated at runtime.
- Product has `cost_price` (what you paid) and `selling_price` (retail). No `original_price` or `discount_percent`.
- Sale units have their own `selling_price` (volume pricing). Admin can set via direct price, % off, or € off.
- Promotion rules: scope (sitewide/category/brand/product), type (percentage/fixed), scheduling, coupons, stacking, per-user limits.
- Evaluation: sort by priority (highest first), apply, stop if non-stackable.
- Layer 1 (sale unit price) + Layer 2 (promo discount) stack — promo applies to sale unit's `selling_price`.

## Inventory

- Single stock pool per product in base units (packs, pieces, kg).
- Sale units define packaging (1 Pack, Box of 10, Carton of 50) with quantity multiplier.
- Admin adds stock via any sale unit → system converts to base units.
- Customer buys → deduct `orderQty × saleUnit.quantity` base units.
- Every stock change logged in `stock_movements` (append-only audit trail).
- Availability per unit: `Math.floor((stock_qty - reserved_stock) / saleUnit.quantity)`.

## Dynamic Sections (Product Body)

- 9 section types (developer-fixed): intensity, taste_profile, aromatic_notes, feature_list, specs_table, ingredients, allergens, pairing, rich_text.
- No "custom" section type.
- Section types are fixed — only devs add new ones (purpose-built UI).
- Section parameters are admin-configurable (global `section_configs` table).
- Section values are per-product (stored as JSON on product).
- Section templates provide defaults — admin picks template, gets pre-filled sections, customizes.

## Events & Jobs

### Key Events
- `OrderCreated` → SendOrderConfirmation, UpdateReporting
- `PaymentSucceeded` → ReduceStock, MarkOrderPaid, SendInvoice
- `PaymentFailed` → ReleaseStock, NotifyUser
- `PaymentRefunded` → RestoreStock, SendRefundEmail
- `OrderShipped` → SendShippingNotification
- `ProductCreated/Updated` → FlushProductCache

### Queued Jobs
- `SendOrderConfirmationEmail` (default queue)
- `GenerateInvoicePdfJob` (default queue)
- `ProcessPaymentRefundJob` (payments queue)
- `CleanExpiredCartsJob` (scheduled)
- `ReleaseExpiredReservationsJob` (scheduled)

## Caching

- Redis with tagged caches.
- Products listing: 30 min TTL, flush on product CUD.
- Categories tree: 60 min TTL.
- Brands listing: 60 min TTL.
- Active promotions: 10 min TTL.
- Never cache user-specific data (cart, orders).

## Testing

- Feature tests: full HTTP request → response cycle.
- Unit tests: Actions and Services in isolation.
- Use `RefreshDatabase` trait.
- Model factory for every model.
- Minimum 80% coverage on business logic.
- Tests run on every PR — block merge on failure.

## Reference Documents

- `architecture.md` — Full system architecture (30 sections)
- `documentation.md` — Developer documentation
- `Tasks.md` — Phase-by-phase task breakdown (13 phases, ~88% complete)
- `../SYSTEM_ARCHITECTURE_REFERENCE.html` — Visual interactive reference (32 sections, all tables, ERD, indexes)

## Current Status

Phases 1–12 complete (~88%). Phase 13 (observability/production) partially done. Pending:
- Sentry integration
- Structured JSON logging
- Final test run (all green)
- Staging deployment
- Feature tests for promotion scenarios and webhook flows
