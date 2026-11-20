<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GalleryPhoto;
use App\Services\ContentMedia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class GalleryPhotoController extends Controller
{
    private const DETAILS_RULES = [
        'alt_text' => ['required', 'string', 'max:160'],
        'caption' => ['nullable', 'string', 'max:220'],
    ];

    public function index(): Response
    {
        return Inertia::render('admin/gallery', [
            'photos' => GalleryPhoto::query()->latest('id')->paginate(12)
                ->through(fn (GalleryPhoto $photo): array => $photo->galleryData()),
        ]);
    }

    public function store(Request $request, ContentMedia $media): RedirectResponse
    {
        $data = $request->validate([
            ...self::DETAILS_RULES,
            'image' => ['required', ...ContentMedia::IMAGE_FORMAT_RULES, 'max:1536', 'dimensions:max_width=2400,max_height=2400'],
        ]);

        $image = $data['image'];
        [$width, $height] = $image->dimensions();
        $filename = $media->store($image);

        try {
            GalleryPhoto::create([
                'filename' => $filename,
                'alt_text' => $data['alt_text'],
                'caption' => $data['caption'] ?? null,
                'width' => $width,
                'height' => $height,
            ]);
        } catch (Throwable $exception) {
            $media->delete([$filename]);

            throw $exception;
        }

        return to_route('admin.gallery.index')->with('success', 'Photo added to the workshop gallery.');
    }

    public function update(Request $request, GalleryPhoto $photo): RedirectResponse
    {
        $photo->update($request->validate(self::DETAILS_RULES));

        return back()->with('success', 'Photo details saved.');
    }

    public function destroy(GalleryPhoto $photo, ContentMedia $media): RedirectResponse
    {
        $photo->delete();
        $media->delete([$photo->filename]);

        return to_route('admin.gallery.index')->with('success', 'Photo removed from the workshop gallery.');
    }
}
