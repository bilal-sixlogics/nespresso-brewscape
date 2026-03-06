<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // Products: most-queried filters
        Schema::table('products', function (Blueprint $table) {
            $table->index(['is_active', 'in_stock', 'is_featured'], 'products_filter_idx');
            $table->index(['category_id', 'is_active'], 'products_category_active_idx');
            $table->index(['brand_id', 'is_active'], 'products_brand_active_idx');
            $table->index(['price', 'is_active'], 'products_price_idx');
            $table->index(['average_rating', 'is_active'], 'products_rating_idx');
        });
        // Product tags: tag lookups
        Schema::table('product_tags', function (Blueprint $table) {
            $table->index(['tag', 'product_id'], 'product_tags_lookup_idx');
        });
        // Inventory: fast stock checks
        Schema::table('inventory_stock', function (Blueprint $table) {
            $table->index('quantity_on_hand', 'inventory_qty_idx');
        });
        // Orders: dashboard queries
        Schema::table('orders', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'orders_status_date_idx');
            $table->index(['user_id', 'status'], 'orders_user_status_idx');
        });
        // Blog: listing queries
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->index(['is_published', 'published_at'], 'blog_published_idx');
            $table->index('category', 'blog_category_idx');
        });
        // Activity log: audit queries
        Schema::table('activity_log', function (Blueprint $table) {
            $table->index(['subject_type', 'subject_id', 'created_at'], 'activity_subject_idx');
            $table->index(['causer_id', 'created_at'], 'activity_causer_idx');
        });
        // Site banners: front-end query
        Schema::table('site_banners', function (Blueprint $table) {
            $table->index(['is_active', 'sort_order'], 'banners_active_idx');
        });
    }
    public function down(): void {
        Schema::table('products', function (Blueprint $t) {
            $t->dropIndex('products_filter_idx');
            $t->dropIndex('products_category_active_idx');
            $t->dropIndex('products_brand_active_idx');
            $t->dropIndex('products_price_idx');
            $t->dropIndex('products_rating_idx');
        });
    }
};
