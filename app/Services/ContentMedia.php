<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class ContentMedia
{
    public const IMAGE_FORMAT_RULES = ['file', 'image', 'mimes:jpg,jpeg,png,webp'];

    public const IMAGE_RULES = [...self::IMAGE_FORMAT_RULES, 'max:4096', 'dimensions:max_width=9000,max_height=9000'];

    public function store(UploadedFile $file): string
    {
        $name = Str::uuid().'.'.$file->extension();
        $path = $file->storeAs('storefront-media', $name, 'local');

        if ($path === false) {
            throw new RuntimeException('The image could not be stored.');
        }

        return $name;
    }

    /** @param list<string> $names */
    public function delete(array $names): void
    {
        Storage::disk('local')->delete(array_map(fn (string $name): string => 'storefront-media/'.$name, $names));
    }

    public static function url(string $name, bool $absolute = false): string
    {
        return route('storefront.media', ['file' => $name], $absolute);
    }
}
