<?php

test('robots.txt declares Content-Signal directive', function () {
    $this->get('/robots.txt')
        ->assertOk()
        ->assertSee('Content-Signal: search=yes, ai-input=yes, ai-train=no', false)
        ->assertSee('Sitemap:', false);
});

test('sitemap.xml includes lastmod dates for every URL', function () {
    $response = $this->get('/sitemap.xml')->assertOk();
    $xml = simplexml_load_string((string) $response->getContent());

    expect($xml)->not->toBeFalse();
    expect(count($xml->url))->toBeGreaterThanOrEqual(8);

    foreach ($xml->url as $entry) {
        expect((string) $entry->lastmod)->toMatch('/^\d{4}-\d{2}-\d{2}$/');
    }
});

test('homepage initial HTML includes h1, about/contact/terms links, sameAs and multi-type structured data', function () {
    $response = $this->get(route('home'))->assertOk();
    $html = (string) $response->getContent();

    expect($html)
        ->toContain('<h1>')
        ->toContain(route('storefront.about'))
        ->toContain(route('storefront.contact'))
        ->toContain(route('storefront.terms'))
        ->toContain('"sameAs"')
        ->toContain('"LocalBusiness"')
        ->toContain('"ComputerStore"')
        ->toContain('"@type":"WebSite"')
        ->toContain('"@type":"Service"')
        ->toContain('"@type":"FAQPage"')
        ->toContain('geo.region');
});

test('about and terms pages return HTTP 200', function () {
    $this->get(route('storefront.about'))->assertOk();
    $this->get(route('storefront.terms'))->assertOk();
});

test('llms.txt and llms-full.txt are served with Mumbai/Palghar SEO summary and key links', function () {
    $this->get('/llms.txt')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSee('# Vishwa IT Solutions', false)
        ->assertSee('Mumbai Western Line', false)
        ->assertSee('Mumbai Central Line', false)
        ->assertSee('Palghar', false)
        ->assertSee(route('storefront.services'), false)
        ->assertSee('/.well-known/mcp/server-card.json', false);

    $this->get('/llms-full.txt')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSee('Chip-Level Motherboard Repairing', false)
        ->assertSee('MacBook Repair', false)
        ->assertSee('All-in-One (AIO) Systems', false);
});

test('homepage serves text/markdown when an agent sends Accept: text/markdown', function () {
    $this->get(route('home'), ['Accept' => 'text/markdown'])
        ->assertOk()
        ->assertHeader('Content-Type', 'text/markdown; charset=UTF-8')
        ->assertSee('# Vishwa IT Solutions', false)
        ->assertSee('₹350', false);
});

test('MCP server card is published at /.well-known/mcp/server-card.json and /api/mcp responds to JSON-RPC', function () {
    $this->getJson('/.well-known/mcp/server-card.json')
        ->assertOk()
        ->assertJsonPath('name', 'vishwa-it-solutions')
        ->assertJsonPath('version', '1.0.0')
        ->assertJsonPath('endpoint', url('/api/mcp'))
        ->assertJsonStructure(['name', 'version', 'endpoint', 'capabilities', 'tools']);

    $this->postJson('/api/mcp', [
        'jsonrpc' => '2.0',
        'id' => 1,
        'method' => 'tools/list',
    ])->assertOk()
        ->assertJsonPath('jsonrpc', '2.0')
        ->assertJsonPath('id', 1)
        ->assertJsonPath('result.tools.0.name', 'get_business_info');
});
