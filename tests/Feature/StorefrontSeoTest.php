<?php

use App\Models\Post;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;

test('the www storefront permanently redirects to the primary HTTPS URL', function () {
    $this->get('https://www.vishwaitsolutions.in/services/macbook-repair?utm_source=google')
        ->assertStatus(308)
        ->assertRedirect('https://vishwaitsolutions.in/services/macbook-repair?utm_source=google');
});

test('the homepage identifies the workshop and its profiles without using provider reviews in search markup', function () {
    Cache::put('live_reviews.payload', ['google' => ['status' => 'live', 'rating' => 5, 'count' => 248]]);

    $this->get(route('home', ['utm_source' => 'google']))
        ->assertOk()
        ->assertSee('<title data-inertia>Laptop &amp; PC Repair in Nalasopara East | Vishwa IT Solutions</title>', false)
        ->assertSee('href="'.route('home').'/"', false)
        ->assertSee('https://maps.google.com/?cid=724797085471440985', false)
        ->assertDontSee('aggregateRating')
        ->assertDontSee('name="keywords"', false);
});

test('each specialist repair has its own crawlable page and sitemap entry', function (string $slug, string $heading) {
    $url = route('storefront.service', $slug);

    $this->get($url.'?utm_source=google')
        ->assertOk()
        ->assertSee('rel="canonical" href="'.$url.'"', false)
        ->assertSee($heading)
        ->assertSee('"@type":"BreadcrumbList"', false)
        ->assertInertia(fn (Assert $page) => $page->component('storefront/service')->has('relatedServices', 3));

    $this->get(route('storefront.services'))->assertSee('href="'.$url.'"', false);
    $this->get(route('storefront.sitemap'))->assertSee('<loc>'.$url.'</loc>', false);
})->with([
    ['laptop-repair', 'Laptop and desktop problems we check'],
    ['macbook-repair', 'Charging, display and logic board faults'],
    ['motherboard-repair', 'What chip-level repair involves'],
    ['data-recovery', 'Avoid writing more data to the drive'],
]);

test('an unknown repair service returns 404', function () {
    $this->get('/services/unknown-repair')->assertNotFound();
});

test('the sitemap exposes canonical public records and uses actual content dates', function () {
    $this->travelTo(now()->startOfDay());
    $product = Product::factory()->available()->create(['updated_at' => '2020-01-02 10:00:00']);
    $sold = Product::factory()->create(['status' => 'sold']);
    $post = Post::factory()->published()->create([
        'published_at' => '2020-01-03 11:00:00',
        'updated_at' => '2020-01-01 10:00:00',
    ]);
    $scheduled = Post::factory()->create(['published_at' => now()->addDay()]);
    $draft = Post::factory()->create();

    $response = $this->get('/sitemap.xml')
        ->assertOk()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
        ->assertDontSee(route('storefront.product', $sold->slug))
        ->assertDontSee(route('storefront.article', $scheduled->slug))
        ->assertDontSee(route('storefront.article', $draft->slug));

    $xml = simplexml_load_string((string) $response->getContent());
    expect($xml)->not->toBeFalse();

    $dates = [];
    foreach ($xml->url as $entry) {
        $dates[(string) $entry->loc] = (string) $entry->lastmod;
    }

    expect($dates[route('home').'/'])->toBe('');
    expect($dates[route('storefront.product', $product->slug)])->toBe('2020-01-02T10:00:00+00:00');
    expect($dates[route('storefront.article', $post->slug)])->toBe('2020-01-03T11:00:00+00:00');
    $this->get('/robots.txt')->assertSee('Sitemap: '.route('storefront.sitemap'), false);
});

test('listings use canonical pagination and return 404 after the last page', function (string $listing) {
    if ($listing === 'blog') {
        Post::factory()->published()->count(10)->create();
    } else {
        Product::factory()->available()->count(13)->create();
    }

    $this->get('/'.$listing.'?page=2&utm_source=google')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('seo.canonical', route('storefront.'.$listing, ['page' => 2])));

    $this->get('/'.$listing.'?page=3')->assertNotFound();
})->with(['shop', 'blog']);
