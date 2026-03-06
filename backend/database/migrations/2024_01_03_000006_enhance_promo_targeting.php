<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Enhanced promo targeting:
 *
 * applies_to: 'all' | 'products' | 'categories'
 * included_ids: JSON array of product IDs or category IDs
 * exclude_discounted_products: skip products that already have a discount
 *
 * Pivot table for product-specific promos (many-to-many)
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('promo_codes', function (Blueprint $table) {
            // Replace simple string with enum-style targeting
            $table->json('included_ids')->nullable()->after('applies_to')
                ->comment('Array of product_id or category_id depending on applies_to');
            $table->boolean('exclude_discounted_products')->default(false)->after('included_ids')
                ->comment('Skip products that already have a discount');
            $table->boolean('exclude_on_sale_products')->default(false)->after('exclude_discounted_products')
                ->comment('Skip products marked is_on_sale');
        });

        // Pivot: link promo codes directly to specific products
        Schema::create('promo_code_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promo_code_id')->constrained('promo_codes')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->unique(['promo_code_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promo_code_products');
        Schema::table('promo_codes', function (Blueprint $table) {
            $table->dropColumn(['included_ids', 'exclude_discounted_products', 'exclude_on_sale_products']);
        });
    }
};
