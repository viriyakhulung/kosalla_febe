<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ticket\StoreTicketCommentRequest;
use App\Models\Ticket;
use App\Models\TicketComment;
use Illuminate\Support\Facades\Schema;

class TicketCommentController extends Controller
{
    public function store(StoreTicketCommentRequest $request, Ticket $ticket)
    {
        $user = $request->user();
        $role = $user->masterRole?->name;

        // ✅ Multi-tenant guard: semua role hanya boleh akses ticket organisasi sendiri
        if ($ticket->organization_id !== $user->organization_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validated();

        // ✅ is_internal hanya boleh untuk internal staff
        $isInternalStaff = in_array($role, ['viriyastaff', 'superadmin'], true);
        $isInternal = $isInternalStaff ? (bool)($data['is_internal'] ?? false) : false;

        $comment = TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'is_internal' => $isInternal,
            'body' => $data['body'],
        ]);

        // optional
        if (Schema::hasColumn('tickets', 'last_activity_at')) {
            $ticket->update(['last_activity_at' => now()]);
        }

        return response()->json($comment->load('user:id,name,email'), 201);
    }
}
