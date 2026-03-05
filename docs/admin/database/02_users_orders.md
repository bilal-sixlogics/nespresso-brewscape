# Users & Orders Database Schema

This section manages the core e-commerce flow, integrating user profiling with order fulfillment, payments, and shipping.

## 1. Users Table (`users`)
- `id` (PK, BigInt)
- `first_name` (String)
- `last_name` (String)
- `email` (String, Unique)
- `password_hash` (String)
- `role` (Enum: `admin`, `customer`)
- `avatar_url` (String, nullable)
- `loyalty_points_balance` (Int, default 0)
- `loyalty_tier` (Enum: `espresso`, `cafe`, `grand_crema`, `barista_elite`)
- `status` (Enum: `active`, `suspended`) - Admin control
- `timestamps`

## 2. User Addresses (`user_addresses`)
- `id` (PK, BigInt)
- `user_id` (FK, BigInt)
- `label` (String) - e.g., "Home", "Office"
- `first_name` (String)
- `last_name` (String)
- `street_address` (String)
- `apartment` (String, nullable)
- `city` (String)
- `postal_code` (String)
- `country` (String)
- `phone` (String)
- `is_default` (Boolean, default false)

## 3. Orders (`orders`)
- `id` (PK, BigInt)
- `user_id` (FK, BigInt, nullable) - Nullable for Guest checkout
- `order_number` (String, Unique) - e.g., CF-8X92M
- `status` (Enum: `pending`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`) - Completely editable by Admin
- `subtotal` (Decimal 10,2)
- `shipping_cost` (Decimal 10,2)
- `discount_amount` (Decimal 10,2, default 0)
- `grand_total` (Decimal 10,2)
- `shipping_address` (JSON) - Snapshot of the address at the moment of order
- `billing_address` (JSON, nullable)
- `promo_code_applied` (String, nullable)
- `customer_notes` (Text, nullable)
- `timestamps`

## 4. Order Items (`order_items`)
Links individual products/variants to an order.
- `id` (PK, BigInt)
- `order_id` (FK, BigInt)
- `product_id` (FK, BigInt)
- `variant_id` (FK, BigInt, nullable)
- `product_name_snapshot` (String) - Prevents past orders from altering if a product name changes later
- `quantity` (Int)
- `unit_price` (Decimal 10,2)
- `total_price` (Decimal 10,2)

## 5. Payments (`payments`)
Tracking external gateways without storing sensitive card data.
- `id` (PK, BigInt)
- `order_id` (FK, BigInt)
- `payment_method` (Enum: `stripe`, `wise`, `apple_pay`, `cod`)
- `gateway_transaction_id` (String, nullable) - Reference from Stripe/Wise
- `amount` (Decimal 10,2)
- `status` (Enum: `pending`, `successful`, `failed`, `refunded`)
- `paid_at` (Timestamp, nullable)

## 6. Shipments & Tracking (`shipments`)
Admin updates this to trigger "Order Shipped" emails.
- `id` (PK, BigInt)
- `order_id` (FK, BigInt)
- `carrier` (String) - e.g., DHL, FedEx, Colissimo
- `tracking_number` (String)
- `tracking_url` (String, nullable)
- `shipped_at` (Timestamp)
- `estimated_delivery` (Date, nullable)

## 7. Return/Refund Requests (`returns`)
- `id` (PK, BigInt)
- `order_id` (FK, BigInt)
- `user_id` (FK, BigInt)
- `reason` (String)
- `description` (Text)
- `preferred_resolution` (Enum: `original_payment`, `store_credit_bonus`)
- `status` (Enum: `pending`, `approved`, `rejected`, `completed`) - Admin review pipeline
- `admin_notes` (Text, nullable)
- `timestamps`
