<?php

use App\Models\Post;
use App\Models\Product;
use Database\Seeders\LocalRepairGuidesSeeder;
use Illuminate\Support\Facades\Cache;
use Inertia\Support\Header;
use Inertia\Testing\AssertableInertia as Assert;

test('the www storefront permanently redirects to the primary HTTPS URL', function () {
    $this->get('https://www.vishwaitsolutions.in/services/macbook-repair?utm_source=google')
        ->assertStatus(308)
        ->assertRedirect('https://vishwaitsolutions.in/services/macbook-repair?utm_source=google');
});

test('the homepage identifies the workshop and its profiles without using provider reviews in search markup', function () {
    Cache::put('live_reviews.payload', ['google' => ['status' => 'live', 'rating' => 5, 'count' => 248]]);

    $response = $this->get(route('home', ['utm_source' => 'google']))
        ->assertOk()
        ->assertSee('<title data-inertia>Laptop &amp; PC Repair in Nalasopara East | Vishwa IT Solutions</title>', false)
        ->assertSee('href="'.route('home').'/"', false)
        ->assertSee('https://maps.google.com/?cid=724797085471440985', false)
        ->assertSee('"name":"Vasai-Virar"', false)
        ->assertSee('"price":"400"', false)
        ->assertDontSee('"name":"Mumbai Central Line', false)
        ->assertDontSee('aggregateRating')
        ->assertDontSee('name="keywords"', false)
        ->assertInertia(fn (Assert $page) => $page
            ->where('visitingChargeInr', 400)
            ->missing('seo.structured')
            ->missing('structuredData'));

    expect(substr_count((string) $response->getContent(), 'type="application/ld+json"'))->toBe(1);
});

test('Inertia navigation receives the destination structured data and metadata', function () {
    $url = route('storefront.service', 'macbook-repair');
    $version = $this->get(route('home'))->viewData('page')['version'] ?? '';

    $response = $this->get($url, [
        Header::INERTIA => 'true',
        Header::VERSION => $version,
    ])->assertOk()
        ->assertHeader(Header::INERTIA, 'true')
        ->assertJsonPath('props.seo.canonical', $url)
        ->assertJsonMissingPath('props.seo.structured');

    $schema = json_decode($response->json('props.structuredData'), true, flags: JSON_THROW_ON_ERROR);

    expect($schema['@graph'][1]['itemListElement'][2]['item'])->toBe($url);
});

test('each specialist repair has its own crawlable page and sitemap entry', function (string $slug, string $heading) {
    $url = route('storefront.service', $slug);

    $this->get($url.'?utm_source=google')
        ->assertOk()
        ->assertSee('rel="canonical" href="'.$url.'"', false)
        ->assertSee($heading)
        ->assertSee('"@type":"BreadcrumbList"', false)
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/service')
            ->has('relatedServices', 3)
            ->missing('structuredData'));

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

test('the local guides appear on the blog with links to their repair services', function () {
    $this->freezeTime();
    $this->seed(LocalRepairGuidesSeeder::class);

    $this->get(route('storefront.blog'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('posts.data', 5));

    $guides = [
        'macbook-wont-turn-on-after-monsoon' => 'macbook-repair',
        'desktop-turns-on-but-no-display' => 'laptop-repair',
        'laptop-no-power-charger-or-motherboard' => 'motherboard-repair',
        'nvme-ssd-data-recovery-vasai-virar' => 'data-recovery',
        'laptop-overheating-slow-shutdown' => 'laptop-repair',
    ];

    foreach ($guides as $slug => $service) {
        $link = 'href="'.route('storefront.service', $service, absolute: false).'"';

        $this->get(route('storefront.article', $slug))
            ->assertOk()
            ->assertSee('"@type":"BreadcrumbList"', false)
            ->assertInertia(fn (Assert $page) => $page
                ->where('post.html', fn (string $html): bool => str_contains($html, $link))
                ->missing('structuredData'));
    }
});

test('rerunning the guide seeder preserves edits to existing guides', function () {
    $this->freezeTime();
    $post = Post::factory()->create(['slug' => 'macbook-wont-turn-on-after-monsoon']);

    $this->seed(LocalRepairGuidesSeeder::class);

    $this->assertDatabaseCount('posts', 5);
    $this->assertDatabaseHas('posts', [
        'id' => $post->id,
        'body' => $post->body,
        'published_at' => null,
    ]);
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
