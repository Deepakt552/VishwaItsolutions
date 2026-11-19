<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('review_integration', function (Blueprint $table): void {
            $table->unsignedTinyInteger('id')->primary();
            $table->string('google_place_id')->nullable();
            $table->text('google_key')->nullable();
            $table->string('justdial_listing_id')->nullable();
            $table->text('justdial_key')->nullable();
        });
        DB::table('review_integration')->insert(['id' => 1]);
    }

    public function down(): void
    {
        Schema::dropIfExists('review_integration');
    }
};
