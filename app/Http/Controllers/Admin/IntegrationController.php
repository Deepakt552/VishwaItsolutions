<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ProductIntegration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IntegrationController extends Controller
{
    public function index(ProductIntegration $integration): Response
    {
        $settings = $integration->settings();

        return Inertia::render('admin/integrations', [
            'enabled' => (bool) ($settings->enabled ?? false),
            'hasToken' => isset($settings->token_hash),
            'rotatedAt' => $settings->rotated_at ?? null,
            'endpoint' => route('api.v1.products.store'),
        ]);
    }

    public function update(Request $request, ProductIntegration $integration): RedirectResponse
    {
        $request->validate(['enabled' => ['required', 'boolean']]);
        $integration->setEnabled($request->boolean('enabled'));

        return to_route('admin.integrations.index')->with('success', 'API settings saved.');
    }

    public function rotate(ProductIntegration $integration): RedirectResponse
    {
        Inertia::flash('apiToken', $integration->rotate());

        return to_route('admin.integrations.index')->with('success', 'A new API token was issued.');
    }
}
