<?php

namespace Database\Factories;

use App\Models\GalleryPhoto;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<GalleryPhoto> */
class GalleryPhotoFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'filename' => Str::uuid().'.jpg',
            'alt_text' => 'Laptop motherboard on a repair bench',
            'caption' => null,
            'width' => 1200,
            'height' => 800,
        ];
    }
}
