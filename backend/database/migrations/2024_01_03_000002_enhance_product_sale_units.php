<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds hierarchical sale unit support:
 *
 * Base unit example: 1 kg
 * Sale units:
 *   - 500g   → base_quantity=0.5, base_unit=kg
 *   - 1kg    → base_quantity=1,   base_unit=kg
 *   - 10kg pack → base_quantity=10, base_unit=kg
 *
 * Bundle units (parent_sale_unit_id):
 *   - Set of 6 packs (6 × 10kg pack) → parent_sale_unit_id={10kg_unit_id}, quantity=6
 *   - Set of 11 packs (11 × 10kg pack) → parent_sale_unit_id={10kg_unit_id}, quantity=11
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('product_sale_units', function (Blueprint $table) {
            // Base unit definition (what 1 "unit" represents)
            $table->string('base_unit')->nullable()->after('quantity');       // e.g. "kg", "g", "ml", "pack"
            $table->decimal('base_quantity', 10, 3)->nullable()->after('base_unit'); // how many base_units in this sale unit

            // For bundle/set units: references a "parent" sale unit
            $table->foreignId('parent_sale_unit_id')
                ->nullable()
                ->after('base_quantity')
                ->constrained('product_sale_units')
                ->nullOnDelete();

            // Quantity in a bundle (e.g. 6 for "Set of 6 packs")
            // Rename existing 'quantity' to 'pack_quantity' for clarity
            // Actually we add a new bundle_count field instead to preserve existing data
            $table->unsignedSmallInteger('bundle_count')->nullable()->after('parent_sale_unit_id');

            // Optional: weight and volume for shipping/comparison
            $table->decimal('weight_kg', 8, 3)->nullable()->after('bundle_count'); // gross weight for shipping
        });
    }

    public function down(): void
    {
        Schema::table('product_sale_units', function (Blueprint $table) {
            $table->dropForeign(['parent_sale_unit_id']);
            $table->dropColumn(['base_unit', 'base_quantity', 'parent_sale_unit_id', 'bundle_count', 'weight_kg']);
        });
    }
};
