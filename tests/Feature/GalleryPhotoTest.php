<?php

use App\Models\GalleryPhoto;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('gallery administration is restricted to verified store managers', function () {
    $index = route('admin.gallery.index');
    $upload = route('admin.gallery.store');

    $this->get($index)->assertRedirect(route('login'));
    $this->post($upload)->assertRedirect(route('login'));
    $this->actingAs(User::factory()->admin()->unverified()->create())
        ->post($upload)->assertRedirect(route('verification.notice'));
    $this->actingAs(User::factory()->create())->get($index)->assertForbidden();
    $this->post($upload)->assertForbidden();
    $this->assertDatabaseCount('gallery_photos', 0);
});

test('gallery uploads require alt text and a supported image within the size limits', function () {
    Storage::fake('local');
    $this->actingAs(User::factory()->admin()->create());

    $this->post(route('admin.gallery.store'), [
        'image' => UploadedFile::fake()->create('notes.txt', 1, 'text/plain'),
        'alt_text' => '   ',
    ])->assertSessionHasErrors(['image', 'alt_text']);

    $this->post(route('admin.gallery.store'), [
        'image' => UploadedFile::fake()->image('too-wide.jpg', 2401, 800),
        'alt_text' => 'A repair technician at work',
    ])->assertSessionHasErrors('image');

    $this->post(route('admin.gallery.store'), [
        'image' => UploadedFile::fake()->image('too-heavy.jpg')->size(1537),
        'alt_text' => 'A repair technician at work',
    ])->assertSessionHasErrors('image');

    $this->assertDatabaseCount('gallery_photos', 0);
    expect(Storage::disk('local')->allFiles())->toBe([]);
});

test('gallery photo uploads and edits appear on the homepage and in the image sitemap', function () {
    Storage::fake('local');
    $this->actingAs(User::factory()->admin()->create());
    $index = route('admin.gallery.index');
    $altText = 'Laptop motherboard on a repair bench';

    $this->post(route('admin.gallery.store'), [
        'image' => UploadedFile::fake()->image('motherboard.jpg', 1000, 600),
        'alt_text' => $altText,
        'caption' => 'Checking a charging fault.',
    ])->assertRedirect($index)->assertSessionHasNoErrors();

    $photo = GalleryPhoto::query()->sole();
    $this->get($index)->assertInertia(fn (Assert $page) => $page
        ->component('admin/gallery')
        ->where('photos.data.0.alt_text', $altText));
    $this->get(route('storefront.media', $photo->filename))->assertOk();
    $this->get(route('home'))->assertOk()
        ->assertSee('alt="'.$altText.'"', false)
        ->assertInertia(fn (Assert $page) => $page
            ->where('galleryPhotos.0.alt_text', $altText)
            ->where('galleryPhotos.0.width', 1000)
            ->where('galleryPhotos.0.height', 600)
            ->where('galleryPhotos.0.caption', 'Checking a charging fault.'));
    $this->get(route('storefront.sitemap'))->assertSee(
        '<image:loc>'.route('storefront.media', $photo->filename).'</image:loc>',
        false,
    );

    $this->from($index)->patch(route('admin.gallery.update', $photo), [
        'alt_text' => 'Technician examining a laptop charging circuit',
        'caption' => '',
    ])->assertRedirect($index)->assertSessionHasNoErrors();

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->where('galleryPhotos.0.alt_text', 'Technician examining a laptop charging circuit')
        ->where('galleryPhotos.0.caption', null));
});

test('removing a gallery photo removes its file and public references', function () {
    Storage::fake('local');
    $photo = GalleryPhoto::factory()->create();
    $path = 'storefront-media/'.$photo->filename;
    Storage::disk('local')->put($path, 'photo content');

    $this->actingAs(User::factory()->admin()->create())
        ->delete(route('admin.gallery.destroy', $photo))
        ->assertRedirect(route('admin.gallery.index'));

    $this->assertModelMissing($photo);
    Storage::disk('local')->assertMissing($path);
    $this->get(route('home'))->assertDontSee('Workshop gallery')
        ->assertInertia(fn (Assert $page) => $page->has('galleryPhotos', 0));
    $this->get(route('storefront.sitemap'))->assertDontSee($photo->filename);
});

test('the homepage and image sitemap feature the nine newest gallery photos', function () {
    $oldest = GalleryPhoto::factory()->create();
    $photos = GalleryPhoto::factory()->count(9)->create();

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->has('galleryPhotos', 9)
        ->where('galleryPhotos.0.id', $photos->last()->id));
    $this->get(route('storefront.sitemap'))
        ->assertSee($photos->last()->filename)
        ->assertDontSee($oldest->filename);
});
