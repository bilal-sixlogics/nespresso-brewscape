<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('product_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('note_text');
        });
        Schema::create('product_brew_sizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('brew_size');
        });
        Schema::create('product_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('tag');
            $table->index(['product_id', 'tag']);
        });
        Schema::create('product_allergens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('allergen_text');
            $table->string('allergen_text_en')->nullable();
        });
    }
    public function down(): void {
        Schema::dropIfExists('product_allergens');
        Schema::dropIfExists('product_tags');
        Schema::dropIfExists('product_brew_sizes');
        Schema::dropIfExists('product_notes');
    }
};
