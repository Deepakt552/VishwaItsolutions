<?php

namespace App\Providers;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        Gate::define('manage-store', fn (User $user): bool => $user->is_admin);
        RateLimiter::for('contact-form', fn (Request $request): Limit => Limit::perMinute(5)->by($request->ip() ?? 'unknown'));
        RateLimiter::for('public-reviews', fn (Request $request): Limit => Limit::perMinute(20)->by($request->ip() ?? 'unknown'));
        RateLimiter::for('product-api', fn (Request $request): Limit => Limit::perMinute(60)->by($request->ip() ?? 'unknown'));
        RateLimiter::for('draft-generation', fn (Request $request): Limit => Limit::perMinute(6)->by($request->user()->id ?? 'unknown'));
        RateLimiter::for('api-token-rotation', fn (Request $request): Limit => Limit::perMinute(5)->by($request->user()->id ?? 'unknown'));

        Vite::useScriptTagAttributes(fn (?string $source, string $url, ?array $chunk): array => request()->routeIs('home') && $chunk !== null
            ? ['src' => false, 'data-home-module' => $url]
            : []);
        Vite::usePreloadTagAttributes(fn (?string $source, string $url): array|false => request()->routeIs('home') && str_ends_with($url, '.js')
            ? false
            : []);

        if ($this->app->runningUnitTests()) {
            Vite::useHotFile(storage_path('framework/testing-vite.hot'));
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
