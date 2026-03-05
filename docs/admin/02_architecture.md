# Laravel Admin Panel: Full Architectural Documentation

This document provides a comprehensive technical blueprint for the **Cafrezzo Admin Panel** built with Laravel. It covers the full feature set, the granular control over the Next.js frontend, and the complete database schema required to power the premium e-commerce experience.

---

## 1. Core Feature Set

The admin panel is designed for total operational control, utilizing a **Service-Repository** pattern for maximum maintainability.

### A. Catalog Management
- **Rich Product Editor**: Multi-language support (FR/EN), intensity sliders (1-13), Markdown description editor, and Image Gallery management.
- **Dynamic Categories**: Nested category support (Beans, Machines, Sweets) with custom icons and SEO slug control.
- **Inventory Control**: Toggle stock status, manage "Sale Units" (e.g., individual vs. bulk pricing logic per product).

### B. Order & Fulfillment Flow
- **Order Dashboard**: Kanban or list view of orders categorized by status (Pending, Processing, Shipped, Delivered, Cancelled).
- **Shipment Management**: Integrated tracking number assignment, carrier selection, and automated status transition logic.
- **Guest Order Management**: Capability to track and search for guest orders alongside registered user history.
- **Relational Integrity**: Support for users having **multiple orders**, each containing **multiple items** (products and machines).

### C. Frontend Content Control (CMS)
- **Promo Strip Management**: Toggle the top banner, update promotional text, and set expiration dates/thresholds (e.g., "Free Shipping over $3000").
- **Asset Manager**: Centralized control for Hero images, background textures (like the coffee ripple), and testimonials.
- **Dynamic Content**: Manage "About Us", "Contact", "FAQ", and "Privacy Policy" without code changes.

### D. User & Community
- **User Profiles**: View order history, favorite products, and account status.
- **Review Moderation**: Approve/Reject customer reviews, toggle "Verified Purchase" badges, and respond to feedback.

---

## 2. Frontend Control API (Next.js Integration)

The admin panel serves as the "source of truth" for the React frontend via a RESTful API.

| Frontend Component | Admin Control Point | Data Passed to Next.js |
| :--- | :--- | :--- |
| **PromoStrip** | Global Settings > Promo | `message`, `isActive`, `thresholdAmount` |
| **Product Detail** | Catalog > Edit Product | `desc` (Markdown), `tasteProfile` (JSON), `images` (Array) |
| **Shop Map** | Locations > Map | `lat`, `lng`, `openingHours` (JSON) |
| **Review Section** | Reviews > Moderate | `rating`, `comment`, `isVerified` |
| **Home Hero** | CMS > Hero | `headline`, `subHeadline`, `heroImage` |

---

## 3. Database Schema (Laravel Migrations Layout)

Adhering to SOLID and OOP principles, the schema uses JSON columns for flexible attributes while maintaining relational integrity.

### `users` table
- `id` (bigint, PK)
- `name` (string)
- `email` (string, unique)
- `password` (string)
- `role` (enum: 'admin', 'user')
- `orders_count` (int, default 0)

### `categories` table
- `id` (bigint, PK)
- `name` (string)
- `slug` (string, unique)
- `description` (text, nullable)
- `parent_id` (bigint, FK to self)

### `products` table
- `id` (bigint, PK)
- `category_id` (bigint, FK to categories)
- `slug` (string, unique)
- `name` (string)
- `name_en` (string)
- `tagline` (string, nullable)
- `price` (decimal, 10,2)
- `original_price` (decimal, 10,2, nullable)
- `intensity` (int, 1-13, nullable)
- `images` (json: array of URLs)
- `taste_profile` (json: bitterness, acidity, roastiness, etc.)
- `features` (json: nested arrays for characteristic accordions)
- `description` (longText: for Markdown rich text)
- `description_en` (longText)
- `is_in_stock` (boolean, default true)
- `is_featured` (boolean, default false)

### `orders` table
- `id` (bigint, PK)
- `user_id` (bigint, FK, nullable for guest)
- `order_number` (string, unique, e.g., CF-99281A)
- `status` (enum: 'pending', 'processing', 'shipped', 'delivered', 'cancelled')
- `total_amount` (decimal, 10,2)
- `shipping_address` (json: street, city, postal_code, etc.)
- **payment_method** (string: 'cod', 'stripe', 'card')
- **payment_reference** (string, nullable: e.g., Stripe Transaction ID, *never store raw card numbers*)
- **promo_code** (string, nullable)

### `order_items` table
- `id` (bigint, PK)
- `order_id` (bigint, FK)
- `product_id` (bigint, FK)
- `quantity` (int)
- `unit_price` (decimal, 10,2)

### `shipments` table
- `id` (bigint, PK)
- `order_id` (bigint, FK)
- `tracking_number` (string, nullable)
- `carrier` (string, nullable)
- `shipped_at` (timestamp, nullable)
- `delivery_estimate` (date, nullable)

### `reviews` table
- `id` (bigint, PK)
- `product_id` (bigint, FK)
- `user_id` (bigint, FK)
- `rating` (int, 1-5)
- `title` (string)
- `comment` (text)
- `is_verified` (boolean)
- `status` (enum: 'pending', 'approved', 'rejected')

### `locations` table
- `id` (bigint, PK)
- `name` (string)
- `address` (string)
- `latitude` (decimal, 10,7)
- `longitude` (decimal, 10,7)
- `schedule` (json: opening hours per day)

---

## 4. Development Prompts (Atomic Generation)

To build this logic using the **Atomic Architecture** defined in Part 1, use these tactical prompts:

### Prompt A: The Advanced Product Migration
> "Generate a migration for the `products` table that includes standard fields (name, slug, price) plus JSON columns for `taste_profile`, `features`, and `images`. Ensure `description` and `description_en` are `longText` to support the Markdown data used by the Next.js RichText component."

### Prompt B: The Order State Machine
> "Generate a Service class `OrderStateService` that manages order transitions. Implement a method `shipped(Order $id, string $trackingNum)`. It must update the order, create a `Shipment` record, and trigger an `OrderShipped` event for async notifications."

### Prompt C: The Global Configuration System
> "Create a `Setting` model and repository for the CMS. It should support keys like `promo_banner_active`, `free_shipping_threshold`, and `hero_headline`. Implement a caching layer so the Next.js frontend calls are lightning fast."

---

## 5. Security & Compliance Reminder

> [!IMPORTANT]
> **No Sensitive Data Storage**: Under no circumstances should the Laravel backend store Credit Card Numbers, CVVs, or Expiry Dates. All payments must be handled via tokens or redirect-based flows (Stripe/PayPal). The `orders` table only stores the payment method type and the external transaction reference.

---

*This document serves as the final architectural authority for the Cafrezzo Laravel Backend.*
