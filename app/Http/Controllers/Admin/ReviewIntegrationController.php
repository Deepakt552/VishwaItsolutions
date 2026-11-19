<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\LiveReviews;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewIntegrationController extends Controller
{
    public function index(LiveReviews $reviews): Response
    {
        return Inertia::render('admin/reviews', $reviews->configuration());
    }

    public function update(Request $request, LiveReviews $reviews): RedirectResponse
    {
        $normalizedJustdial = LiveReviews::normalizeJustdialListingId($request->input('justdial_listing_id'));

        if ($request->filled('justdial_listing_id') && $normalizedJustdial !== null) {
            $request->merge(['justdial_listing_id' => $normalizedJustdial]);
        }

        $data = $request->validate([
            'google_place_id' => ['nullable', 'string', 'max:255', 'regex:/^[a-zA-Z0-9_-]+$/D'],
            'google_key' => ['nullable', 'string', 'min:10', 'max:512', 'regex:/^[\x21-\x7E]+$/D'],
            'remove_google_key' => ['sometimes', 'boolean'],
            'justdial_listing_id' => ['nullable', 'string', 'max:255', 'regex:/^[a-zA-Z0-9_.-]+$/D'],
            'justdial_key' => ['nullable', 'string', 'min:10', 'max:512', 'regex:/^[\x21-\x7E]+$/D'],
            'remove_justdial_key' => ['sometimes', 'boolean'],
            'justdial_manual_rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'justdial_manual_count' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'justdial_manual_url' => ['nullable', 'url:https', 'max:500'],
            'justdial_manual_reviews' => ['nullable', 'array', 'max:12'],
            'justdial_manual_reviews.*.author' => ['nullable', 'string', 'max:120'],
            'justdial_manual_reviews.*.rating' => ['nullable', 'numeric', 'min:1', 'max:5'],
            'justdial_manual_reviews.*.date' => ['nullable', 'string', 'max:60'],
            'justdial_manual_reviews.*.text' => ['nullable', 'string', 'max:2000'],
            'justdial_manual_reviews.*.url' => ['nullable', 'url:https', 'max:500'],
        ]);

        $reviews->save($data);

        return to_route('admin.reviews.index')->with('success', 'Review settings saved.');
    }

    public function refresh(LiveReviews $reviews): RedirectResponse
    {
        $result = $reviews->refresh();
        $liveProviders = array_keys(array_filter(
            $result,
            fn (array $feed): bool => ($feed['status'] ?? null) === 'live',
        ));

        if ($liveProviders === []) {
            return to_route('admin.reviews.index')->with('success', 'Refresh attempted. Configure a Google API key or Justdial rating/reviews to show live ratings.');
        }

        return to_route('admin.reviews.index')->with('success', 'Refreshed reviews for: '.implode(', ', $liveProviders).'.');
    }
}
