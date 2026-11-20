<?php

use App\Http\Controllers\Admin\AutomationController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\GalleryPhotoController;
use App\Http\Controllers\Admin\InboxController;
use App\Http\Controllers\Admin\IntegrationController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ReviewIntegrationController;
use App\Http\Controllers\McpController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\StorefrontController;
use Illuminate\Support\Facades\Route;

Route::get('/', [StorefrontController::class, 'home'])->name('home');
Route::name('storefront.')->group(function (): void {
    Route::get('/about', [StorefrontController::class, 'about'])->name('about');
    Route::get('/services', [StorefrontController::class, 'services'])->name('services');
    Route::get('/services/{service}', [StorefrontController::class, 'service'])->name('service');
    Route::get('/shop', [StorefrontController::class, 'shop'])->name('shop');
    Route::get('/shop/{product:slug}', [StorefrontController::class, 'product'])->name('product');
    Route::get('/blog', [StorefrontController::class, 'blog'])->name('blog');
    Route::get('/blog/{post:slug}', [StorefrontController::class, 'article'])->name('article');
    Route::get('/contact', [StorefrontController::class, 'contact'])->name('contact');
    Route::get('/terms', [StorefrontController::class, 'terms'])->name('terms');
    Route::get('/review-sources', [StorefrontController::class, 'reviewSources'])->name('review-sources');
    Route::get('/reviews/live', [StorefrontController::class, 'liveReviews'])->middleware('throttle:public-reviews')->name('live-reviews');
    Route::post('/contact', [StorefrontController::class, 'sendMessage'])->middleware('throttle:contact-form')->name('contact.send');
    Route::get('/media/{file}', MediaController::class)->where('file', '[a-f0-9-]{36}\.(?:jpeg|jpg|png|webp)')->name('media');
    Route::get('/sitemap.xml', [StorefrontController::class, 'sitemap'])->name('sitemap');
    Route::get('/llms.txt', [StorefrontController::class, 'llmsTxt'])->name('llms');
    Route::get('/llms-full.txt', [StorefrontController::class, 'llmsFullTxt'])->name('llms-full');
    Route::get('/.well-known/mcp/server-card.json', [McpController::class, 'serverCard'])->name('mcp-server-card');
    Route::get('/robots.txt', fn () => response(
        "User-agent: *\nContent-Signal: search=yes, ai-input=yes, ai-train=no\nDisallow: /admin/\nDisallow: /dashboard\nDisallow: /settings/\nSitemap: ".route('storefront.sitemap')."\n",
        200,
        ['Content-Type' => 'text/plain; charset=UTF-8'],
    ))->name('robots');
});

Route::middleware(['auth', 'verified', 'can:manage-store'])->group(function (): void {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::prefix('admin')->name('admin.')->group(function (): void {
        Route::resource('products', ProductController::class)->except('show');
        Route::resource('posts', PostController::class)->except('show');
        Route::resource('gallery', GalleryPhotoController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['gallery' => 'photo']);
        Route::get('inbox', [InboxController::class, 'index'])->name('inbox.index');
        Route::get('inbox/{message}', [InboxController::class, 'show'])->name('inbox.show');
        Route::patch('inbox/{message}', [InboxController::class, 'update'])->name('inbox.update');
        Route::delete('inbox/{message}', [InboxController::class, 'destroy'])->name('inbox.destroy');
        Route::get('automation', [AutomationController::class, 'index'])->name('automation.index');
        Route::post('automation', [AutomationController::class, 'store'])->middleware('throttle:draft-generation')->name('automation.store');
        Route::get('integrations', [IntegrationController::class, 'index'])->name('integrations.index');
        Route::patch('integrations', [IntegrationController::class, 'update'])->name('integrations.update');
        Route::post('integrations/token', [IntegrationController::class, 'rotate'])->middleware('throttle:api-token-rotation')->name('integrations.rotate');
        Route::get('reviews', [ReviewIntegrationController::class, 'index'])->name('reviews.index');
        Route::patch('reviews', [ReviewIntegrationController::class, 'update'])->name('reviews.update');
        Route::post('reviews/refresh', [ReviewIntegrationController::class, 'refresh'])->name('reviews.refresh');
    });
});

require __DIR__.'/settings.php';
