<?php

namespace App\Services;

class Seo
{
    /**
     * @param  array<string, mixed>|null  $schema
     * @return array<string, mixed>
     */
    public static function page(string $title, string $description, string $canonical, ?string $image = null, string $type = 'website', ?array $schema = null, bool $noindex = false, ?string $imageAlt = null): array
    {
        return [
            'title' => $title,
            'description' => $description,
            'canonical' => $canonical,
            'image' => url($image ?? '/social-preview.jpg'),
            'imageAlt' => $imageAlt ?? 'Vishwa IT Solutions computer repair and support',
            'type' => $type,
            'robots' => $noindex ? 'noindex,follow' : 'index,follow',
            'structured' => $schema === null ? null : json_encode(
                ['@context' => 'https://schema.org', ...$schema],
                JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES,
            ),
        ];
    }

    /**
     * @param  list<array{name: string, url: string}>  $pages
     * @return array<string, mixed>
     */
    public static function breadcrumbs(array $pages): array
    {
        $items = [];

        foreach ($pages as $position => $page) {
            $items[] = [
                '@type' => 'ListItem',
                'position' => $position + 1,
                'name' => $page['name'],
                'item' => $page['url'],
            ];
        }

        return ['@type' => 'BreadcrumbList', 'itemListElement' => $items];
    }
}
