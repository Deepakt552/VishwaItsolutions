<?php

namespace App\Http\Middleware;

use App\Services\ProductIntegration;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireProductApiToken
{
    public function __construct(private ProductIntegration $integration) {}

    /** @param Closure(Request): Response $next */
    public function handle(Request $request, Closure $next): Response
    {
        $settings = $this->integration->settings();

        abort_unless($settings && $settings->enabled, 503, 'Product publishing API is disabled.');
        $token = $request->bearerToken();

        abort_unless(
            $token && is_string($settings->token_hash) && hash_equals($settings->token_hash, hash('sha256', $token)),
            401,
            'A valid product API token is required.',
            ['WWW-Authenticate' => 'Bearer'],
        );

        return $next($request);
    }
}
