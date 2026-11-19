<?php

namespace App\Http\Middleware;

use App\Models\WebsiteVisit;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class TrackWebsiteVisit
{
    /** @var list<string> */
    private const EXCLUDED_PREFIXES = [
        'admin',
        'dashboard',
        'settings',
        'login',
        'logout',
        'register',
        'password',
        'forgot-password',
        'reset-password',
        'email',
        'reviews/live',
        'media/',
        'sitemap.xml',
        'robots.txt',
        'up',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldTrack($request, $response)) {
            $this->record($request);
        }

        return $response;
    }

    private function shouldTrack(Request $request, Response $response): bool
    {
        if (! $request->isMethod('GET') || $response->getStatusCode() >= 400) {
            return false;
        }

        if ($request->expectsJson() && ! $request->header('X-Inertia')) {
            return false;
        }

        $path = ltrim($request->path(), '/');

        foreach (self::EXCLUDED_PREFIXES as $prefix) {
            if ($path === $prefix || str_starts_with($path, $prefix.'/')) {
                return false;
            }
        }

        return filled($request->ip());
    }

    private function record(Request $request): void
    {
        $ip = Str::limit((string) $request->ip(), 45, '');
        $path = '/'.ltrim($request->path(), '/');
        $path = Str::limit($path === '//' ? '/' : $path, 255, '');
        $userAgent = $request->userAgent() ? Str::limit($request->userAgent(), 512, '') : null;
        $referrer = $request->headers->get('referer');
        $referrer = is_string($referrer) && trim($referrer) !== '' ? Str::limit(trim($referrer), 500, '') : null;
        $now = now();

        try {
            $updated = WebsiteVisit::query()
                ->where('ip_address', $ip)
                ->update([
                    'visits_count' => DB::raw('visits_count + 1'),
                    'last_path' => $path,
                    'user_agent' => $userAgent,
                    'last_visited_at' => $now,
                ]);

            if ($updated === 0) {
                WebsiteVisit::query()->create([
                    'ip_address' => $ip,
                    'visits_count' => 1,
                    'first_path' => $path,
                    'last_path' => $path,
                    'user_agent' => $userAgent,
                    'referrer' => $referrer,
                    'first_visited_at' => $now,
                    'last_visited_at' => $now,
                ]);
            }
        } catch (\Throwable) {
            // Never block a visitor page load if analytics logging fails.
        }
    }
}
