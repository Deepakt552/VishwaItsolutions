<?php

use App\Jobs\GenerateDraft;
use App\Models\ContactMessage;
use App\Models\Generation;
use App\Models\Post;
use App\Models\Product;
use App\Models\User;
use App\Services\OpenAiDrafts;
use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('only verified administrators can manage store data', function () {
    $path = route('admin.products.index');
    $this->get($path)->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())->get($path)->assertForbidden();
    $this->actingAs(User::factory()->admin()->unverified()->create())->get($path)->assertRedirect(route('verification.notice'));
    $this->actingAs(User::factory()->admin()->create())->get($path)->assertOk();
});

test('the product lifecycle updates storefront stock and uploaded photos', function () {
    Storage::fake('local');
    $admin = User::factory()->admin()->create();
    $data = [
        'name' => 'ThinkPad T14',
        'category' => 'Laptops',
        'condition' => 'Good',
        'status' => 'available',
        'ram_gb' => 16,
        'storage_gb' => 512,
        'processor' => 'Intel Core i5',
        'age_months' => 24,
        'price' => '25000.00',
        'featured' => true,
        'uploads' => [UploadedFile::fake()->image('device.png')],
    ];

    $this->actingAs($admin)->post(route('admin.products.store'), $data)->assertSessionHasNoErrors()->assertRedirect();
    $product = Product::query()->where('name', 'ThinkPad T14')->sole();
    $photo = $product->photos[0];
    Storage::disk('local')->assertExists('storefront-media/'.$photo);

    $this->get(route('storefront.media', $photo))->assertOk();
    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page->where('products.0.name', 'ThinkPad T14'));
    $this->get(route('storefront.product', $product->slug))->assertInertia(fn (Assert $page) => $page->where('product.age_months', 24));

    $data['status'] = 'sold';
    $data['remove_photos'] = [$photo];
    unset($data['uploads']);
    $this->post(route('admin.products.update', $product), [...$data, '_method' => 'PUT'])->assertRedirect()->assertSessionHasNoErrors();
    $this->get(route('storefront.product', $product->slug))->assertNotFound();
    Storage::disk('local')->assertMissing('storefront-media/'.$photo);

    $this->delete(route('admin.products.destroy', $product))->assertRedirect(route('admin.products.index'));
    $this->assertModelMissing($product);
});

test('shop search combines category and specs and excludes drafts', function () {
    $match = Product::factory()->available()->create();
    Product::factory()->available()->create(['ram_gb' => 8]);
    Product::factory()->available()->create(['category' => 'Desktops']);
    Product::factory()->create();

    $this->get(route('storefront.shop', [
        'category' => 'Laptops',
        'ram_gb' => 16,
        'storage_gb' => 512,
        'processor' => 'i5',
        'q' => '16 GB RAM 512GB SSD',
    ]))->assertInertia(fn (Assert $page) => $page
        ->component('storefront/shop')
        ->has('products.data', 1)
        ->where('products.data.0.id', $match->id)
        ->where('seo.robots', 'noindex,follow'));
});

test('articles publish with sanitized Markdown and server-rendered SEO', function () {
    $this->actingAs(User::factory()->admin()->create());
    $data = [
        'title' => 'Learn about upgrades',
        'slug' => 'learn-about-upgrades',
        'excerpt' => 'How to choose a useful upgrade.',
        'body' => "## Start here\n\n<script>alert('bad')</script>\n\n[Unsafe](javascript:alert%281%29)",
        'seo_title' => 'Choosing a computer upgrade',
        'seo_description' => 'Compare useful upgrades for your computer.',
        'publish' => false,
    ];

    $this->post(route('admin.posts.store'), $data)->assertSessionHasNoErrors()->assertRedirect();
    $post = Post::query()->where('slug', 'learn-about-upgrades')->sole();
    $url = route('storefront.article', $post->slug);

    $this->get($url)->assertNotFound();
    $this->get(route('storefront.sitemap'))->assertDontSee($url);

    $this->put(route('admin.posts.update', $post), [...$data, 'publish' => true])->assertSessionHasNoErrors()->assertRedirect();
    $this->get($url)
        ->assertSee('Choosing a computer upgrade')
        ->assertSee('application/ld+json', false)
        ->assertInertia(fn (Assert $page) => $page->where('post.html', fn (string $html): bool => str_contains($html, '<h2>Start here</h2>') && ! str_contains($html, '<script>') && ! str_contains($html, 'javascript:')));
    $this->get(route('storefront.sitemap'))->assertSee($url);

    $this->delete(route('admin.posts.destroy', $post))->assertRedirect(route('admin.posts.index'));
    $this->get($url)->assertNotFound();
});

test('contact submissions can be read and removed by the administrator', function () {
    $message = ContactMessage::factory()->make();
    $this->post(route('storefront.contact.send'), $message->getAttributes())->assertRedirect(route('storefront.contact'));
    $message = ContactMessage::query()->sole();

    $this->actingAs(User::factory()->admin()->create());
    $this->get(route('admin.inbox.show', $message))->assertInertia(fn (Assert $page) => $page->where('message.email', $message->email));
    $this->patch(route('admin.inbox.update', $message))->assertRedirect();
    expect($message->fresh()->read_at)->not->toBeNull();

    $this->delete(route('admin.inbox.destroy', $message))->assertRedirect(route('admin.inbox.index'));
    $this->assertModelMissing($message);
});

test('the product API enforces its switch and invalidates rotated tokens', function () {
    $this->actingAs(User::factory()->admin()->create());
    $url = route('api.v1.products.store');
    $body = ['name' => 'Imported computer', 'category' => 'Desktops', 'condition' => 'Good', 'price' => 12900, 'slug' => 'untrusted-slug'];

    $this->postJson($url, $body)->assertServiceUnavailable();
    $this->patch(route('admin.integrations.update'), ['enabled' => true])->assertRedirect();
    $this->postJson($url, $body)->assertUnauthorized();

    $this->post(route('admin.integrations.rotate'))->assertRedirect()->assertInertiaFlash('apiToken');
    $token = $this->get(route('admin.integrations.index'))->assertOk()->viewData('page')['flash']['apiToken'];
    expect($token)->toStartWith('vis_');
    $this->get(route('admin.integrations.index'))->assertOk()->assertInertiaFlashMissing('apiToken');

    $this->postJson($url, ['name' => 'Missing data'], ['Authorization' => 'Bearer '.$token])->assertUnprocessable();
    $this->postJson($url, $body, ['Authorization' => 'Bearer '.$token])
        ->assertCreated()->assertJsonPath('data.status', 'draft');
    $this->assertDatabaseHas('products', ['name' => 'Imported computer', 'status' => 'draft']);
    $this->assertDatabaseMissing('products', ['slug' => 'untrusted-slug']);

    $this->post(route('admin.integrations.rotate'))->assertRedirect();
    $this->postJson($url, $body, ['Authorization' => 'Bearer '.$token])->assertUnauthorized();

    $this->patch(route('admin.integrations.update'), ['enabled' => false])->assertRedirect();
    $this->postJson($url, $body, ['Authorization' => 'Bearer '.$token])->assertServiceUnavailable();
});

test('AI generation sends the source and saves an unpublished article', function () {
    Storage::fake('local');
    config(['services.openai.key' => 'test-key', 'queue.default' => 'sync']);
    Http::preventStrayRequests();
    Http::fake(['api.openai.com/v1/responses' => Http::response([
        'status' => 'completed',
        'output' => [['content' => [['type' => 'output_text', 'text' => json_encode([
            'title' => 'SSD upgrade guide',
            'excerpt' => 'How to choose a drive.',
            'body' => "## Choose the right connector\n\nCheck the device manual.",
            'seo_title' => 'SSD upgrade guide',
            'seo_description' => 'Check compatibility before replacing a drive.',
        ])]]]],
    ])]);

    $this->actingAs(User::factory()->admin()->create())->post(route('admin.automation.store'), [
        'kind' => 'post',
        'topic' => 'Choosing an SSD',
        'reference' => UploadedFile::fake()->createWithContent('source.txt', 'Confirm the connector in the manufacturer manual.'),
    ])->assertSessionHasNoErrors()->assertRedirect();

    $post = Post::query()->sole();
    expect($post->published_at)->toBeNull();
    expect($post->seo_description)->toBe('Check compatibility before replacing a drive.');
    expect(Generation::query()->sole()->status)->toBe('complete');
    expect(Storage::disk('local')->allFiles('draft-references'))->toBe([]);

    Http::assertSent(fn (Request $request): bool => $request->hasHeader('Authorization', 'Bearer test-key')
        && $request['store'] === false
        && str_contains($request['input'][0]['content'][1]['text'], 'manufacturer manual'));

    (new GenerateDraft(Generation::query()->sole()->id))->handle(app(OpenAiDrafts::class));
    $this->assertDatabaseCount('posts', 1);
});

test('AI provider failures are recorded without publishing a product', function () {
    config(['services.openai.key' => 'test-key', 'queue.default' => 'sync']);
    Http::preventStrayRequests();
    Http::fake(['api.openai.com/v1/responses' => Http::response(status: 429)]);

    $this->actingAs(User::factory()->admin()->create())->post(route('admin.automation.store'), [
        'kind' => 'product',
        'topic' => 'ThinkPad T14 16 GB RAM',
    ])->assertSessionHasErrors('topic');

    $this->assertDatabaseHas('generations', ['status' => 'failed']);
    $this->assertDatabaseCount('products', 0);
});
