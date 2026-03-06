<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('inventory_stock', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_sale_unit_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('quantity_on_hand', 10, 3)->default(0);
            $table->decimal('reorder_threshold', 10, 3)->default(5);
            $table->decimal('reorder_quantity', 10, 3)->default(10);
            $table->timestamp('updated_at')->nullable();
        });
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_sale_unit_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['restock', 'sale', 'return', 'adjustment', 'wastage']);
            $table->decimal('quantity', 10, 3);
            $table->decimal('quantity_before', 10, 3);
            $table->decimal('quantity_after', 10, 3);
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->nullable();
        });
    }
    public function down(): void {
        Schema::dropIfExists('inventory_transactions');
        Schema::dropIfExists('inventory_stock');
    }
};
