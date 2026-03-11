<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasTable('product_reviews')) {
            Schema::create('product_reviews', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->string('reviewer_name');
                $table->string('reviewer_avatar')->nullable();
                $table->unsignedTinyInteger('rating'); // 1–5
                $table->string('title')->nullable();
                $table->text('comment');
                $table->date('review_date');
                $table->boolean('is_verified_purchase')->default(false);
                $table->timestamps();
            });
        }
    }
    public function down(): void {
        Schema::dropIfExists('product_reviews');
    }
};
