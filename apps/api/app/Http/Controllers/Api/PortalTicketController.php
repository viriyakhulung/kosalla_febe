<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ticket\StoreTicketRequest;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PortalTicketController extends Controller
{
    // GET /api/portal/tickets
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user?->organization_id) {
            return response()->json(['message' => 'User belum punya organization_id'], 422);
        }

        $perPage = (int) $request->query('per_page', 20);
        if ($perPage < 1) $perPage = 20;
        if ($perPage > 100) $perPage = 100;

        $q = Ticket::query()
            ->where('organization_id', $user->organization_id)
            ->with([
                'location:id,name,organization_id',
                'creator:id,name,email',
                'inventoryItem:id,name', // sesuaikan kolom inventory_items kamu
            ])
            ->withCount('attachments')
            ->orderByDesc('id');

        // optional filter sederhana
        if ($request->filled('status')) {
            $q->where('status', (string) $request->input('status'));
        }
        if ($request->filled('priority')) {
            $q->where('priority', (string) $request->input('priority'));
        }
        if ($request->filled('category')) {
            $q->where('category', (string) $request->input('category'));
        }
        if ($request->filled('q')) {
            $keyword = (string) $request->input('q');
            $q->where(function ($w) use ($keyword) {
                $w->where('ticket_number', 'like', "%{$keyword}%")
                  ->orWhere('subject', 'like', "%{$keyword}%");
            });
        }

        return response()->json($q->paginate($perPage));
    }

    // POST /api/portal/tickets
    public function store(StoreTicketRequest $request)
    {
        $user = $request->user();

        if (!$user?->organization_id) {
            return response()->json(['message' => 'User belum punya organization_id'], 422);
        }
        if (!$user?->location_id) {
            return response()->json(['message' => 'User belum punya location_id'], 422);
        }

        $payload = $request->validated();

        $ticket = DB::transaction(function () use ($user, $payload) {
            // ticket_number unik per organisasi: TCK-{ORGID}-{YYYYMMDD}-{NNNN}
            $date = now()->format('Ymd');
            $prefix = "TCK-{$user->organization_id}-{$date}-";

            $last = Ticket::where('organization_id', $user->organization_id)
                ->where('ticket_number', 'like', $prefix . '%')
                ->lockForUpdate()
                ->orderByDesc('id')
                ->value('ticket_number');

            $nextSeq = 1;
            if ($last) {
                $lastSeq = (int) substr($last, strlen($prefix));
                $nextSeq = $lastSeq + 1;
            }

            $ticketNumber = $prefix . str_pad((string) $nextSeq, 4, '0', STR_PAD_LEFT);

            return Ticket::create([
                'organization_id' => $user->organization_id,
                'location_id' => $user->location_id,
                'created_by' => $user->id,
                'ticket_number' => $ticketNumber,

                'subject' => $payload['subject'],
                'category' => $payload['category'] ?? null,
                'inventory_item_id' => $payload['inventory_item_id'] ?? null,
                'tagging_word' => $payload['tagging_word'] ?? null,

                // ✅ mindmap: description-only (HTML)
                'description_html' => $this->sanitizeHtml($payload['description_html']),

                'priority' => $payload['priority'] ?? 'normal',
                'status' => 'open',

                'action_number' => $payload['action_number'] ?? null,
                'requested_resolution_date' => $payload['requested_resolution_date'] ?? null,
                'expected_date' => $payload['expected_date'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'Ticket created',
            'data' => $ticket->load([
                'location:id,name,organization_id',
                'creator:id,name,email',
                'inventoryItem:id,name',
            ])->loadCount('attachments'),
        ], 201);
    }

    // GET /api/portal/tickets/{ticket}
    public function show(Request $request, Ticket $ticket)
    {
        $user = $request->user();

        if (!$user?->organization_id || $ticket->organization_id !== $user->organization_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $ticket->load([
            'location:id,name,organization_id',
            'creator:id,name,email',
            'inventoryItem:id,name',
            'attachments.uploader:id,name,email',
        ])->loadCount('attachments');

        $attachments = $ticket->attachments->map(function ($a) use ($ticket) {
            return [
                'id' => $a->id,
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
                'download_url' => route('tickets.attachments.download', [
                    'ticket' => $ticket->id,
                    'attachment' => $a->id,
                ]),
            ];
        });

        $data = $ticket->toArray();
        $data['attachments'] = $attachments;

        return response()->json(['data' => $data]);
    }

    private function sanitizeHtml(?string $html): ?string
    {
        if ($html === null) return null;

        $allowed = '<p><br><b><strong><i><em><u><ul><ol><li><blockquote><code><pre><a>';
        $clean = strip_tags($html, $allowed);
        $clean = preg_replace('/href\s*=\s*["\']\s*javascript:[^"\']*["\']/i', 'href="#"', $clean);

        return $clean;
    }
}
