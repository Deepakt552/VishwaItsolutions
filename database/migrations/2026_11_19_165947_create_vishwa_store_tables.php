<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('is_admin')->default(false);
        });

        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 150);
            $table->string('slug', 180)->unique();
            $table->string('category', 40);
            $table->string('condition', 40);
            $table->string('status', 20)->default('draft');
            $table->string('processor', 150)->nullable();
            $table->unsignedSmallInteger('ram_gb')->nullable();
            $table->unsignedInteger('storage_gb')->nullable();
            $table->string('storage_type', 30)->nullable();
            $table->string('graphics', 150)->nullable();
            $table->string('operating_system', 100)->nullable();
            $table->unsignedSmallInteger('age_months')->nullable();
            $table->decimal('price', 12, 2)->nullable();
            $table->text('description')->nullable();
            $table->text('features')->nullable();
            $table->json('photos');
            $table->boolean('featured')->default(false);
            $table->timestamps();
            $table->index(['status', 'category']);
            $table->index(['status', 'featured', 'id']);
        });

        Schema::create('posts', function (Blueprint $table): void {
            $table->id();
            $table->string('title', 150);
            $table->string('slug', 180)->unique();
            $table->string('excerpt', 300);
            $table->longText('body');
            $table->string('cover')->nullable();
            $table->string('cover_alt', 160)->nullable();
            $table->string('seo_title', 70)->nullable();
            $table->string('seo_description', 170)->nullable();
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('contact_messages', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 120);
            $table->string('email');
            $table->string('phone', 30)->nullable();
            $table->string('subject', 160);
            $table->text('message');
            $table->timestamp('read_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('generations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('kind', 20);
            $table->string('topic', 180);
            $table->text('notes')->nullable();
            $table->string('reference_path')->nullable();
            $table->string('reference_mime', 100)->nullable();
            $table->string('status', 20)->default('queued');
            $table->string('error')->nullable();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('post_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('product_integration', function (Blueprint $table): void {
            $table->unsignedTinyInteger('id')->primary();
            $table->boolean('enabled')->default(false);
            $table->string('token_hash', 64)->nullable();
            $table->timestamp('rotated_at')->nullable();
        });
        DB::table('product_integration')->insert(['id' => 1]);
    }

    public function down(): void
    {
        Schema::dropIfExists('product_integration');
        Schema::dropIfExists('generations');
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('products');

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('is_admin');
        });
    }
};
