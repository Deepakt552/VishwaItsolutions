<?php

namespace App\Models;

use App\Services\ContentMedia;
use Database\Factories\GalleryPhotoFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['filename', 'alt_text', 'caption', 'width', 'height'])]
class GalleryPhoto extends Model
{
    /** @use HasFactory<GalleryPhotoFactory> */
    use HasFactory;

    /** @param Builder<GalleryPhoto> $query */
    protected function scopeForHomepage(Builder $query): void
    {
        $query->latest('id')->limit(9);
    }

    /** @return array{id: int, url: string, alt_text: string, caption: string|null, width: int, height: int} */
    public function galleryData(): array
    {
        return [
            'id' => $this->id,
            'url' => ContentMedia::url($this->filename),
            'alt_text' => $this->alt_text,
            'caption' => $this->caption,
            'width' => $this->width,
            'height' => $this->height,
        ];
    }
}
