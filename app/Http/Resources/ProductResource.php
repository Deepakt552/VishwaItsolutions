<?php

namespace App\Http\Resources;

use App\Models\Product;
use App\Services\ContentMedia;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Product */
class ProductResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            ...$this->resource->attributesToArray(),
            'photos' => array_map(
                fn (string $name): array => ['name' => $name, 'url' => ContentMedia::url($name)],
                $this->photos,
            ),
        ];
    }
}
