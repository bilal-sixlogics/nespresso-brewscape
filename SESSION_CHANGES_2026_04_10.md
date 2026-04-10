# Session Changes — 2026-04-10

All changes made during the April 10 session. Covers backend, storefront, and admin panel.

---

## 1. Database / Migrations

### `backend/database/migrations/2026_04_10_000001_add_category_brand_to_promotions_type_enum.php`
- Fixed MySQL-only `MODIFY COLUMN` syntax that crashed on SQLite
- Added `if (DB::getDriverName() === 'mysql')` guard

### `backend/database/migrations/2026_04_10_000003_create_product_reviews_table.php` *(NEW)*
- New table: `product_reviews`
- Columns: `id`, `product_id` (FK → products), `user_id` (nullable FK → users), `user_name`, `rating` (tinyint 1-5), `title` (nullable), `comment` (nullable), `verified` (boolean, default false), `timestamps`

---

## 2. Backend — Models

### `backend/app/Modules/Catalog/Models/ProductReview.php` *(NEW)*
- Fillable: `product_id, user_id, user_name, rating, title, comment, verified`
- Relationships: `belongsTo(Product)`, `belongsTo(User)` (nullable)

### `backend/app/Modules/Catalog/Models/Product.php`
- Added `reviews()` HasMany relationship → `ProductReview::latest()`

---

## 3. Backend — Resources

### `backend/app/Modules/Catalog/Resources/ProductResource.php`
- Added to JSON response:
  - `reviews` — collection when loaded
  - `reviews_count` — via `withCount`
  - `average_rating` — computed from loaded reviews, rounded to 1 decimal

### `backend/app/Modules/Catalog/Resources/ProductReviewResource.php` *(NEW)*
- Serializes review fields: id, product_id, user_id, user_name, rating, title, comment, verified, timestamps

### `backend/app/Modules/Catalog/Resources/ProductImageResource.php`
- Fixed URL doubling bug: if `$path` already starts with `http://` or `https://`, use it as-is; otherwise prefix with `asset('storage/')`

---

## 4. Backend — Controllers

### `backend/app/Modules/Catalog/Controllers/AdminProductController.php`
- Added `syncProductStock(Product $product)` private method — sums `ProductSalesUnit.stock` into `product.stock_qty`
- Called after every `store()`, `update()`, and `storeSalesUnit()`
- `storeSalesUnit()` now also creates `InventoryItem` alongside each sale unit
- `show()` now wraps response as `['data' => new ProductResource($product)]` for consistency
- Both `store()` and `update()` call `$product->fresh()->load([..., 'reviews'])`

### `backend/app/Modules/Catalog/Controllers/CatalogController.php`
- Added parameter aliasing: `min_price/max_price` → `price_min/price_max`, `sort_by=price_asc/price_desc/newest` → `sort + direction`, `category` slug → `category_slug`, `brand` slug → `brand_slug`
- Added `in_stock=true` filter support
- Added `tags` comma-separated filter
- Added `productReviews(slug)` method — paginated, returns `ProductReviewResource` collection
- `featured()` now includes `withCount('reviews')`
- `productBySlug()` wraps in `['data' => ...]`

### `backend/app/Modules/Catalog/Controllers/AdminReviewController.php` *(NEW)*
- `index(productId)` — list reviews for a product (paginated 20/page)
- `store(request, productId)` — admin creates review (validates user_name, rating, title, comment, verified, optional user_id)
- `destroy(productId, reviewId)` — delete a review

### `backend/app/Modules/Catalog/Controllers/ReviewController.php` *(NEW)*
- `store(request, slug)` — authenticated user submits review; auto-sets user_id, user_name from auth user, verified = true

---

## 5. Backend — Repositories

### `backend/app/Modules/Catalog/Repositories/Eloquent/EloquentProductRepository.php`
- `findBySlug()` now eager loads `reviews`
- `listActive()` now does `withCount('reviews')`
- Added `tags` filter (comma-separated, `whereIn('label', ...)`)
- Added `in_stock` filter (`whereRaw('stock_qty - reserved_stock > 0')`)

---

## 6. Backend — Routes

### `backend/routes/api_website.php`
- Added `GET /products/{slug}/reviews` → `CatalogController::productReviews` (public)
- Added `POST /products/{slug}/reviews` → `ReviewController::store` (auth:sanctum)

### `backend/routes/api_admin.php`
- Added `GET /products/{productId}/reviews` → `AdminReviewController::index`
- Added `POST /products/{productId}/reviews` → `AdminReviewController::store`
- Added `DELETE /products/{productId}/reviews/{reviewId}` → `AdminReviewController::destroy`

---

## 7. Backend — Config

### `backend/config/cors.php`
- Added `localhost:3001` and `localhost:3002` to allowed origins (multi-port dev)

---

## 8. Storefront — Types & Helpers

### `src/types/index.ts` *(complete rewrite)*
- New interfaces: `ReviewItem`, `SaleUnit`, `Brand`, `Category`, `ProductImage`, `ProductTag`, `ProductSection`, `Product`
- All fields match backend JSON exactly
- Helper functions exported:
  - `extractTasteProfile(sections)` → `TasteProfile | null`
  - `extractNotes(sections)` → `string[] | null`
  - `extractIntensity(sections)` → `{value, max} | null`
  - `extractFeatures(sections)` → `ProductFeature[]`
  - `extractSpecField(sections, label)` → `string | null`
  - `getProductImage(product)` → `string | null`
  - `getProductImages(product)` → `string[]`
  - `isInStock(product)` → `boolean` (uses `Number()` for string safety)
  - `isNewProduct(product)` → `boolean` (30-day window)
  - `getDefaultUnit(product)` → `SaleUnit | undefined`
  - `getDisplayPrice(product)` → `number` (uses `Number(raw) || 0`)
  - `getTagLabels(product)` → `string[]`
  - `hasTag(product, label)` → `boolean`

---

## 9. Storefront — API Layer

### `src/lib/api/types.ts`
- Updated `ProductQueryParams`: added `category_id`, `brand`, `brand_id`, `sort_by` with `price_asc/price_desc/newest`, `tags` (comma-separated), `tag`, `featured`, `storefront_page`

### `src/services/ProductService.ts` *(rewritten)*
- Removed all mock mode logic — always uses real API
- `getProducts(params)` → `GET /api/v1/products`
- `getProduct(slug)` → `GET /api/v1/products/{slug}`
- `getFeatured()` → `GET /api/v1/products/featured`

### `src/hooks/useProducts.ts` *(NEW)*
- `useProducts(params)` — paginated product list with `loadMore` / `hasMore`
- `useProduct(slug)` — single product by slug
- `useCategories()` — all categories
- `useBrands()` — all brands

---

## 10. Storefront — Components

### `src/components/ui/ProductCard.tsx` *(full redesign)*
- **Before:** basic card with ☕ emoji fallback, Tag icon badges, flat layout
- **After:** premium card with:
  - 4:3 image ratio with object-cover, smooth zoom on hover
  - Branded SVG placeholder (coffee steam illustration + brand name) when no image
  - Minimal badge system: discount pill, NEW pill, BEST seller pill
  - In-stock indicator at bottom-left of image
  - Animated "View Details" CTA overlay on hover (white pill)
  - Brand name above product name in small tracking uppercase
  - Tagline shown below name
  - Aromatic notes as green pill tags (up to 3)
  - Compact inline intensity bars with Zap icon (no full IntensityBar component)
  - Price row + green circular "Select →" button at card bottom
  - Border-top separator between content and price row
  - No mock IntensityBar import; uses `extractIntensity()` directly

### `src/components/ui/ProductDetailPanel.tsx`
- Uses new helper functions
- `unitPrice = Number(effectiveUnit.selling_price) || 0`
- `Number(unit.selling_price).toFixed(2)` for sale unit price display
- Uses `product.sales_units` (not `saleUnits`)

### `src/components/ui/FilterDrawer.tsx`
- Removed hardcoded `ALL_CATEGORIES`, `ALL_BRANDS`, `ALL_TAGS`
- Added props: `availableCategories?: string[]`, `availableBrands?: string[]`, `availableTags?: string[]`
- `applyFilters()` uses `p.brand?.name`, `p.category?.name`, `isInStock(p)`, `getDisplayPrice(p)`, `getTagLabels(p)`

### `src/components/layout/Header.tsx`
- Search uses `useProducts({ search: query, per_page: 8 })` for live results
- Uses `getProductImage()`, `getDisplayPrice()`, `getDefaultUnit()?.name`

---

## 11. Storefront — Pages

### `src/app/shop/page.tsx` *(complete rewrite)*
- Replaced static mock data with `useProducts(queryParams)` + `useCategories()` + `useBrands()` hooks
- Filter state maps to API params (brand/category name → slug lookup)
- Category pills use `category.slug` for API, `category.name` for display
- Server-side filtering, sorting, pagination — no client-side filtering

### `src/app/shop/[slug]/page.tsx`
- Removed `generateStaticParams` (was using mock slugs)
- Added `export const dynamic = 'force-dynamic'`

### `src/app/shop/[slug]/ProductDetailPageClient.tsx`
- Uses `useProduct(slug)` hook
- Related products use `useProducts({ category_id: product.category_id, per_page: 5 })`
- Loading spinner added
- Price safety: `Number(effectiveUnit.selling_price) || 0`

### `src/app/machines/page.tsx`, `accessories/page.tsx`, `sweets/page.tsx`
- All use `useProducts({ storefront_page: '/machines|/accessories|/sweets' })`
- Removed enrichedProducts imports

### `src/app/page.tsx` (home page)
- Featured section: `useProducts({ featured: true })`
- Machines teaser: `useProducts({ storefront_page: '/machines', per_page: 5 })`

---

## 12. Storefront — State

### `src/store/CartContext.tsx`
- `unitPrice = Number(saleUnit.selling_price) || 0`
- Removed `enrichedProducts` import
- `removeFromCart` / `updateQuantity` accept `string | number` for `saleUnitId`
- Subtotal: `items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)`

---

## 13. Environment

### `.env.local`
- `NEXT_PUBLIC_USE_MOCK=false` — all mock mode disabled

---

## 14. Key Bug Fixes

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Stock = 0 in admin | `AdminProductController` never summed sale unit stock into `product.stock_qty` | Added `syncProductStock()` called after create/update |
| Image URL doubled | `ProductImageResource` prefixed already-absolute URLs with `asset('storage/')` | Added `str_starts_with($path, 'http')` guard |
| CORS blocked | `cors.php` only allowed port 3000 | Added 3001, 3002 |
| Prices are strings | Laravel decimal cast returns JSON strings | Wrapped all price access with `Number()` |
| Product detail 404 | `generateStaticParams` used mock slugs | Switched to `force-dynamic` + `useProduct(slug)` hook |
| Filter names vs slugs | FilterDrawer sent display names ("Coffee Beans") to API that expects slugs | Shop page looks up slug from categories/brands arrays |
| SQLite crash on migration | `MODIFY COLUMN` is MySQL-only syntax | Added `DB::getDriverName() === 'mysql'` guard |

---

## 15. Known Remaining Items

- **Product images**: 12/15 seeded products have no images. Must upload via admin panel.
- **Admin live preview**: Should show reviews section on product detail page.
- **`storefront_page` on categories**: Accessories/Sweets categories need products assigned with matching `storefront_page` values.
