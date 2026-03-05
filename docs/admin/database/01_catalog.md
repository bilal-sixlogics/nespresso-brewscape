# Catalog Database Schema & Dynamic Attributes

To handle the highly variable nature of the products on Cafrezzo (e.g., Coffee Beans have `intensity` and `aroma`, while Coffee Machines have `water_capacity` and `power`, and Accessories have `material`), the schema uses a hybrid relational and JSON approach.

## 1. Categories Table (`categories`)
Handles the hierarchy of the store (e.g., Coffee > Nespresso Capsules).
- `id` (PK, BigInt)
- `parent_id` (FK to categories, nullable) for sub-categories
- `name_en` (String)
- `name_fr` (String)
- `slug` (String, Unique)
- `icon` (String, nullable)
- `is_active` (Boolean)
- `timestamps`

## 2. Products Table (`products`)
Stores the core, universal attributes shared by every single product, regardless of its type.
- `id` (PK, BigInt)
- `category_id` (FK, BigInt)
- `type` (Enum: `bean`, `machine`, `accessory`, `sweet`) - Helps the admin panel render the correct dynamic fields.
- `sku` (String, Unique)
- `slug` (String, Unique)
- `name_en` (String)
- `name_fr` (String)
- `tagline_en` (String, nullable)
- `tagline_fr` (String, nullable)
- `description_en` (LongText, Markdown)
- `description_fr` (LongText, Markdown)
- `base_price` (Decimal 10,2)
- `images` (JSON) - Array of image URLs
- `is_published` (Boolean, default false)
- `is_featured` (Boolean, default false)

## 3. Dynamic Attributes (`products.dynamic_data` JSON Column)
Instead of creating dozens of empty columns for `aroma`, `water_capacity`, etc., the `products` table has a `dynamic_data` JSON column. The Admin Panel renders inputs based on the product `type`.

**Example for `type: bean`:**
```json
{
  "intensity": 8,
  "cup_size": ["Espresso", "Lungo"],
  "aroma_profile": ["Fruity", "Winey"],
  "bitterness": 3,
  "acidity": 4,
  "body": 2,
  "roast_level": "Medium"
}
```

**Example for `type: machine`:**
```json
{
  "water_capacity_liters": 1.2,
  "warmup_time_sec": 25,
  "power_watts": 1260,
  "weight_kg": 3.0,
  "dimensions": "11.1 x 23.5 x 32.6 cm"
}
```

## 4. Product Variants / Sale Units (`product_variants`)
Handles different purchasing options (e.g., buying 1 sleeve vs. 5 sleeves).
- `id` (PK, BigInt)
- `product_id` (FK, BigInt)
- `sku_variant` (String, Unique)
- `title_en` (String) - e.g., "Pack of 50 capsules"
- `title_fr` (String) - e.g., "Pack de 50 capsules"
- `pack_size` (Int) - e.g., 50
- `price` (Decimal 10,2) - Variant specific price. If null, use product `base_price`.
- `stock_quantity` (Int)
- `is_in_stock` (Boolean)

## 5. Product Reviews (`reviews`)
- `id` (PK, BigInt)
- `product_id` (FK, BigInt)
- `user_id` (FK, BigInt)
- `rating` (Int 1-5)
- `title` (String)
- `comment` (Text)
- `is_verified_purchase` (Boolean, default false)
- `status` (Enum: `pending`, `approved`, `rejected`) - Controlled by Admin
- `timestamps`

## 6. Brands (`brands`)
For partnerships or specific accessory manufacturers.
- `id` (PK)
- `name` (String)
- `logo_url` (String)
- `description` (Text)
