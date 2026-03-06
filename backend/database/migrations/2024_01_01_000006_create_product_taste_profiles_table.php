<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('product_taste_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('bitterness')->default(1);
            $table->unsignedTinyInteger('acidity')->default(1);
            $table->unsignedTinyInteger('roastiness')->default(1);
            $table->unsignedTinyInteger('body')->default(1);
            $table->unsignedTinyInteger('sweetness')->default(1);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('product_taste_profiles'); }
};
