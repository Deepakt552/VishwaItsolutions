<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/** @property list<string> $photos */
#[Fillable(['name', 'slug', 'category', 'condition', 'status', 'processor', 'ram_gb', 'storage_gb', 'storage_type', 'graphics', 'operating_system', 'age_months', 'price', 'description', 'features', 'photos', 'featured'])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    public const CATEGORIES = ['Laptops', 'Desktops', 'Workstations', 'Accessories'];

    public const CONDITIONS = ['Like new', 'Excellent', 'Good', 'Fair', 'For parts', 'Unspecified'];

    public const STATUSES = ['draft', 'available', 'sold'];

    public const STORAGE_TYPES = ['SSD', 'HDD', 'Hybrid', 'eMMC'];

    /** @var array<string, mixed> */
    protected $attributes = ['photos' => '[]', 'status' => 'draft', 'condition' => 'Unspecified', 'featured' => false];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'photos' => 'array',
            'price' => 'decimal:2',
            'featured' => 'boolean',
        ];
    }

    /** @param Builder<Product> $query */
    public function scopeAvailable(Builder $query): void
    {
        $query->where('status', 'available');
    }

    protected static function booted(): void
    {
        $clearCache = static function (): void {
            Cache::forget('storefront.home.products');
            Cache::forget('storefront.shop.ram_options');
            Cache::forget('storefront.shop.storage_options');
        };

        static::saved($clearCache);
        static::deleted($clearCache);
    }

    public static function makeSlug(string $name): string
    {
        return (Str::slug(Str::limit($name, 115, '')) ?: 'product').'-'.Str::lower(Str::random(8));
    }
}
