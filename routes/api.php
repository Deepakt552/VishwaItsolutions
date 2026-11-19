<?php

use App\Http\Controllers\Api\ProductController;
use App\Http\Middleware\RequireProductApiToken;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->middleware(['throttle:product-api', RequireProductApiToken::class])->group(function (): void {
    Route::post('products', [ProductController::class, 'store'])->name('products.store');
});
