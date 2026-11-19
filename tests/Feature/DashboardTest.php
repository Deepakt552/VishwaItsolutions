<?php

use App\Models\User;
use App\Models\WebsiteVisit;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('verified administrators can visit the dashboard', function () {
    $user = User::factory()->admin()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('public storefront visits are tracked by unique IP and shown on the dashboard', function () {
    $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])->get(route('home'))->assertOk();
    $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])->get(route('storefront.services'))->assertOk();
    $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.25'])->get(route('storefront.shop'))->assertOk();

    expect(WebsiteVisit::query()->count())->toBe(2);
    expect(WebsiteVisit::query()->where('ip_address', '203.0.113.10')->value('visits_count'))->toBe(2);
    expect(WebsiteVisit::query()->where('ip_address', '203.0.113.10')->value('first_path'))->toBe('/');
    expect(WebsiteVisit::query()->where('ip_address', '203.0.113.10')->value('last_path'))->toBe('/services');

    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->withServerVariables(['REMOTE_ADDR' => '198.51.100.99'])
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.uniqueVisitors', 2)
            ->where('stats.totalPageViews', 3)
            ->has('visitors.data', 2)
        );

    expect(WebsiteVisit::query()->where('ip_address', '198.51.100.99')->exists())->toBeFalse();
});
