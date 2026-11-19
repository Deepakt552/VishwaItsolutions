<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('review_integration', function (Blueprint $table): void {
            $table->decimal('justdial_manual_rating', 2, 1)->nullable()->after('justdial_key');
            $table->unsignedInteger('justdial_manual_count')->nullable()->after('justdial_manual_rating');
            $table->string('justdial_manual_url', 500)->nullable()->after('justdial_manual_count');
            $table->json('justdial_manual_reviews')->nullable()->after('justdial_manual_url');
        });
    }

    public function down(): void
    {
        Schema::table('review_integration', function (Blueprint $table): void {
            $table->dropColumn([
                'justdial_manual_rating',
                'justdial_manual_count',
                'justdial_manual_url',
                'justdial_manual_reviews',
            ]);
        });
    }
};
