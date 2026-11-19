<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateDraft;
use App\Models\Generation;
use App\Services\OpenAiDrafts;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AutomationController extends Controller
{
    public function index(Request $request, OpenAiDrafts $drafts): Response
    {
        $kind = $request->query('kind') === 'product' ? 'product' : 'post';

        return Inertia::render('admin/automation', [
            'kind' => $kind,
            'configured' => $drafts->configured(),
            'generations' => fn () => Generation::query()->where('kind', $kind)->latest('id')->paginate(12)->appends(['kind' => $kind]),
            'hasPending' => fn () => Generation::query()->where('kind', $kind)->whereIn('status', ['queued', 'running'])->exists(),
        ]);
    }

    public function store(Request $request, OpenAiDrafts $drafts): RedirectResponse
    {
        if (! $drafts->configured()) {
            throw ValidationException::withMessages(['topic' => 'Connect an OpenAI API key before generating a draft.']);
        }

        $data = $request->validate([
            'kind' => ['required', Rule::in(['post', 'product'])],
            'topic' => ['required', 'string', 'max:180'],
            'notes' => ['nullable', 'string', 'max:6000'],
            'reference' => ['nullable', 'file', 'mimes:pdf,txt,jpg,jpeg,png,webp', 'max:4096'],
        ]);
        $file = $request->file('reference');
        $path = $file?->store('draft-references', 'local');

        if ($path === false) {
            throw ValidationException::withMessages(['reference' => 'The reference file could not be saved.']);
        }

        $generation = null;
        try {
            $generation = Generation::create([
                'user_id' => $request->user()?->id,
                'kind' => $data['kind'],
                'topic' => $data['topic'],
                'notes' => $data['notes'] ?? null,
                'reference_path' => $path,
                'reference_mime' => $file?->getMimeType(),
            ]);

            Bus::dispatch(new GenerateDraft($generation->id));
        } catch (Throwable $exception) {
            if ($generation) {
                (new GenerateDraft($generation->id))->failed($exception);
            } elseif ($path) {
                Storage::disk('local')->delete($path);
            }

            throw ValidationException::withMessages(['topic' => 'The draft could not be queued. Try again.']);
        }

        return to_route('admin.automation.index', ['kind' => $data['kind']])->with('success', 'Draft generation requested.');
    }
}
