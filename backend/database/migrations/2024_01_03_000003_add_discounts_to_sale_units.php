<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Flexible discount system for sale units:
 *
 * 1. Per-unit override price (original_price already exists → covers crossed-out price)
 * 2. Discount can come from:
 *    a) sale_unit level: explicit discount_percent or fixed discount_amount
 *    b) product level: is_on_sale flag + sale_discount_percent applies to ALL units
 *       UNLESS a unit has inherit_product_discount = false
 *    c) deals table: time-limited deal price (already exists)
 *    d) sitewide discount from settings (applied at cart level)
 *
 * Examples:
 *  - 1kg @ €12 with 10% off → discount_percent=10, effective_price=10.80
 *  - 10kg pack @ €100, NOT on sale → inherit_product_discount=false
 *  - Product has 15% sitewide → all units get 15% unless overridden
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('product_sale_units', function (Blueprint $table) {
            // Explicit per-unit discount
            $table->decimal('discount_percent', 5, 2)->nullable()->after('original_price');
            $table->decimal('discount_amount', 10, 2)->nullable()->after('discount_percent');  // fixed €-off

            // Whether this unit inherits product-level discount (true = yes, false = excluded)
            $table->boolean('inherit_product_discount')->default(true)->after('discount_amount');

            // Optional: when this unit's individual discount expires
            $table->timestamp('discount_expires_at')->nullable()->after('inherit_product_discount');
        });

        // Product-level sale fields
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_on_sale')->default(false)->after('is_new');
            $table->decimal('sale_discount_percent', 5, 2)->nullable()->after('is_on_sale');
            $table->timestamp('sale_ends_at')->nullable()->after('sale_discount_percent');
        });
    }

    public function down(): void
    {
        Schema::table('product_sale_units', function (Blueprint $table) {
            $table->dropColumn(['discount_percent', 'discount_amount', 'inherit_product_discount', 'discount_expires_at']);
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['is_on_sale', 'sale_discount_percent', 'sale_ends_at']);
        });
    }
};
