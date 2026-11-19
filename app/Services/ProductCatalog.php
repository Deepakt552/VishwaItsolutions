<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

class ProductCatalog
{
    public const CARD_COLUMNS = ['id', 'name', 'slug', 'category', 'condition', 'status', 'price', 'processor', 'ram_gb', 'storage_gb', 'storage_type', 'age_months', 'photos', 'featured'];

    public function __construct(private ContentMedia $media) {}

    /**
     * @return array<string, mixed>
     */
    public function validate(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'category' => ['required', Rule::in(Product::CATEGORIES)],
            'condition' => ['required', Rule::in(Product::CONDITIONS)],
            'status' => ['sometimes', 'required', Rule::in(Product::STATUSES)],
            'processor' => ['nullable', 'string', 'max:150'],
            'ram_gb' => ['nullable', 'integer', 'min:1', 'max:4096'],
            'storage_gb' => ['nullable', 'integer', 'min:1', 'max:1000000'],
            'storage_type' => ['nullable', Rule::in(Product::STORAGE_TYPES)],
            'graphics' => ['nullable', 'string', 'max:150'],
            'operating_system' => ['nullable', 'string', 'max:100'],
            'age_months' => ['nullable', 'integer', 'min:0', 'max:1200'],
            'price' => ['nullable', 'numeric', 'decimal:0,2', 'min:0', 'max:9999999999.99'],
            'description' => ['nullable', 'string', 'max:12000'],
            'features' => ['nullable', 'string', 'max:3500'],
            'featured' => ['sometimes', 'boolean'],
            'uploads' => ['sometimes', 'array', 'max:8'],
            'uploads.*' => ContentMedia::IMAGE_RULES,
            'remove_photos' => ['sometimes', 'array', 'max:8'],
            'remove_photos.*' => ['required', 'string', 'max:60'],
        ]);
    }

    /** @param array<string, mixed> $data */
    public function save(array $data, ?Product $product = null): Product
    {
        /** @var list<UploadedFile> $uploads */
        $uploads = $data['uploads'] ?? [];
        $new = [];
        try {
            foreach ($uploads as $file) {
                $new[] = $this->media->store($file);
            }

            [$product, $removed] = DB::transaction(function () use ($product, $data, $new): array {
                $current = $product
                    ? Product::query()->lockForUpdate()->findOrFail($product->id)
                    : new Product(['slug' => Product::makeSlug($data['name'])]);
                $existing = $current->photos;
                $removed = array_values(array_intersect($existing, $data['remove_photos'] ?? []));
                $kept = array_values(array_diff($existing, $removed));

                if (count($kept) + count($new) > 8) {
                    throw ValidationException::withMessages(['uploads' => 'A product can have up to eight photos.']);
                }

                $current->fill(Arr::except($data, ['uploads', 'remove_photos']));
                $current->photos = [...$kept, ...$new];
                $current->save();

                return [$current, $removed];
            });
        } catch (Throwable $exception) {
            $this->media->delete($new);

            throw $exception;
        }

        $this->media->delete($removed);

        return $product;
    }

    public function delete(Product $product): void
    {
        $photos = DB::transaction(function () use ($product): array {
            $current = Product::query()->lockForUpdate()->findOrFail($product->id);
            $current->delete();

            return $current->photos;
        });

        $this->media->delete($photos);
    }

    /**
     * @param  Builder<Product>  $query
     * @param  array<string, mixed>  $filters
     */
    public function filter(Builder $query, array $filters): void
    {
        foreach (['category', 'ram_gb', 'storage_gb', 'storage_type', 'status'] as $field) {
            if (filled($filters[$field] ?? null)) {
                $query->where($field, $filters[$field]);
            }
        }

        if (filled($filters['processor'] ?? null)) {
            $query->whereLike('processor', self::contains($filters['processor']));
        }

        $search = preg_replace('/(\d)\s+(gb|tb)\b/i', '$1$2', trim((string) ($filters['q'] ?? ''))) ?? '';
        foreach (array_slice(preg_split('/\s+/', $search, flags: PREG_SPLIT_NO_EMPTY) ?: [], 0, 8) as $word) {
            $specification = match (strtolower($word)) {
                'ram', 'memory' => 'ram_gb',
                'storage' => 'storage_gb',
                default => null,
            };

            if ($specification) {
                $query->whereNotNull($specification);

                continue;
            }

            $pattern = self::contains($word);
            $query->where(function (Builder $group) use ($pattern, $word): void {
                $group->whereLike('name', $pattern)
                    ->orWhereLike('category', $pattern)
                    ->orWhereLike('condition', $pattern)
                    ->orWhereLike('processor', $pattern)
                    ->orWhereLike('graphics', $pattern)
                    ->orWhereLike('storage_type', $pattern)
                    ->orWhereLike('operating_system', $pattern);

                if (preg_match('/^(\d{1,6})(gb|tb)?$/i', $word, $match)) {
                    $size = (int) $match[1] * (strtolower($match[2] ?? '') === 'tb' ? 1024 : 1);
                    $group->orWhere('ram_gb', $size)->orWhere('storage_gb', $size);
                    if (strtolower($match[2] ?? '') === 'tb') {
                        $group->orWhere('storage_gb', (int) $match[1] * 1000);
                    }
                }
            });
        }
    }

    private static function contains(string $value): string
    {
        return '%'.str_replace(['%', '_'], '', $value).'%';
    }
}
