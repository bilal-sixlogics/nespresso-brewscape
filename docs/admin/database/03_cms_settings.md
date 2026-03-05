# CMS, Settings & Communications Schema

This section dictates the tables that power exactly what the user sees on the frontend (outside of products) and how the system communicates with them.

## 1. Global Settings & Toggles (`settings`)
A key-value store for global platform switches that the admin can toggle instantly.
- `id` (PK)
- `key` (String, Unique) - e.g., `enable_cod_payment`, `free_shipping_threshold`, `maintenance_mode`
- `value` (Text / JSON)
- `type` (Enum: `boolean`, `integer`, `string`, `json`) - Helps the admin panel render a toggle, input, or JSON editor.

## 2. Promo Strips (`promo_strips`)
Powers the top sliding text bars.
- `id` (PK)
- `message_en` (String)
- `message_fr` (String)
- `link_url` (String, nullable)
- `is_active` (Boolean)
- `sort_order` (Int)
- `expires_at` (Timestamp, nullable)

## 3. Hero Banners (`hero_banners`)
- `id` (PK)
- `image_desktop_url` (String)
- `image_mobile_url` (String)
- `headline_en` (String)
- `headline_fr` (String)
- `subheadline_en` (String)
- `subheadline_fr` (String)
- `cta_text_en` (String)
- `cta_link` (String)
- `is_active` (Boolean)
- `sort_order` (Int)

## 4. Featured Sections (`featured_collections`)
Controls what appears in "Featured Machines", "New Arrivals", etc.
- `id` (PK)
- `identifier_key` (String, Unique) - e.g., `home_featured_machines`
- `title_en` (String)
- `title_fr` (String)
- `is_active` (Boolean)

**Pivot Table: `featured_collection_products`**
- `collection_id` (FK)
- `product_id` (FK)
- `sort_order` (Int) - Admin can drag-and-drop the order

## 5. System Notifications (`user_notifications`)
In-app notifications (the bell icon).
- `id` (PK)
- `user_id` (FK, BigInt, nullable) - If null, it's a global broadcast to ALL users.
- `type` (Enum: `order_update`, `promo`, `system`) - Determines the icon/color in the UI.
- `title_en` (String)
- `title_fr` (String)
- `message_en` (Text)
- `message_fr` (Text)
- `action_link` (String, nullable)
- `is_read` (Boolean, default false) - Actually, tracking "read" for global broadcasts requires a pivot table `user_notification_reads`.
- `created_at` (Timestamp)

## 6. Email Templates (`email_templates`)
Allows admin to rewrite automated emails without touching code.
- `id` (PK)
- `event_trigger` (String, Unique) - e.g., `order_shipped`, `welcome_email`
- `subject_en` (String)
- `subject_fr` (String)
- `html_body_en` (LongText, contains variables like `{{order_number}}`)
- `html_body_fr` (LongText)
- `is_active` (Boolean)

## 7. Newsletter Subscribers (`newsletter_subscribers`)
Collected from the footer.
- `id` (PK)
- `email` (String, Unique)
- `subscribed_at` (Timestamp)
- `source` (String) - e.g., "Footer", "Checkout"
- `status` (Enum: `active`, `unsubscribed`)
