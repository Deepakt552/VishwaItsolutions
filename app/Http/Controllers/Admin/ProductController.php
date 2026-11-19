<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request, ProductCatalog $catalog): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', Rule::in(Product::STATUSES)],
            'category' => ['nullable', Rule::in(Product::CATEGORIES)],
        ]);

        $query = Product::query();
        $catalog->filter($query, $filters);

        return Inertia::render('admin/products/index', [
            'products' => ProductResource::collection($query->latest('updated_at')->latest('id')->paginate(15, ProductCatalog::CARD_COLUMNS)->appends($filters)),
            'categories' => Product::CATEGORIES,
            'filters' => $filters ?: (object) [],
        ]);
    }

    public function create(): Response
    {
        return $this->editor();
    }

    public function store(Request $request, ProductCatalog $catalog): RedirectResponse
    {
        $product = $catalog->save($catalog->validate($request));

        return to_route('admin.products.edit', $product)->with('success', 'Product created.');
    }

    public function edit(Product $product): Response
    {
        return $this->editor($product);
    }

    public function update(Request $request, Product $product, ProductCatalog $catalog): RedirectResponse
    {
        $catalog->save($catalog->validate($request), $product);

        return to_route('admin.products.edit', $product)->with('success', 'Product updated.');
    }

    public function destroy(Product $product, ProductCatalog $catalog): RedirectResponse
    {
        $catalog->delete($product);

        return to_route('admin.products.index')->with('success', 'Product deleted.');
    }

    private function editor(?Product $product = null): Response
    {
        return Inertia::render('admin/products/editor', [
            'product' => $product ? (new ProductResource($product))->resolve() : null,
            'categories' => Product::CATEGORIES,
            'conditions' => Product::CONDITIONS,
            'storageTypes' => Product::STORAGE_TYPES,
        ]);
    }
}
