<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\PostFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/** @property CarbonImmutable|null $published_at */
#[Fillable(['title', 'slug', 'excerpt', 'body', 'cover', 'cover_alt', 'seo_title', 'seo_description', 'published_at'])]
class Post extends Model
{
    /** @use HasFactory<PostFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }

    /** @param Builder<Post> $query */
    public function scopePublished(Builder $query): void
    {
        $query->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    public function isPublished(): bool
    {
        return $this->published_at !== null && $this->published_at->lte(now());
    }

    protected static function booted(): void
    {
        $clearCache = static function (): void {
            Cache::forget('storefront.home.posts');
        };

        static::saved($clearCache);
        static::deleted($clearCache);
    }

    public static function makeSlug(string $title): string
    {
        return (Str::slug(Str::limit($title, 115, '')) ?: 'article').'-'.Str::lower(Str::random(8));
    }
}
