<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\ContactMessage;
use App\Models\Post;
use App\Models\Product;
use App\Services\ContentMedia;
use App\Services\LiveReviews;
use App\Services\ProductCatalog;
use App\Services\Seo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    private const POST_CARDS = ['id', 'slug', 'title', 'excerpt', 'cover', 'cover_alt', 'published_at'];

    public function home(LiveReviews $reviews): Response
    {
        $products = Cache::rememberForever('storefront.home.products', fn (): array => ProductResource::collection(
            Product::available()->orderByDesc('featured')->latest('id')->limit(3)->get(ProductCatalog::CARD_COLUMNS)
        )->resolve());

        $posts = Cache::rememberForever('storefront.home.posts', fn (): array => Post::published()
            ->latest('published_at')
            ->latest('id')
            ->limit(3)
            ->get(self::POST_CARDS)
            ->map($this->articleCard(...))
            ->all());

        return Inertia::render('storefront/home', [
            'seo' => Seo::page('Laptop & PC Repair in Nalasopara East', 'Laptop repair, data recovery, office IT support and pre-owned computers in Nalasopara East, Vasai-Virar.', route('home'), schema: [
                '@type' => 'LocalBusiness',
                'name' => 'Vishwa IT Solutions',
                'url' => route('home'),
                'image' => url('/social-preview.jpg'),
                'telephone' => '+917666704188',
                'address' => [
                    '@type' => 'PostalAddress',
                    'streetAddress' => 'Room no. 2, Chauhan Chawl, Hans Vijay Nagar, Hawai Pada',
                    'addressLocality' => 'Nalasopara East, Vasai-Virar',
                    'addressRegion' => 'Maharashtra',
                    'postalCode' => '401209',
                    'addressCountry' => 'IN',
                ],
            ]),
            'products' => $products,
            'posts' => $posts,
            'reviewsEnabled' => $reviews->availability(),
        ]);
    }

    public function shop(Request $request, ProductCatalog $catalog): Response
    {
        $filters = validator($request->query(), [
            'q' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', Rule::in(Product::CATEGORIES)],
            'ram_gb' => ['nullable', 'integer', 'between:1,4096'],
            'storage_gb' => ['nullable', 'integer', 'between:1,1000000'],
            'storage_type' => ['nullable', Rule::in(Product::STORAGE_TYPES)],
            'processor' => ['nullable', 'string', 'max:100'],
        ]);
        abort_if($filters->fails(), 400, 'Invalid shop filters.');
        $filters = $filters->validated();
        $query = Product::available();
        $catalog->filter($query, $filters);

        return Inertia::render('storefront/shop', [
            'seo' => Seo::page('Pre-owned Computers & Accessories', 'Browse available laptops, desktops, workstations and accessories. Compare processor, RAM, storage and device condition.', route('storefront.shop', ['page' => $request->integer('page') > 1 ? $request->integer('page') : null]), noindex: count(array_filter($filters)) > 0),
            'products' => ProductResource::collection($query->orderByDesc('featured')->latest('id')->paginate(12, ProductCatalog::CARD_COLUMNS)->appends($filters)),
            'filters' => $filters ?: (object) [],
            'categories' => Product::CATEGORIES,
            'storageTypes' => Product::STORAGE_TYPES,
            'ramOptions' => fn () => Cache::rememberForever('storefront.shop.ram_options', fn () => Product::available()->whereNotNull('ram_gb')->distinct()->orderBy('ram_gb')->pluck('ram_gb')->all()),
            'storageOptions' => fn () => Cache::rememberForever('storefront.shop.storage_options', fn () => Product::available()->whereNotNull('storage_gb')->distinct()->orderBy('storage_gb')->pluck('storage_gb')->all()),
        ]);
    }

    public function product(Product $product): Response
    {
        abort_unless($product->status === 'available', 404);

        $url = route('storefront.product', $product->slug);
        $images = array_map(fn (string $name): string => ContentMedia::url($name, absolute: true), $product->photos);
        $schema = [
            '@type' => 'Product',
            'name' => $product->name,
            'description' => $product->description ?: $product->name.' · '.$product->condition,
            'category' => $product->category,
            'sku' => (string) $product->id,
        ];

        if ($images) {
            $schema['image'] = $images;
        }

        if ($product->price !== null) {
            $schema['offers'] = [
                '@type' => 'Offer',
                'price' => $product->price,
                'priceCurrency' => 'INR',
                'availability' => 'https://schema.org/InStock',
                'itemCondition' => 'https://schema.org/UsedCondition',
                'url' => $url,
            ];
        }

        return Inertia::render('storefront/product', [
            'seo' => Seo::page($product->name, Str::limit($schema['description'], 165), $url, $images[0] ?? null, 'product', [
                '@graph' => [$schema, Seo::breadcrumbs([
                    ['name' => 'Home', 'url' => route('home')],
                    ['name' => 'Shop', 'url' => route('storefront.shop')],
                    ['name' => $product->name, 'url' => $url],
                ])],
            ], imageAlt: $images ? $product->name : null),
            'product' => (new ProductResource($product))->resolve(),
            'related' => ProductResource::collection(Product::available()->where('category', $product->category)->whereKeyNot($product->id)->latest('id')->limit(3)->get(ProductCatalog::CARD_COLUMNS))->resolve(),
        ]);
    }

    public function blog(Request $request): Response
    {
        return Inertia::render('storefront/blog', [
            'seo' => Seo::page('IT Advice, Buying Guides & Repair Tips', 'Read practical advice on computer repairs, upgrades, maintenance and buying pre-owned devices from Vishwa IT Solutions.', route('storefront.blog', ['page' => $request->integer('page') > 1 ? $request->integer('page') : null])),
            'posts' => Post::published()->latest('published_at')->latest('id')->paginate(9, self::POST_CARDS)->through($this->articleCard(...)),
        ]);
    }

    public function article(Post $post): Response
    {
        abort_unless($post->isPublished(), 404);

        $url = route('storefront.article', $post->slug);
        $image = $post->cover ? ContentMedia::url($post->cover) : null;
        $html = Str::markdown($post->body, [
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
            'max_nesting_level' => 15,
        ]);

        return Inertia::render('storefront/article', [
            'seo' => Seo::page($post->seo_title ?: $post->title, $post->seo_description ?: Str::limit($post->excerpt, 165), $url, $image, 'article', [
                '@graph' => [[
                    '@type' => 'BlogPosting',
                    'headline' => $post->title,
                    'description' => $post->excerpt,
                    'datePublished' => $post->published_at?->toIso8601String(),
                    'dateModified' => $post->updated_at?->toIso8601String(),
                    'image' => url($image ?? '/social-preview.jpg'),
                    'mainEntityOfPage' => $url,
                    'author' => ['@type' => 'Organization', 'name' => 'Vishwa IT Solutions', 'url' => route('home')],
                ], Seo::breadcrumbs([
                    ['name' => 'Home', 'url' => route('home')],
                    ['name' => 'Blog', 'url' => route('storefront.blog')],
                    ['name' => $post->title, 'url' => $url],
                ])],
            ], imageAlt: $image ? ($post->cover_alt ?: $post->title) : null),
            'post' => [...$this->articleCard($post), 'html' => $html],
            'related' => Post::published()->whereKeyNot($post->id)->latest('published_at')->latest('id')->limit(3)->get(self::POST_CARDS)->map($this->articleCard(...)),
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('storefront/contact', [
            'seo' => Seo::page('Contact and Visit Us', 'Contact Vishwa IT Solutions for computer repairs, maintenance, and pre-owned stock in Nalasopara East.', route('storefront.contact'), schema: [
                '@type' => 'ContactPage',
                'url' => route('storefront.contact'),
                'mainEntity' => ['@type' => 'LocalBusiness', 'name' => 'Vishwa IT Solutions', 'telephone' => '+917666704188'],
            ]),
        ]);
    }

    public function services(): Response
    {
        $copy = match (app()->getLocale()) {
            'mr' => ['संगणक दुरुस्ती आणि आयटी सेवा', 'नालासोपारा पूर्व येथे लॅपटॉप दुरुस्ती, नेटवर्क सेटअप, डेटा रिकव्हरी आणि ऑफिस आयटी सेवा.'],
            'gu' => ['કમ્પ્યુટર રિપેર અને આઇટી સેવાઓ', 'નાલાસોપારા પૂર્વમાં લેપટોપ રિપેર, નેટવર્ક સેટઅપ, ડેટા રિકવરી અને ઓફિસ આઇટી સેવાઓ.'],
            default => ['Computer Repair and IT Services', 'Laptop repair, network setup, data recovery and office IT support in Nalasopara East.'],
        };

        return Inertia::render('storefront/services', [
            'seo' => Seo::page($copy[0], $copy[1], route('storefront.services'), schema: [
                '@type' => 'Service',
                'name' => $copy[0],
                'description' => $copy[1],
                'provider' => ['@type' => 'LocalBusiness', 'name' => 'Vishwa IT Solutions', 'url' => route('home')],
                'areaServed' => 'Nalasopara East',
            ]),
        ]);
    }

    public function reviewSources(): Response
    {
        return Inertia::render('storefront/review-sources', [
            'seo' => Seo::page('Review Sources and Privacy', 'How Vishwa IT Solutions displays reviews from Google Maps and Justdial.', route('storefront.review-sources')),
        ]);
    }

    public function liveReviews(LiveReviews $reviews): JsonResponse
    {
        return response()->json($reviews->fetch(), headers: ['Cache-Control' => 'private, no-store']);
    }

    public function sendMessage(Request $request): RedirectResponse
    {
        $message = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'subject' => ['required', 'string', 'max:160'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ]);

        ContactMessage::create($message);

        return to_route('storefront.contact')->with('success', 'Your message was sent. We’ll get back to you.');
    }

    public function sitemap(): HttpResponse
    {
        $urls = [
            ['loc' => route('home'), 'updated' => null],
            ['loc' => route('storefront.services'), 'updated' => null],
            ['loc' => route('storefront.shop'), 'updated' => null],
            ['loc' => route('storefront.blog'), 'updated' => null],
            ['loc' => route('storefront.contact'), 'updated' => null],
            ['loc' => route('storefront.review-sources'), 'updated' => null],
        ];

        foreach (Product::available()->select(['id', 'slug', 'updated_at'])->lazyById() as $product) {
            $urls[] = ['loc' => route('storefront.product', $product->slug), 'updated' => $product->updated_at?->toDateString()];
        }

        foreach (Post::published()->select(['id', 'slug', 'updated_at'])->lazyById() as $post) {
            $urls[] = ['loc' => route('storefront.article', $post->slug), 'updated' => $post->updated_at?->toDateString()];
        }

        return response()->view('sitemap', ['urls' => $urls], headers: ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    /** @return array<string, mixed> */
    private function articleCard(Post $post): array
    {
        return [
            'id' => $post->id,
            'slug' => $post->slug,
            'title' => $post->title,
            'excerpt' => $post->excerpt,
            'image' => $post->cover ? ContentMedia::url($post->cover) : null,
            'cover_alt' => $post->cover_alt,
            'published_at' => $post->published_at?->toDateString(),
        ];
    }
}
