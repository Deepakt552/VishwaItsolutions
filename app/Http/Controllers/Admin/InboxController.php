<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InboxController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/inbox/index', [
            'messages' => ContactMessage::query()->latest('id')->paginate(20, ['id', 'name', 'email', 'subject', 'read_at', 'created_at']),
        ]);
    }

    public function show(ContactMessage $message): Response
    {
        return Inertia::render('admin/inbox/show', ['message' => $message]);
    }

    public function update(ContactMessage $message): RedirectResponse
    {
        $message->update(['read_at' => $message->read_at ?? now()]);

        return to_route('admin.inbox.show', $message)->with('success', 'Message marked as read.');
    }

    public function destroy(ContactMessage $message): RedirectResponse
    {
        $message->delete();

        return to_route('admin.inbox.index')->with('success', 'Message deleted.');
    }
}
