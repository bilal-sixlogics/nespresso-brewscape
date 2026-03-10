<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add sku to products (nullable, unique, auto-generated per type)
        if (!Schema::hasColumn('products', 'sku')) {
            Schema::table('products', function (Blueprint $table) {
                $table->string('sku', 50)->nullable()->unique()->after('brand_id');
            });
        }

        // 2. Add product_type to products
        if (!Schema::hasColumn('products', 'product_type')) {
            Schema::table('products', function (Blueprint $table) {
                $table->string('product_type', 20)->default('coffee')->after('brand_id');
            });
        }

        // 3. Add product_type to categories
        if (!Schema::hasColumn('categories', 'product_type')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->string('product_type', 20)->default('all')->after('is_active');
            });
        }

        // 4. Seed product_type on products via SQLite-compatible correlated subquery
        DB::statement("
            UPDATE products
            SET product_type = (
                SELECT CASE
                    WHEN c.name LIKE '%Machine%' OR c.name LIKE '%Grinder%'
                        OR c.name LIKE '%Cafetière%' OR c.name LIKE '%Cafetiere%' THEN 'machine'
                    WHEN c.name LIKE '%Accessoire%' OR c.name LIKE '%Tasse%'
                        OR c.name LIKE '%Moulin%' THEN 'accessory'
                    WHEN c.name LIKE '%Douceur%' OR c.name LIKE '%Biscuit%'
                        OR c.name LIKE '%Chocolat%' OR c.name LIKE '%Sucre%' THEN 'sweet'
                    ELSE 'coffee'
                END
                FROM categories c
                WHERE c.id = products.category_id
            )
            WHERE category_id IS NOT NULL
        ");

        // 5. Seed categories product_type
        DB::statement("
            UPDATE categories SET product_type = CASE
                WHEN name LIKE '%Machine%' OR name LIKE '%Grinder%'
                    OR name LIKE '%Cafetière%' OR name LIKE '%Cafetiere%' THEN 'machine'
                WHEN name LIKE '%Accessoire%' OR name LIKE '%Tasse%'
                    OR name LIKE '%Moulin%' THEN 'accessory'
                WHEN name LIKE '%Douceur%' OR name LIKE '%Biscuit%'
                    OR name LIKE '%Chocolat%' THEN 'sweet'
                WHEN name LIKE '%Café%' OR name LIKE '%Cafe%'
                    OR name LIKE '%Capsule%' OR name LIKE '%Grain%'
                    OR name LIKE '%Moulu%' THEN 'coffee'
                ELSE 'all'
            END
        ");
    }

    public function down(): void
    {
        foreach (['sku', 'product_type'] as $col) {
            if (Schema::hasColumn('products', $col)) {
                Schema::table('products', fn(Blueprint $t) => $t->dropColumn($col));
            }
        }
        if (Schema::hasColumn('categories', 'product_type')) {
            Schema::table('categories', fn(Blueprint $t) => $t->dropColumn('product_type'));
        }
    }
};
