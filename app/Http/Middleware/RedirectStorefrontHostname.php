<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectStorefrontHostname
{
    /** @param Closure(Request): Response $next */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->getHost() === 'www.vishwaitsolutions.in') {
            return redirect()->away('https://vishwaitsolutions.in'.$request->getRequestUri(), 308);
        }

        return $next($request);
    }
}
