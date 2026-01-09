<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class TicketAttachmentController extends Controller
{
    // GET /tickets/{ticket}/attachments  (atau /portal/tickets/{ticket}/attachments)
    public function index(Request $request, Ticket $ticket)
    {
        $user = $request->user();

        // バ. Multi-tenant guard
        if (!$user?->organization_id || $ticket->organization_id !== $user->organization_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $attachments = $ticket->attachments()
            ->with(['uploader:id,name,email'])
            ->latest()
            ->get();

        return response()->json([
            'attachments' => $attachments->map(fn ($a) => $this->formatAttachment($ticket, $a)),
        ]);
    }

    // POST /tickets/{ticket}/attachments
    public function store(Request $request, Ticket $ticket)
    {
        $user = $request->user();

        // バ. Multi-tenant guard
        if (!$user?->organization_id || $ticket->organization_id !== $user->organization_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'files' => ['required', 'array', 'min:1', 'max:5'],
            'files.*' => [
                'file',
                'max:10240', // 10MB per file (KB)
                'mimes:pdf,png,jpg,jpeg,doc,docx,xls,xlsx,txt,zip',
            ],
        ]);

        $incomingCount = count($validated['files']);

        $created = DB::transaction(function () use ($ticket, $user, $validated, $incomingCount) {

            // バ. Lock untuk hindari upload barengan tembus limit 5
            // Postgres tidak mengizinkan COUNT dengan FOR UPDATE; kunci baris lalu hitung id.
            $existingIds = TicketAttachment::where('ticket_id', $ticket->id)
                ->lockForUpdate()
                ->pluck('id');
            $currentCount = $existingIds->count();

            if (($currentCount + $incomingCount) > 5) {
                abort(response()->json([
                    'message' => "Max 5 attachments per ticket. Saat ini sudah ada {$currentCount} file.",
                ], 422));
            }

            $rows = [];
            foreach ($validated['files'] as $file) {
                $path = $file->store("tickets/{$ticket->id}", 'public');

                $rows[] = $ticket->attachments()->create([
                    'uploaded_by' => $user->id,
                    'original_name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'mime_type' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                ]);
            }

            return $rows;
        });

        // load uploader biar response konsisten (pakai Eloquent Collection)
        $created = TicketAttachment::with('uploader:id,name,email')
            ->whereIn('id', collect($created)->pluck('id'))
            ->get();

        return response()->json([
            'message' => 'Attachments uploaded',
            'attachments' => $created->map(fn ($a) => $this->formatAttachment($ticket, $a)),
        ], 201);
    }

    // GET /tickets/{ticket}/attachments/{attachment}/download
    public function download(Request $request, Ticket $ticket, TicketAttachment $attachment)
    {
        $user = $request->user();

        // バ. Multi-tenant guard
        if (!$user?->organization_id || $ticket->organization_id !== $user->organization_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // pastikan attachment milik ticket tsb
        abort_unless($attachment->ticket_id === $ticket->id, 404);

        if (!Storage::disk('public')->exists($attachment->path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Storage::disk('public')->download($attachment->path, $attachment->original_name);
    }

    private function formatAttachment(Ticket $ticket, TicketAttachment $a): array
    {
        return [
            'id' => $a->id,
            'ticket_id' => $a->ticket_id,
            'original_name' => $a->original_name,
            'mime_type' => $a->mime_type,
            'size' => $a->size,
            'uploaded_by' => $a->uploaded_by,
            'uploader' => $a->uploader ? [
                'id' => $a->uploader->id,
                'name' => $a->uploader->name,
                'email' => $a->uploader->email,
            ] : null,
            'created_at' => $a->created_at,
            // バ. FE pakai ini buat tombol download
            'download_url' => route('tickets.attachments.download', [
                'ticket' => $ticket->id,
                'attachment' => $a->id,
            ]),
        ];
    }
}
