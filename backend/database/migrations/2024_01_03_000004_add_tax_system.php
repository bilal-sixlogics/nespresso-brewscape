<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tax / VAT System:
 *
 * Global tax settings live in the `settings` table (group=tax):
 *   - tax_enabled        : boolean — turn entire tax system on/off
 *   - tax_mode           : "cart_total" | "per_product" — apply to full cart or per-item
 *   - tax_rate           : decimal — default tax % (e.g. 21 for Belgian VAT)
 *   - tax_label          : string — label in FR (e.g. "TVA 21%")
 *   - tax_label_en       : string — label in EN (e.g. "VAT 21%")
 *   - tax_inclusive      : boolean — are prices already tax-inclusive?
 *
 * Product overrides on `products` table:
 *   - tax_rate_override  : if set, overrides global tax_rate for this product
 *   - is_tax_exempt      : boolean — this product is completely tax-exempt
 */
return new class extends Migration {
    public function up(): void
    {
        // Per-product tax override columns
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('tax_rate_override', 5, 2)->nullable()->after('sale_ends_at')
                ->comment('Overrides global tax rate for this product');
            $table->boolean('is_tax_exempt')->default(false)->after('tax_rate_override')
                ->comment('If true, no tax applied regardless of global setting');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['tax_rate_override', 'is_tax_exempt']);
        });
    }
};
