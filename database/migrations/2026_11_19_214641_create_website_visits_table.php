<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('website_visits', function (Blueprint $table): void {
            $table->id();
            $table->string('ip_address', 45)->unique();
            $table->unsignedBigInteger('visits_count')->default(1);
            $table->string('first_path', 255);
            $table->string('last_path', 255);
            $table->string('user_agent', 512)->nullable();
            $table->string('referrer', 500)->nullable();
            $table->timestamp('first_visited_at')->useCurrent();
            $table->timestamp('last_visited_at')->useCurrent()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('website_visits');
    }
};
