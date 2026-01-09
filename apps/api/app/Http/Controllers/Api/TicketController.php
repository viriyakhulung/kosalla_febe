<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ticket\StoreTicketRequest;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TicketController extends Controller
{
    /**
     * LIST tickets untuk 1 organisasi (custstaff bisa lihat semua ticket di org)
     * GET /tickets
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user?->organization_id) {
            return response()->json(['message' => 'User belum punya organization'], 422);
        }

        $perPage = (int) $request->query('per_page', 20);
        if ($perPage < 1) $perPage = 20;
        if ($perPage > 100) $perPage = 100;

        $q = Ticket::query()
            ->where('organization_id', $user->organization_id)
            ->with([
                'creator:id,name,email',
                'location:id,name',
                'organization:id,name',
                'inventoryItem:id,name', // sesuaikan kolom inventory_items kamu
            ])
            ->withCount('attachments')
            ->latest();

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

    /**
     * CREATE ticket (org & location auto dari user)
     * POST /tickets
     */
    public function store(StoreTicketRequest $request)
    {
        $user = $request->user();
        if (!$user?->organization_id) {
            return response()->json(['message' => 'User belum punya organization'], 422);
        }

        return DB::transaction(function () use ($request, $user) {

            $ticketNumber = $this->generateTicketNumber($user->organization_id);

            $ticket = Ticket::create([
                'organization_id' => $user->organization_id,
                'location_id' => $user->location_id, // auto
                'created_by' => $user->id,

                'ticket_number' => $ticketNumber,
                'subject' => $request->subject,

                // ✅ sesuai migration alter kamu
                'inventory_item_id' => $request->inventory_item_id,
                'category' => $request->category,
                'tagging_word' => $request->tagging_word,
                'description_html' => $this->sanitizeHtml($request->description_html),

                'priority' => $request->priority,
                'action_number' => $request->action_number,
                'requested_resolution_date' => $request->requested_resolution_date,
                'expected_date' => $request->expected_date,

                'status' => 'open',
            ]);

            return response()->json(
                $ticket->load([
                    'creator:id,name,email',
                    'location:id,name',
                    'organization:id,name',
                    'inventoryItem:id,name',
                ])->loadCount('attachments'),
                201
            );
        });
    }

    /**
     * SHOW ticket (wajib 1 org)
     * GET /tickets/{ticket}
     */
    public function show(Request $request, Ticket $ticket)
    {
        $user = $request->user();

        if (!$user?->organization_id || $ticket->organization_id !== $user->organization_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $ticket->load([
            'creator:id,name,email',
            'location:id,name',
            'organization:id,name',
            'inventoryItem:id,name',
            'attachments.uploader:id,name,email',
        ])->loadCount('attachments');

        // bikin attachments response + download_url (FE tinggal pakai)
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

        return response()->json($data);
    }

    /**
     * Generator: TCK-{ORGID}-{YYYYMMDD}-{NNNN}
     * Contoh: TCK-3-20251231-0007
     *
     * Aman untuk concurrency sederhana karena pakai lockForUpdate (di dalam transaction)
     */
    private function generateTicketNumber(int $orgId): string
    {
        $date = now()->format('Ymd');
        $prefix = "TCK-{$orgId}-{$date}-";

        $last = Ticket::where('organization_id', $orgId)
            ->where('ticket_number', 'like', $prefix . '%')
            ->lockForUpdate()
            ->orderByDesc('id')
            ->value('ticket_number');

        $next = 1;
        if ($last) {
            $lastSeq = (int) substr($last, strlen($prefix));
            $next = $lastSeq + 1;
        }

        return $prefix . str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Minimal sanitasi HTML (biar ga raw XSS).
     * Kalau kamu punya library sanitasi (HTMLPurifier), itu lebih bagus.
     */
    private function sanitizeHtml(?string $html): ?string
    {
        if ($html === null) return null;

        $allowed = '<p><br><b><strong><i><em><u><ul><ol><li><blockquote><code><pre><a>';
        $clean = strip_tags($html, $allowed);

        // buang javascript: dari href
        $clean = preg_replace('/href\s*=\s*["\']\s*javascript:[^"\']*["\']/i', 'href="#"', $clean);

        return $clean;
    }
}
