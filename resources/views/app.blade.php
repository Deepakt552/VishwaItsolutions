<!DOCTYPE html>
@php($seo = $page['props']['seo'] ?? null)
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title data-inertia>{{ $seo ? $seo['title'].' | Vishwa IT Solutions' : 'Vishwa IT Solutions' }}</title>
            @if ($seo)
                <meta data-inertia="description" name="description" content="{{ $seo['description'] }}">
                <meta data-inertia="robots" name="robots" content="{{ $seo['robots'] }}">
                <link data-inertia="canonical" rel="canonical" href="{{ $seo['canonical'] }}">
                <meta data-inertia="og:title" property="og:title" content="{{ $seo['title'] }}">
                <meta data-inertia="og:description" property="og:description" content="{{ $seo['description'] }}">
                <meta data-inertia="og:image" property="og:image" content="{{ $seo['image'] }}">
                <meta data-inertia="og:image:alt" property="og:image:alt" content="{{ $seo['imageAlt'] }}">
                <meta data-inertia="og:url" property="og:url" content="{{ $seo['canonical'] }}">
                <meta data-inertia="og:type" property="og:type" content="{{ $seo['type'] }}">
                <meta data-inertia="og:site_name" property="og:site_name" content="Vishwa IT Solutions">
                <meta data-inertia="og:locale" property="og:locale" content="{{ app()->getLocale() }}_IN">
                <meta data-inertia="twitter:card" name="twitter:card" content="summary_large_image">
                <meta data-inertia="twitter:title" name="twitter:title" content="{{ $seo['title'] }}">
                <meta data-inertia="twitter:description" name="twitter:description" content="{{ $seo['description'] }}">
                <meta data-inertia="twitter:image" name="twitter:image" content="{{ $seo['image'] }}">
                <meta data-inertia="twitter:image:alt" name="twitter:image:alt" content="{{ $seo['imageAlt'] }}">
                @if ($seo['structured'])
                    <script data-inertia="structured" type="application/ld+json">{!! $seo['structured'] !!}</script>
                @endif
            @else
                <meta data-inertia="robots" name="robots" content="noindex,nofollow">
            @endif
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
        @if ($seo)
            <noscript>
                <main>
                    <h1>{{ $seo['title'] }}</h1>
                    <p>{{ $seo['description'] }}</p>
                @if ($page['component'] === 'storefront/service')
                    @foreach ($page['props']['service']['sections'] as $heading => $copy)
                        <h2>{{ $heading }}</h2>
                        <p>{{ $copy }}</p>
                    @endforeach
                    <p><a href="tel:{{ \App\Services\Seo::BUSINESS_PHONE }}">Call +91 76667 04188</a> or <a href="{{ route('storefront.contact') }}">contact the Nalasopara East workshop</a>.</p>
                @endif
                @if (!empty($page['props']['repairServices']) || !empty($page['props']['relatedServices']))
                    <nav aria-label="Repair services">
                        <ul>
                            @foreach (($page['props']['repairServices'] ?? $page['props']['relatedServices']) as $serviceLink)
                                <li><a href="{{ $serviceLink['url'] }}">{{ $serviceLink['name'] }}</a></li>
                            @endforeach
                        </ul>
                    </nav>
                @endif
                    <nav aria-label="Primary links">
                        <a href="{{ route('home') }}">Home</a>
                        <a href="{{ route('storefront.about') }}">About</a>
                        <a href="{{ route('storefront.services') }}">Services</a>
                        <a href="{{ route('storefront.shop') }}">Shop</a>
                        <a href="{{ route('storefront.blog') }}">Blog</a>
                        <a href="{{ route('storefront.contact') }}">Contact</a>
                        <a href="{{ route('storefront.terms') }}">Terms &amp; Privacy</a>
                    </nav>
                </main>
            </noscript>
        @endif
    </body>
</html>
