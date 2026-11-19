<?php

namespace App\Jobs;

use App\Models\Generation;
use App\Models\Post;
use App\Models\Product;
use App\Services\OpenAiDrafts;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class GenerateDraft implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 75;

    public function __construct(public int $generationId) {}

    public function handle(OpenAiDrafts $drafts): void
    {
        $claimed = Generation::query()->whereKey($this->generationId)->where('status', 'queued')->update(['status' => 'running']);
        if ($claimed !== 1) {
            return;
        }

        $generation = Generation::query()->findOrFail($this->generationId);
        $result = $drafts->generate($generation);

        DB::transaction(function () use ($generation, $result): void {
            if ($generation->kind === 'post') {
                $title = $this->text($result, 'title', 150) ?: $generation->topic;
                $excerpt = $this->text($result, 'excerpt', 300);
                $body = $this->text($result, 'body', 50000);

                if (! $excerpt || ! $body) {
                    throw new RuntimeException('The generated article was incomplete.');
                }

                $post = Post::create([
                    'title' => Str::limit($title, 150, ''),
                    'slug' => Post::makeSlug($title),
                    'excerpt' => $excerpt,
                    'body' => $body,
                    'seo_title' => $this->text($result, 'seo_title', 70),
                    'seo_description' => $this->text($result, 'seo_description', 170),
                ]);
                $generation->post_id = $post->id;
            } else {
                $name = $this->text($result, 'name', 150) ?: Str::limit($generation->topic, 150, '');
                $product = Product::create([
                    'name' => $name,
                    'slug' => Product::makeSlug($name),
                    'category' => $this->choice($result['category'] ?? null, Product::CATEGORIES) ?? 'Laptops',
                    'condition' => $this->choice($result['condition'] ?? null, Product::CONDITIONS) ?? 'Unspecified',
                    'processor' => $this->text($result, 'processor', 150),
                    'ram_gb' => $this->integer($result['ram_gb'] ?? null, 1, 4096),
                    'storage_gb' => $this->integer($result['storage_gb'] ?? null, 1, 1000000),
                    'storage_type' => $this->choice($result['storage_type'] ?? null, Product::STORAGE_TYPES),
                    'graphics' => $this->text($result, 'graphics', 150),
                    'operating_system' => $this->text($result, 'operating_system', 100),
                    'age_months' => $this->integer($result['age_months'] ?? null, 0, 1200),
                    'price' => $this->price($result['price'] ?? null),
                    'description' => $this->text($result, 'description', 12000),
                    'features' => $this->text($result, 'features', 3500),
                ]);
                $generation->product_id = $product->id;
            }

            $generation->status = 'complete';
            $generation->save();
        });

        $this->clearReference($generation);
    }

    public function failed(?Throwable $exception): void
    {
        $generation = Generation::query()->find($this->generationId);
        if (! $generation || $generation->status === 'complete') {
            return;
        }

        Log::warning('Draft generation failed.', ['generation_id' => $generation->id, 'type' => get_debug_type($exception)]);
        $generation->update(['status' => 'failed', 'error' => 'The draft couldn’t be generated. Check the AI configuration or reference and try again.']);
        $this->clearReference($generation);
    }

    private function clearReference(Generation $generation): void
    {
        if ($generation->reference_path && Storage::disk('local')->delete($generation->reference_path)) {
            $generation->update(['reference_path' => null, 'reference_mime' => null]);
        }
    }

    /** @param array<string, mixed> $result */
    private function text(array $result, string $key, int $limit): ?string
    {
        $value = $result[$key] ?? null;

        return is_string($value) && trim($value) !== '' ? Str::limit(trim($value), $limit, '') : null;
    }

    private function integer(mixed $value, int $min, int $max): ?int
    {
        return is_int($value) && $value >= $min && $value <= $max ? $value : null;
    }

    /** @param list<string> $options */
    private function choice(mixed $value, array $options): ?string
    {
        return is_string($value) && in_array($value, $options, true) ? $value : null;
    }

    private function price(mixed $value): ?float
    {
        return (is_float($value) || is_int($value)) && $value >= 0 && $value <= 9999999999.99 ? round($value, 2) : null;
    }
}
