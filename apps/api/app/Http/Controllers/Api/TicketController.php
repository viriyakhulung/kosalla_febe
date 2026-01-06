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
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user?->organization_id) {
            return response()->json(['message' => 'User belum punya organization'], 422);
        }

        $q = Ticket::query()
            ->where('organization_id', $user->organization_id)
            ->with(['creator:id,name,email', 'location:id,name', 'organization:id,name'])
            ->latest();

        // optional filter sederhana (kalau mau dipakai FE)
        if ($request->filled('status')) {
            $q->where('status', $request->string('status'));
        }
        if ($request->filled('priority')) {
            $q->where('priority', $request->string('priority'));
        }

        return $q->paginate(20);
    }

    /**
     * CREATE ticket (org & location auto dari user)
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
                'description' => $request->description,

                'category' => $request->category,
                'product' => $request->product,
                'version' => $request->version,
                'build_no' => $request->build_no,
                'patch_no' => $request->patch_no,
                'module' => $request->module,
                'error_code' => $request->error_code,
                'priority' => $request->priority,
                'severity' => $request->severity,

                'issue_number' => $request->issue_number,
                'action_number' => $request->action_number,
                'requested_resolution_date' => $request->requested_resolution_date,
                'expected_date' => $request->expected_date,

                'status' => 'open',
            ]);

            return response()->json(
                $ticket->load(['creator:id,name,email', 'location:id,name', 'organization:id,name']),
                201
            );
        });
    }

    /**
     * SHOW ticket (wajib 1 org)
     */
    public function show(Request $request, Ticket $ticket)
    {
        $user = $request->user();

        if (!$user?->organization_id || $ticket->organization_id !== $user->organization_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $ticket->load(['creator:id,name,email', 'location:id,name', 'organization:id,name']);
    }

    /**
     * Generator: TCK-{ORGID}-{YYYYMMDD}-{NNNN}
     * Contoh: TCK-3-20251231-0007
     *
     * Aman untuk concurrency sederhana karena pakai lockForUpdate pada query max.
     */
    private function generateTicketNumber(int $orgId): string
    {
        $date = now()->format('Ymd');
        $prefix = "TCK-{$orgId}-{$date}-";

        // Ambil ticket terakhir hari ini untuk org ini, lock row range yang relevan
        $last = Ticket::where('organization_id', $orgId)
            ->where('ticket_number', 'like', $prefix.'%')
            ->lockForUpdate()
            ->orderByDesc('id')
            ->value('ticket_number');

        $next = 1;
        if ($last) {
            $lastSeq = (int) substr($last, strlen($prefix)); // ambil NNNN
            $next = $lastSeq + 1;
        }

        return $prefix . str_pad((string)$next, 4, '0', STR_PAD_LEFT);
    }
}
