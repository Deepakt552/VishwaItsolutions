<?php

use App\Models\User;
use App\Services\LiveReviews;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

test('review credentials are encrypted and used only for configured providers', function () {
    config(['services.justdial.reviews_endpoint' => 'https://partner.example.test/reviews']);
    Http::preventStrayRequests();
    Http::fake([
        'places.googleapis.com/*' => Http::response([
            'rating' => 4.8,
            'userRatingCount' => 19,
            'googleMapsUri' => 'https://maps.google.com/example',
            'reviews' => [[
                'rating' => 5,
                'originalText' => ['text' => 'Original feedback'],
                'text' => ['text' => 'Translated feedback'],
                'authorAttribution' => ['displayName' => 'Google reviewer', 'uri' => 'https://maps.google.com/contributor'],
                'googleMapsUri' => 'https://maps.google.com/review',
            ]],
        ]),
        'partner.example.test/*' => Http::response([
            'rating' => 4.5,
            'review_count' => 44,
            'reviews' => [['author' => 'Justdial reviewer', 'rating' => 4, 'text' => 'Feed feedback', 'url' => 'javascript:bad()']],
        ]),
    ]);

    $path = route('admin.reviews.index');
    $this->get($path)->assertRedirect(route('login'));
    $this->actingAs(User::factory()->create())->get($path)->assertForbidden();

    $this->actingAs(User::factory()->admin()->create())->patch(route('admin.reviews.update'), [
        'google_place_id' => 'ChI_test-place',
        'google_key' => 'test-google-restricted-key',
        'justdial_listing_id' => 'TEST.PARTNER',
        'justdial_key' => 'test-justdial-partner-key',
    ])->assertRedirect($path)->assertSessionHasNoErrors();

    $settings = DB::table('review_integration')->first();
    expect($settings->google_key)->not->toBe('test-google-restricted-key');
    expect(Crypt::decryptString($settings->google_key))->toBe('test-google-restricted-key');
    $this->get($path)->assertDontSee('test-google-restricted-key')->assertDontSee('test-justdial-partner-key')
        ->assertInertia(fn (Assert $page) => $page->where('googleReady', true)->where('justdialReady', true));

    $response = $this->getJson(route('storefront.live-reviews'))
        ->assertOk()->assertJsonPath('google.status', 'live')
        ->assertJsonPath('google.reviews.0.text', 'Original feedback')
        ->assertJsonPath('google.reviews.0.url', 'https://maps.google.com/review')
        ->assertJsonPath('justdial.reviews.0.text', 'Feed feedback')
        ->assertJsonPath('justdial.reviews.0.url', null);
    expect($response->headers->get('Cache-Control'))->toContain('no-store');

    Http::assertSent(fn (Request $request): bool => str_contains($request->url(), '/places/ChI_test-place')
        && $request->hasHeader('X-Goog-Api-Key', 'test-google-restricted-key')
        && $request->hasHeader('X-Goog-FieldMask', 'rating,userRatingCount,googleMapsUri,reviews,attributions'));
    Http::assertSent(fn (Request $request): bool => str_contains($request->url(), 'listing_id=TEST.PARTNER')
        && $request->hasHeader('Authorization', 'Bearer test-justdial-partner-key'));

    $this->patch(route('admin.reviews.update'), [
        'google_place_id' => 'ChI_test-place',
        'remove_google_key' => true,
        'justdial_listing_id' => 'TEST.PARTNER',
    ])->assertRedirect($path)->assertSessionHasNoErrors();
    expect(DB::table('review_integration')->value('google_key'))->toBeNull();
    expect(Crypt::decryptString(DB::table('review_integration')->value('justdial_key')))->toBe('test-justdial-partner-key');
});

test('a failing review provider leaves the other feed usable', function () {
    config(['services.justdial.reviews_endpoint' => 'https://partner.example.test/reviews']);
    app(LiveReviews::class)->save([
        'google_place_id' => 'test-place',
        'google_key' => 'test-google-key',
        'justdial_listing_id' => 'test-listing',
        'justdial_key' => 'test-justdial-key',
    ]);
    Http::preventStrayRequests();
    Http::fake([
        'places.googleapis.com/*' => Http::failedConnection(),
        'partner.example.test/*' => Http::response(['rating' => 4.6, 'review_count' => 31]),
    ]);

    $this->getJson(route('storefront.live-reviews'))->assertOk()
        ->assertJsonPath('google.status', 'unavailable')
        ->assertJsonPath('justdial.status', 'live')
        ->assertJsonPath('justdial.count', 31);
});

test('unconfigured review providers make no outbound requests and show no invented scores', function () {
    Http::fake();

    $this->getJson(route('storefront.live-reviews'))->assertExactJson([
        'google' => ['status' => 'unconfigured'],
        'justdial' => ['status' => 'unconfigured'],
    ]);
    Http::assertNothingSent();
});

test('justdial listing URLs are normalized to their listing ID and reviews can be refreshed', function () {
    config(['services.justdial.reviews_endpoint' => 'https://partner.example.test/reviews']);
    Http::preventStrayRequests();
    Http::fake([
        'partner.example.test/*' => Http::response([
            'rating' => 4.9,
            'review_count' => 86,
            'listing_url' => 'https://www.justdial.com/Palghar/Vishwa-It-Solutions-Near-Rambharose-Hotel-Nalasopara-East/022PXX22-XX22-211220161254-E5C8_BZDET',
        ]),
    ]);

    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->patch(route('admin.reviews.update'), [
        'justdial_listing_id' => 'https://www.justdial.com/Palghar/Vishwa-It-Solutions-Near-Rambharose-Hotel-Nalasopara-East/022PXX22-XX22-211220161254-E5C8_BZDET',
        'justdial_key' => 'test-justdial-partner-key',
    ])->assertRedirect(route('admin.reviews.index'))->assertSessionHasNoErrors();

    expect(DB::table('review_integration')->value('justdial_listing_id'))
        ->toBe('022PXX22-XX22-211220161254-E5C8_BZDET');

    $this->actingAs($admin)->post(route('admin.reviews.refresh'))
        ->assertRedirect(route('admin.reviews.index'));

    $this->artisan('vishwa:refresh-reviews')->assertSuccessful();

    $this->getJson(route('storefront.live-reviews'))->assertOk()
        ->assertJsonPath('justdial.status', 'live')
        ->assertJsonPath('justdial.rating', 4.9)
        ->assertJsonPath('justdial.count', 86);
});

test('manual justdial rating and customer reviews work without a paid partner feed', function () {
    Http::fake();

    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->patch(route('admin.reviews.update'), [
        'justdial_manual_rating' => 4.9,
        'justdial_manual_count' => 92,
        'justdial_manual_url' => 'https://www.justdial.com/Palghar/Vishwa-It-Solutions-Near-Rambharose-Hotel-Nalasopara-East/022PXX22-XX22-211220161254-E5C8_BZDET',
        'justdial_manual_reviews' => [
            [
                'author' => 'Rahul Sharma',
                'rating' => 5,
                'date' => 'Nov 2026',
                'text' => 'Fast laptop motherboard repair and transparent pricing.',
            ],
        ],
    ])->assertRedirect(route('admin.reviews.index'))->assertSessionHasNoErrors();

    $this->getJson(route('storefront.live-reviews'))->assertOk()
        ->assertJsonPath('google.status', 'unconfigured')
        ->assertJsonPath('justdial.status', 'live')
        ->assertJsonPath('justdial.rating', 4.9)
        ->assertJsonPath('justdial.count', 92)
        ->assertJsonPath('justdial.reviews.0.author', 'Rahul Sharma')
        ->assertJsonPath('justdial.reviews.0.text', 'Fast laptop motherboard repair and transparent pricing.');

    Http::assertNothingSent();
});

test('google reviews are sorted latest first and cached for 12 hours without repeat API calls', function () {
    Http::preventStrayRequests();
    Http::fake([
        'places.googleapis.com/*' => Http::response([
            'rating' => 4.9,
            'userRatingCount' => 42,
            'reviews' => [
                [
                    'rating' => 4,
                    'publishTime' => '2026-01-10T10:00:00Z',
                    'originalText' => ['text' => 'Older review'],
                    'authorAttribution' => ['displayName' => 'Older Author'],
                ],
                [
                    'rating' => 5,
                    'publishTime' => '2026-11-18T12:00:00Z',
                    'originalText' => ['text' => 'Latest review'],
                    'authorAttribution' => ['displayName' => 'Newest Author'],
                ],
            ],
        ]),
    ]);

    app(LiveReviews::class)->save([
        'google_place_id' => 'ChIJ_latest-test',
        'google_key' => 'test-google-key-123',
    ]);

    $this->getJson(route('storefront.live-reviews'))
        ->assertOk()
        ->assertJsonPath('google.reviews.0.author', 'Newest Author')
        ->assertJsonPath('google.reviews.0.text', 'Latest review')
        ->assertJsonPath('google.reviews.1.author', 'Older Author');

    // Second request must be served from 12-hour cache with zero extra outbound HTTP calls
    $this->getJson(route('storefront.live-reviews'))->assertOk();
    Http::assertSentCount(1);
});
