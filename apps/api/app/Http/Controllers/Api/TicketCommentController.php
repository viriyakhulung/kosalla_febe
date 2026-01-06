<?php 

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ticket\StoreTicketCommentRequest;
use App\Models\Ticket;
use App\Models\TicketComment;

class TicketCommentController extends Controller
{
    public function store(StoreTicketCommentRequest $request, Ticket $ticket)
    {
        $user = $request->user();

        // Enduser hanya boleh comment tiket org-nya
        if ($user->hasRole('enduser') && $ticket->organization_id !== $user->organization_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validated();

        $isInternal = false;
        if ($user->hasAnyRole(['engineer-manager','engineer-staff','super-admin'])) {
            $isInternal = (bool)($data['is_internal'] ?? false);
        }

        $comment = TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'is_internal' => $isInternal,
            'body' => $data['body'],
        ]);

        $ticket->update(['last_activity_at' => now()]);

        return response()->json($comment->load('user'), 201);
    }
}
