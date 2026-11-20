@php
    $language = ['en' => 0, 'mr' => 1, 'gu' => 2][app()->getLocale()] ?? 0;
    $text = fn (string $key): string => $homePreview['copy'][$key][$language];
    $phone = \App\Services\Seo::BUSINESS_PHONE;
    $whatsappUrl = 'https://wa.me/'.ltrim($phone, '+');
    $navigation = [
        'home' => route('home'),
        'services' => route('storefront.services'),
        'shop' => route('storefront.shop'),
        'blog' => route('storefront.blog'),
        'contact' => route('storefront.contact'),
    ];
@endphp

<div class="vishwa-site" id="home-preview">
    <div id="home-preview-header">
        <div class="preview-header-placeholder">
            <div class="topbar">
                <div class="wrap top-inner">
                    <a href="{{ \App\Services\Seo::GOOGLE_PROFILE }}" target="_blank" rel="noreferrer">{{ $text('location') }}</a>
                    <a href="tel:{{ $phone }}" dir="ltr">+91 76667 04188</a>
                </div>
            </div>
            <header class="header">
                <div class="wrap header-inner">
                    <a href="{{ $navigation['home'] }}" class="brand">
                        <img src="/vishwa-logo.svg" alt="Vishwa IT Solutions" width="192" height="63" fetchpriority="high">
                    </a>
                    <details class="preview-mobile-menu">
                        <summary class="menu-button" aria-label="{{ $text('mainNav') }}">
                            <span class="hamburger-bars" aria-hidden="true"><span></span><span></span><span></span></span>
                        </summary>
                        <nav aria-label="{{ $text('mainNav') }}">
                            @foreach ($navigation as $name => $url)
                                <a href="{{ $url }}">{{ $text($name) }}</a>
                            @endforeach
                        </nav>
                    </details>
                    <nav class="nav desktop-nav" aria-label="{{ $text('mainNav') }}">
                        @foreach ($navigation as $name => $url)
                            <a href="{{ $url }}" @if ($name === 'home') aria-current="page" @endif>{{ $text($name) }}</a>
                        @endforeach
                    </nav>
                    <a class="button header-chat" href="{{ $whatsappUrl }}" target="_blank" rel="noreferrer">{{ $text('whatsapp') }}</a>
                </div>
            </header>
        </div>
    </div>
    <section class="modern-hero hero-full" id="home-preview-content" tabindex="-1">
        <div class="hero-ambient" aria-hidden="true">
            <span class="hero-orb hero-orb-1"></span>
            <span class="hero-orb hero-orb-2"></span>
            <span class="hero-grid-overlay"></span>
        </div>
        <div class="motion-pattern" aria-hidden="true"><span></span><span></span><span></span></div>
        <div class="hero-wide-wrap modern-hero-grid">
            <div class="modern-hero-copy">
                <div class="hero-eyebrow-pill">
                    <span class="hero-live-dot" aria-hidden="true"></span>
                    <span>{{ $text('trustedLocal') }}</span>
                </div>
                <h1>{{ $text('heroTitle') }} <em>{{ $text('heroAccent') }}</em></h1>
                <p>{{ $text('heroServiceArea') }}</p>
                <div class="actions">
                    <a class="button hero-cta-primary" href="{{ $whatsappUrl }}?text={{ rawurlencode('Hi Vishwa IT Solutions, I need help with a computer repair.') }}" target="_blank" rel="noreferrer">
                        <img src="/brand/whatsapp-black.svg" alt="" width="19" height="19">
                        {{ $text('whatsapp') }}
                    </a>
                    <a class="button hero-cta-secondary" href="{{ $navigation['shop'] }}">
                        {{ $text('browseDevices') }}
                    </a>
                </div>
                <div class="hero-trust-dock" id="home-preview-reviews">
                    @foreach (['Google' => \App\Services\Seo::GOOGLE_PROFILE, 'Justdial' => \App\Services\Seo::JUSTDIAL_PROFILE] as $name => $url)
                        <a class="hero-review-badge preview-review-placeholder" href="{{ $url }}" target="_blank" rel="noreferrer">
                            <span class="hero-review-icon {{ $name === 'Google' ? 'google' : 'justdial' }}" aria-hidden="true">{{ $name === 'Google' ? 'G' : 'JD' }}</span>
                            <div class="hero-review-body">
                                <div class="hero-review-top"><strong translate="no">{{ $name }}</strong></div>
                                <div class="live-stars hero-stars" aria-hidden="true">★★★★★</div>
                                <div class="hero-review-rating-line"><span class="hero-review-meta">{{ $text('verifiedReviews') }}</span></div>
                            </div>
                        </a>
                    @endforeach
                </div>
            </div>
            <div class="hero-stage">
                <div class="hero-stage-glow" aria-hidden="true"></div>
                <div class="modern-hero-media">
                    <img src="{{ $homePreview['image']['src'] }}" srcset="{{ $homePreview['image']['srcSet'] }}" sizes="{{ $homePreview['image']['sizes'] }}"
                        alt="{{ $text('heroPhoto') }}" width="{{ $homePreview['image']['width'] }}" height="{{ $homePreview['image']['height'] }}" fetchpriority="high">
                    <div class="hero-media-scrim" aria-hidden="true"></div>
                </div>
                <div class="hero-float-chip chip-top">
                    <div>
                        <strong>{{ $text('hardwareLab') }}</strong>
                        <span>{{ $text('location') }}</span>
                    </div>
                </div>
                <a href="tel:{{ $phone }}" class="hero-float-chip chip-bottom">
                    <div>
                        <strong>{{ $text('sameDayCheck') }}</strong>
                        <span dir="ltr">+91 76667 04188</span>
                    </div>
                </a>
            </div>
        </div>
    </section>
</div>
