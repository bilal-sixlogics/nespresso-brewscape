<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('mail_templates', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();   // e.g. order_confirmed, order_shipped
            $table->string('name');            // Human label
            $table->string('subject_fr');
            $table->string('subject_en')->nullable();
            $table->longText('body_fr');       // HTML body (rich editor)
            $table->longText('body_en')->nullable();
            $table->json('variables')->nullable(); // Available merge vars e.g. {order_number}
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('newsletter_subscribers', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('name')->nullable();
            $table->enum('locale', ['fr', 'en', 'de', 'ru', 'nl'])->default('fr');
            $table->string('token', 64)->unique(); // unsubscribe token
            $table->timestamp('subscribed_at')->nullable();
            $table->timestamp('unsubscribed_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });

        Schema::create('newsletter_sends', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mail_template_id')->nullable()->constrained()->nullOnDelete();
            $table->string('subject');
            $table->longText('body_html');
            $table->unsignedInteger('recipient_count')->default(0);
            $table->enum('status', ['draft', 'sending', 'sent', 'failed'])->default('draft');
            $table->foreignId('sent_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        Schema::create('policy_pages', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // privacy, returns, terms, cookies
            $table->string('title_fr');
            $table->string('title_en')->nullable();
            $table->longText('content_fr');
            $table->longText('content_en')->nullable();
            $table->timestamp('last_updated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('policy_pages');
        Schema::dropIfExists('newsletter_sends');
        Schema::dropIfExists('newsletter_subscribers');
        Schema::dropIfExists('mail_templates');
    }
};
