<?php

use Inertia\Testing\AssertableInertia as Assert;

test('a selected language follows storefront and auth navigation', function () {
    $this->get(route('storefront.services', ['lang' => 'mr']))
        ->assertOk()
        ->assertSee('<html lang="mr"', escape: false)
        ->assertInertia(fn (Assert $page) => $page->component('storefront/services')->where('locale', 'mr'));

    $this->get(route('storefront.shop'))
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'mr'));

    $this->get(route('login', ['lang' => 'gu']))
        ->assertSee('<html lang="gu"', escape: false)
        ->assertInertia(fn (Assert $page) => $page->component('auth/login')->where('locale', 'gu'));

    $this->get(route('storefront.contact'))
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'gu'));

    $this->get(route('home', ['lang' => 'en']))
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
});

test('unknown languages leave the active language in place', function () {
    $this->withSession(['storefront_locale' => 'mr'])
        ->get(route('home', ['lang' => ['gu']]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'mr'));
});

test('the services page is listed in the public sitemap', function () {
    $this->get(route('storefront.sitemap'))->assertOk()
        ->assertSee(route('storefront.services'));
});
