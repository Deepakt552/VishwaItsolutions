<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Services\ProductCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function store(Request $request, ProductCatalog $catalog): JsonResponse
    {
        $data = $catalog->validate($request);
        $product = $catalog->save($data);

        return (new ProductResource($product))->response()->setStatusCode(201);
    }
}
