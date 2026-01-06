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

        $q = Ticket::query()
            ->with(['location:id,name,organization_id', 'creator:id,name,email'])
            ->where('organization_id', $user->organization_id)
            ->orderByDesc('id');

        $tickets = $q->paginate(20);

        return response()->json($tickets);
    }

    // POST /api/portal/tickets
    public function store(StoreTicketRequest $request)
    {
        $user = $request->user();

        if (!$user->organization_id) {
            return response()->json(['message' => 'User belum punya organization_id'], 422);
        }
        if (!$user->location_id) {
            return response()->json(['message' => 'User belum punya location_id'], 422);
        }

        $payload = $request->validated();

        $ticket = DB::transaction(function () use ($user, $payload) {
            // ticket_number unik per organisasi: TCK-YYYY-000001
            $year = now()->format('Y');
            $prefix = "TCK-{$year}-";

            // ambil nomor terakhir untuk org+year ini
            $last = Ticket::where('organization_id', $user->organization_id)
                ->where('ticket_number', 'like', $prefix.'%')
                ->lockForUpdate()
                ->orderByDesc('id')
                ->value('ticket_number');

            $nextSeq = 1;
            if ($last) {
                $lastSeq = intval(substr($last, strlen($prefix)));
                $nextSeq = $lastSeq + 1;
            }

            $ticketNumber = $prefix . str_pad((string)$nextSeq, 6, '0', STR_PAD_LEFT);

            return Ticket::create([
                'organization_id' => $user->organization_id,
                'location_id' => $user->location_id,
                'created_by' => $user->id,
                'ticket_number' => $ticketNumber,

                'subject' => $payload['subject'],
                'description' => $payload['description'],
                'priority' => $payload['priority'] ?? 'normal',
                'status' => 'open',

                'action_number' => $payload['action_number'] ?? null,
                'requested_resolution_date' => $payload['requested_resolution_date'] ?? null,
                'expected_date' => $payload['expected_date'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'Ticket created',
            'data' => $ticket->load(['location:id,name,organization_id', 'creator:id,name,email']),
        ], 201);
    }

    // GET /api/portal/tickets/{ticket}
    public function show(Request $request, Ticket $ticket)
    {
        $user = $request->user();

        if ($ticket->organization_id !== $user->organization_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'data' => $ticket->load(['location:id,name,organization_id', 'creator:id,name,email']),
        ]);
    }
}
