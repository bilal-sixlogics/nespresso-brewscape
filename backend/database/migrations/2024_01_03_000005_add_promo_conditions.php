<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds conditional logic to promo_codes:
 *
 * Conditions:
 *   - min_order_amount   : promo only applies if cart subtotal >= this amount
 *   - first_order_only   : promo only valid for customer's very first order
 *   - max_discount_amount: cap the maximum discount (e.g. percent code capped at €20)
 *   - applies_to         : "all" | "category:{id}" | "product:{id}" — scope of promo
 *   - customer_email     : if set, restrict to a specific customer email
 *
 * Examples seeded:
 *   BIENVENUE10  → 10% off, first order only
 *   GROS5000     → 10% off, min order €5000
 *   ETE15        → 15% off all, capped at €30
 *   CAPSULE5     → €5 fixed off, category=capsules
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('promo_codes', function (Blueprint $table) {
            $table->decimal('min_order_amount', 10, 2)->nullable()->after('is_active')
                ->comment('Minimum cart subtotal required');
            $table->boolean('first_order_only')->default(false)->after('min_order_amount')
                ->comment('Only valid for customer first order');
            $table->decimal('max_discount_amount', 10, 2)->nullable()->after('first_order_only')
                ->comment('Cap: max discount euros regardless of percent');
            $table->string('applies_to')->default('all')->after('max_discount_amount')
                ->comment('all | category:{id} | product:{id}');
            $table->string('customer_email')->nullable()->after('applies_to')
                ->comment('Restrict to specific customer email');
            $table->string('description')->nullable()->after('customer_email')
                ->comment('Admin-facing note about this code');
        });
    }

    public function down(): void
    {
        Schema::table('promo_codes', function (Blueprint $table) {
            $table->dropColumn([
                'min_order_amount', 'first_order_only', 'max_discount_amount',
                'applies_to', 'customer_email', 'description',
            ]);
        });
    }
};
