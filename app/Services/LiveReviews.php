<?php

namespace App\Services;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class LiveReviews
{
    private const CACHE_KEY = 'live_reviews.payload';

    private const REFRESHED_AT_KEY = 'live_reviews.refreshed_at';

    private const AVAILABILITY_KEY = 'live_reviews.availability';

    private const CACHE_TTL_HOURS = 12;

    /** @return array{google: bool, justdial: bool} */
    public function availability(): array
    {
        return Cache::remember(
            self::AVAILABILITY_KEY,
            now()->addHours(self::CACHE_TTL_HOURS),
            function (): array {
                $settings = $this->configuration();

                return [
                    'google' => $settings['googleReady'],
                    'justdial' => $settings['justdialReady'],
                ];
            },
        );
    }

    /**
     * @return array{
     *     googlePlaceId: string|null,
     *     googleSaved: bool,
     *     googleReady: bool,
     *     justdialListingId: string|null,
     *     justdialSaved: bool,
     *     justdialFeedConfigured: bool,
     *     justdialReady: bool,
     *     justdialManualRating: float|null,
     *     justdialManualCount: int|null,
     *     justdialManualUrl: string|null,
     *     justdialManualReviews: array<int, array{author: string, rating: float|null, text: string|null, date: string|null, url: string|null}>,
     *     lastRefreshedAt: string|null
     * }
     */
    public function configuration(): array
    {
        $settings = $this->settings();
        $feedConfigured = $this->justdialEndpoint() !== null;
        $manualReviews = $this->manualJustdialReviews($settings);
        $hasManualJustdial = $this->hasManualJustdial($settings, $manualReviews);
        $justdialFeedReady = $feedConfigured && filled($settings->justdial_key ?? null) && filled($settings->justdial_listing_id ?? null);

        return [
            'googlePlaceId' => $settings->google_place_id ?? null,
            'googleSaved' => filled($settings->google_key ?? null),
            'googleReady' => filled($settings->google_key ?? null) && filled($settings->google_place_id ?? null),
            'justdialListingId' => $settings->justdial_listing_id ?? null,
            'justdialSaved' => filled($settings->justdial_key ?? null),
            'justdialFeedConfigured' => $feedConfigured,
            'justdialReady' => $justdialFeedReady || $hasManualJustdial,
            'justdialManualRating' => $this->rating($settings->justdial_manual_rating ?? null),
            'justdialManualCount' => isset($settings->justdial_manual_count) ? (int) $settings->justdial_manual_count : null,
            'justdialManualUrl' => $this->httpsUrl($settings->justdial_manual_url ?? null),
            'justdialManualReviews' => $manualReviews,
            'lastRefreshedAt' => Cache::get(self::REFRESHED_AT_KEY),
        ];
    }

    /** @param array<string, mixed> $data */
    public function save(array $data): void
    {
        $updates = [
            'google_place_id' => $data['google_place_id'] ?? null,
            'justdial_listing_id' => self::normalizeJustdialListingId($data['justdial_listing_id'] ?? null),
        ];

        foreach (['google', 'justdial'] as $provider) {
            $field = $provider.'_key';

            if ($data['remove_'.$field] ?? false) {
                $updates[$field] = null;
            } elseif (filled($data[$field] ?? null)) {
                $updates[$field] = Crypt::encryptString($data[$field]);
            }
        }

        if (array_key_exists('justdial_manual_rating', $data)) {
            $updates['justdial_manual_rating'] = $this->rating($data['justdial_manual_rating']);
        }

        if (array_key_exists('justdial_manual_count', $data)) {
            $count = filter_var($data['justdial_manual_count'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
            $updates['justdial_manual_count'] = $count === false ? null : $count;
        }

        if (array_key_exists('justdial_manual_url', $data)) {
            $updates['justdial_manual_url'] = $this->httpsUrl($data['justdial_manual_url']);
        }

        if (array_key_exists('justdial_manual_reviews', $data)) {
            $cleaned = [];
            $items = is_array($data['justdial_manual_reviews']) ? $data['justdial_manual_reviews'] : [];

            foreach (array_slice($items, 0, 12) as $item) {
                if (! is_array($item)) {
                    continue;
                }

                $author = $this->text($item['author'] ?? null);
                $grade = $this->rating($item['rating'] ?? null);
                $body = $this->text($item['text'] ?? null);

                if ($author === null || ($grade === null && $body === null)) {
                    continue;
                }

                $cleaned[] = [
                    'author' => $author,
                    'rating' => $grade,
                    'text' => $body,
                    'date' => $this->text($item['date'] ?? null),
                    'url' => $this->httpsUrl($item['url'] ?? null),
                ];
            }

            $updates['justdial_manual_reviews'] = $cleaned === [] ? null : json_encode($cleaned, JSON_UNESCAPED_UNICODE);
        }

        DB::table('review_integration')->where('id', 1)->update($updates);
        $this->clearCache();
    }

    public static function normalizeJustdialListingId(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $trimmed = trim($value);

        if (filter_var($trimmed, FILTER_VALIDATE_URL)) {
            $path = (string) parse_url($trimmed, PHP_URL_PATH);
            $segments = array_values(array_filter(explode('/', $path), fn (string $segment): bool => $segment !== ''));
            $last = end($segments);

            if (is_string($last) && preg_match('/^[a-zA-Z0-9_.-]+$/D', $last) === 1) {
                return $last;
            }

            return null;
        }

        return $trimmed;
    }

    /** @return array<string, mixed> */
    public function refresh(): array
    {
        return $this->fetch(forceRefresh: true);
    }

    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
        Cache::forget(self::REFRESHED_AT_KEY);
        Cache::forget(self::AVAILABILITY_KEY);
    }

    /** @return array<string, mixed> */
    public function fetch(bool $forceRefresh = false): array
    {
        $settings = $this->settings();
        $googleKey = $this->credential($settings->google_key ?? null);
        $justdialKey = $this->credential($settings->justdial_key ?? null);
        $justdialEndpoint = $this->justdialEndpoint();

        $googleReady = $googleKey !== null && filled($settings->google_place_id ?? null);
        $justdialFeedReady = $justdialKey !== null && $justdialEndpoint !== null && filled($settings->justdial_listing_id ?? null);
        $manualReviews = $this->manualJustdialReviews($settings);
        $hasManualJustdial = $this->hasManualJustdial($settings, $manualReviews);

        if (! $googleReady && ! $justdialFeedReady && ! $hasManualJustdial) {
            return ['google' => ['status' => 'unconfigured'], 'justdial' => ['status' => 'unconfigured']];
        }

        if (! $forceRefresh) {
            $cached = Cache::get(self::CACHE_KEY);
            if (is_array($cached)) {
                return $cached;
            }
        }

        $results = [];

        if ($googleReady || $justdialFeedReady) {
            $results = Http::pool(function (Pool $pool) use ($settings, $googleKey, $justdialKey, $justdialEndpoint, $googleReady, $justdialFeedReady): array {
                $requests = [];

                if ($googleReady) {
                    $requests[] = $pool->as('google')->acceptJson()->withoutRedirecting()->connectTimeout(3)->timeout(7)
                        ->withHeaders([
                            'X-Goog-Api-Key' => $googleKey,
                            'X-Goog-FieldMask' => 'rating,userRatingCount,googleMapsUri,reviews,attributions',
                        ])
                        ->get('https://places.googleapis.com/v1/places/'.rawurlencode($settings->google_place_id), ['languageCode' => 'en']);
                }

                if ($justdialFeedReady) {
                    $requests[] = $pool->as('justdial')->acceptJson()->withoutRedirecting()->connectTimeout(3)->timeout(7)
                        ->withToken($justdialKey)->get($justdialEndpoint, ['listing_id' => $settings->justdial_listing_id]);
                }

                return $requests;
            });
        }

        $justdialPayload = $justdialFeedReady
            ? $this->provider($results['justdial'] ?? null, true, google: false)
            : ($hasManualJustdial ? $this->manualJustdialPayload($settings, $manualReviews) : ['status' => 'unconfigured']);

        if ($justdialFeedReady && $justdialPayload['status'] !== 'live' && $hasManualJustdial) {
            $justdialPayload = $this->manualJustdialPayload($settings, $manualReviews);
        }

        $payload = [
            'google' => $this->provider($results['google'] ?? null, $googleReady, google: true),
            'justdial' => $justdialPayload,
        ];

        if ($payload['google']['status'] === 'live' || $payload['justdial']['status'] === 'live') {
            $expiresAt = now()->addHours(self::CACHE_TTL_HOURS);
            Cache::put(self::CACHE_KEY, $payload, $expiresAt);
            Cache::put(self::REFRESHED_AT_KEY, now()->toIso8601String(), $expiresAt);
        }

        return $payload;
    }

    /**
     * @param  array<int, array{author: string, rating: float|null, text: string|null, date: string|null, url: string|null}>  $reviews
     * @return array<string, mixed>
     */
    private function manualJustdialPayload(?\stdClass $settings, array $reviews): array
    {
        $url = $this->httpsUrl($settings->justdial_manual_url ?? null);

        return [
            'status' => 'live',
            'rating' => $this->rating($settings->justdial_manual_rating ?? null),
            'count' => isset($settings->justdial_manual_count) ? (int) $settings->justdial_manual_count : null,
            'url' => $url,
            'reviews' => array_map(fn (array $review): array => [
                'author' => $review['author'],
                'text' => $review['text'],
                'rating' => $review['rating'],
                'date' => $review['date'],
                'authorUrl' => null,
                'photo' => null,
                'url' => $review['url'] ?? $url,
            ], $reviews),
            'attributions' => [],
        ];
    }

    /**
     * @return array<int, array{author: string, rating: float|null, text: string|null, date: string|null, url: string|null}>
     */
    private function manualJustdialReviews(?\stdClass $settings): array
    {
        $raw = $settings->justdial_manual_reviews ?? null;

        if (! is_string($raw) || trim($raw) === '') {
            return [];
        }

        $decoded = json_decode($raw, true);

        if (! is_array($decoded)) {
            return [];
        }

        $items = [];

        foreach ($decoded as $review) {
            if (! is_array($review)) {
                continue;
            }

            $author = $this->text($review['author'] ?? null);
            $grade = $this->rating($review['rating'] ?? null);
            $body = $this->text($review['text'] ?? null);

            if ($author === null || ($grade === null && $body === null)) {
                continue;
            }

            $items[] = [
                'author' => $author,
                'rating' => $grade,
                'text' => $body,
                'date' => $this->text($review['date'] ?? null),
                'url' => $this->httpsUrl($review['url'] ?? null),
            ];
        }

        return $items;
    }

    /**
     * @param  array<int, array{author: string, rating: float|null, text: string|null, date: string|null, url: string|null}>  $reviews
     */
    private function hasManualJustdial(?\stdClass $settings, array $reviews): bool
    {
        return $this->rating($settings->justdial_manual_rating ?? null) !== null
            || isset($settings->justdial_manual_count)
            || $reviews !== [];
    }

    /** @return array<string, mixed> */
    private function provider(mixed $response, bool $ready, bool $google): array
    {
        if (! $ready) {
            return ['status' => 'unconfigured'];
        }

        if (! $response instanceof Response || ! $response->successful() || ! is_array($response->json())) {
            return ['status' => 'unavailable'];
        }

        $data = $response->json();
        $rating = $this->rating($data['rating'] ?? null);
        $count = filter_var($data[$google ? 'userRatingCount' : 'review_count'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
        $reviews = [];
        $items = $data['reviews'] ?? [];

        if (is_array($items)) {
            $sortable = [];

            foreach (array_slice($items, 0, $google ? 5 : 12) as $index => $review) {
                if (! is_array($review)) {
                    continue;
                }

                $author = $this->text(data_get($review, $google ? 'authorAttribution.displayName' : 'author'));
                $grade = $this->rating($review['rating'] ?? null);
                $body = $this->text($google ? data_get($review, 'originalText.text', data_get($review, 'text.text')) : ($review['text'] ?? null));

                if ($author === null || ($grade === null && $body === null)) {
                    continue;
                }

                $rawTime = $google
                    ? ($review['publishTime'] ?? null)
                    : ($review['published_at'] ?? $review['date'] ?? null);
                $timestamp = is_string($rawTime) ? strtotime($rawTime) : false;

                $sortable[] = [
                    'timestamp' => $timestamp === false ? 0 : $timestamp,
                    'index' => $index,
                    'review' => [
                        'author' => $author,
                        'text' => $body,
                        'rating' => $grade,
                        'date' => $this->text($review[$google ? 'relativePublishTimeDescription' : 'published_at'] ?? null),
                        'authorUrl' => $this->httpsUrl(data_get($review, $google ? 'authorAttribution.uri' : 'author_url')),
                        'photo' => $this->httpsUrl(data_get($review, $google ? 'authorAttribution.photoUri' : 'author_photo')),
                        'url' => $this->httpsUrl($review[$google ? 'googleMapsUri' : 'url'] ?? null),
                    ],
                ];
            }

            usort($sortable, static fn (array $a, array $b): int => ($b['timestamp'] <=> $a['timestamp']) ?: ($a['index'] <=> $b['index']));
            $reviews = array_column($sortable, 'review');
        }

        if ($rating === null && $count === false && $reviews === []) {
            return ['status' => 'unavailable'];
        }

        $attributions = [];
        if ($google && is_array($data['attributions'] ?? null)) {
            foreach ($data['attributions'] as $source) {
                $name = $this->text(data_get($source, 'provider'));
                if ($name !== null) {
                    $attributions[] = ['name' => $name, 'url' => $this->httpsUrl(data_get($source, 'providerUri'))];
                }
            }
        }

        return [
            'status' => 'live',
            'rating' => $rating,
            'count' => $count === false ? null : $count,
            'url' => $this->httpsUrl($data[$google ? 'googleMapsUri' : 'listing_url'] ?? null),
            'reviews' => $reviews,
            'attributions' => $attributions,
        ];
    }

    private function text(mixed $value): ?string
    {
        return is_string($value) && trim($value) !== '' ? Str::limit(trim($value), 12000, '') : null;
    }

    private function rating(mixed $value): ?float
    {
        return is_numeric($value) && $value >= 0 && $value <= 5 ? (float) $value : null;
    }

    private function httpsUrl(mixed $url): ?string
    {
        return is_string($url) && filter_var($url, FILTER_VALIDATE_URL) && parse_url($url, PHP_URL_SCHEME) === 'https' ? $url : null;
    }

    private function justdialEndpoint(): ?string
    {
        return $this->httpsUrl(config('services.justdial.reviews_endpoint'));
    }

    private function settings(): ?\stdClass
    {
        return DB::table('review_integration')->where('id', 1)->first();
    }

    private function credential(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (DecryptException) {
            return null;
        }
    }
}
