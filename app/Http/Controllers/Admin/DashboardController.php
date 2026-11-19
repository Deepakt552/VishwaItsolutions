<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\ContactMessage;
use App\Models\Post;
use App\Models\Product;
use App\Models\WebsiteVisit;
use App\Services\ProductCatalog;
use App\Services\ProductIntegration;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, ProductIntegration $integration): Response
    {
        $inventory = Product::query()->selectRaw('status, COUNT(*) AS total')->groupBy('status')->pluck('total', 'status');
        $visitorSearch = trim((string) $request->query('visitor_q', ''));

        $visitorsQuery = WebsiteVisit::query()->latest('last_visited_at')->latest('id');

        if ($visitorSearch !== '') {
            $visitorsQuery->where(function ($query) use ($visitorSearch): void {
                $like = '%'.addcslashes($visitorSearch, '%_\\').'%';
                $query->where('ip_address', 'like', $like)
                    ->orWhere('first_path', 'like', $like)
                    ->orWhere('last_path', 'like', $like)
                    ->orWhere('user_agent', 'like', $like);
            });
        }

        $visitors = $visitorsQuery->paginate(20, [
            'id',
            'ip_address',
            'visits_count',
            'first_path',
            'last_path',
            'user_agent',
            'referrer',
            'first_visited_at',
            'last_visited_at',
        ], 'visitors_page')->withQueryString()->through(fn (WebsiteVisit $visit): array => [
            'id' => $visit->id,
            'ip_address' => $visit->ip_address,
            'visits_count' => $visit->visits_count,
            'first_path' => $visit->first_path,
            'last_path' => $visit->last_path,
            'user_agent' => $visit->user_agent,
            'referrer' => $visit->referrer,
            'first_visited_at' => $visit->first_visited_at?->toIso8601String(),
            'last_visited_at' => $visit->last_visited_at?->toIso8601String(),
        ]);

        return Inertia::render('dashboard', [
            'stats' => [
                'uniqueVisitors' => WebsiteVisit::query()->count(),
                'todayVisitors' => WebsiteVisit::query()->where('last_visited_at', '>=', now()->startOfDay())->count(),
                'totalPageViews' => (int) WebsiteVisit::query()->sum('visits_count'),
                'available' => (int) $inventory->get('available', 0),
                'sold' => (int) $inventory->get('sold', 0),
                'drafts' => (int) $inventory->get('draft', 0),
                'published' => Post::published()->count(),
                'unread' => ContactMessage::query()->whereNull('read_at')->count(),
            ],
            'visitors' => $visitors,
            'visitorSearch' => $visitorSearch,
            'products' => ProductResource::collection(Product::query()->latest('updated_at')->latest('id')->limit(6)->get(ProductCatalog::CARD_COLUMNS))->resolve(),
            'posts' => Post::query()->latest('updated_at')->latest('id')->limit(4)->get(['id', 'title', 'published_at']),
            'apiEnabled' => $integration->enabled(),
        ]);
    }
}
