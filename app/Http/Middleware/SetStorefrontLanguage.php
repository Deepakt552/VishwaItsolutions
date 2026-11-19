<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetStorefrontLanguage
{
    private const LANGUAGES = ['en', 'mr', 'gu'];

    /** @param Closure(Request): Response $next */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->routeIs('home', 'storefront.*', 'login', 'login.*', 'password.*', 'verification.*')) {
            return $next($request);
        }

        $requested = $request->query->all()['lang'] ?? null;

        if ($request->isMethod('GET') && in_array($requested, self::LANGUAGES, true)) {
            $request->session()->put('storefront_locale', $requested);
        }

        $previousLocale = app()->getLocale();
        $locale = $request->session()->get('storefront_locale', 'en');
        $language = in_array($locale, self::LANGUAGES, true) ? $locale : 'en';
        app()->setLocale($language);

        try {
            return $next($request);
        } finally {
            app()->setLocale($previousLocale);
        }
    }
}
