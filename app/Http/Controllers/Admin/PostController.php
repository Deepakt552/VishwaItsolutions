<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Services\ContentMedia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PostController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', Rule::in(['draft', 'published'])],
        ]);
        $query = Post::query();

        if (filled($filters['q'] ?? null)) {
            $query->whereLike('title', '%'.str_replace(['%', '_'], '', $filters['q']).'%');
        }

        match ($filters['status'] ?? null) {
            'draft' => $query->whereNull('published_at'),
            'published' => $query->published(),
            default => null,
        };

        return Inertia::render('admin/posts/index', [
            'posts' => $query->latest('updated_at')->latest('id')->paginate(15, ['id', 'title', 'slug', 'excerpt', 'published_at', 'updated_at'])->appends($filters),
            'filters' => $filters ?: (object) [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/posts/editor', ['post' => null]);
    }

    public function store(Request $request, ContentMedia $media): RedirectResponse
    {
        $post = $this->save($request, $media);

        return to_route('admin.posts.edit', $post)->with('success', 'Article created.');
    }

    public function edit(Post $post): Response
    {
        return Inertia::render('admin/posts/editor', [
            'post' => [...$post->attributesToArray(), 'cover_url' => $post->cover ? ContentMedia::url($post->cover) : null],
        ]);
    }

    public function update(Request $request, Post $post, ContentMedia $media): RedirectResponse
    {
        $this->save($request, $media, $post);

        return to_route('admin.posts.edit', $post)->with('success', 'Article updated.');
    }

    public function destroy(Post $post, ContentMedia $media): RedirectResponse
    {
        $cover = $post->cover;
        $post->delete();

        if ($cover) {
            $media->delete([$cover]);
        }

        return to_route('admin.posts.index')->with('success', 'Article deleted.');
    }

    private function save(Request $request, ContentMedia $media, ?Post $post = null): Post
    {
        $unique = Rule::unique('posts', 'slug');
        if ($post) {
            $unique->ignore($post);
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'slug' => ['nullable', 'max:180', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/D', $unique],
            'excerpt' => ['required', 'string', 'max:300'],
            'body' => ['required', 'string', 'max:50000'],
            'cover_file' => ['nullable', ...ContentMedia::IMAGE_RULES],
            'remove_cover' => ['sometimes', 'boolean'],
            'cover_alt' => ['nullable', 'string', 'max:160'],
            'seo_title' => ['nullable', 'string', 'max:70'],
            'seo_description' => ['nullable', 'string', 'max:170'],
            'publish' => ['required', 'boolean'],
        ]);

        $previous = $post?->cover;
        $new = $request->file('cover_file');
        $cover = $new ? $media->store($new) : null;
        $post ??= new Post;

        try {
            $post->fill([
                ...Arr::except($data, ['cover_file', 'remove_cover', 'publish', 'slug']),
                'slug' => $data['slug'] ?? $post->slug ?? Post::makeSlug($data['title']),
                'cover' => $cover ?? (($data['remove_cover'] ?? false) ? null : $previous),
                'published_at' => $data['publish'] ? ($post->published_at ?? now()) : null,
            ]);
            $post->save();
        } catch (Throwable $exception) {
            if ($cover) {
                $media->delete([$cover]);
            }

            throw $exception;
        }

        if ($previous && $previous !== $post->cover) {
            $media->delete([$previous]);
        }

        return $post;
    }
}
