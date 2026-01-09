"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Ticket = {
  id: number;
  ticket_number: string;
  subject: string;
  status: string;
  created_at: string;
  description_html?: string | null;

  category?: string | null;
  priority?: string | null;
  tagging_word?: string | null;

  inventory_item?: { id: number; name: string } | null;

  attachments_count?: number;
};

type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function TicketHistoryPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "open">("all");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams();
      qs.set("per_page", "20");
      if (status !== "all") qs.set("status", status);
      if (q.trim()) qs.set("q", q.trim());

      const json = await apiFetch<Paginated<Ticket>>(`/portal/tickets?${qs.toString()}`);
      setTickets(json?.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Gagal load tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return tickets.filter((t) => {
      const okQ =
        !qq ||
        t.subject?.toLowerCase().includes(qq) ||
        String(t.id).includes(qq) ||
        t.ticket_number?.toLowerCase().includes(qq);
      return okQ;
    });
  }, [tickets, q]);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Ticket History</h1>
            <p className="mt-1 text-sm text-slate-600">
              Melihat semua tiket dalam 1 organisasi (sesuai mindmap).
            </p>
          </div>

          <div className="flex gap-2">
            <button
              className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => router.push("/portal")}
            >
              Back
            </button>
            <button
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
              onClick={() => router.push("/portal/tickets/new")}
            >
              Create Ticket
            </button>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <input
                className="w-full md:w-[340px] rounded-lg border px-3 py-2 text-sm"
                placeholder="Search by Ticket Number / Subject"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <select
                className="w-full md:w-[160px] rounded-lg border px-3 py-2 text-sm bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
              </select>
            </div>

            <button
              className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50"
              onClick={load}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b px-4 py-3 text-sm font-semibold text-slate-900">
            Tickets ({filtered.length})
          </div>

          {error && (
            <div className="p-4 text-sm text-red-700 bg-red-50 border-b border-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-6 text-sm text-slate-600">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-slate-600">Belum ada ticket.</div>
          ) : (
            <div className="w-full overflow-auto">
              <table className="min-w-[980px] w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="text-left px-4 py-3">Ticket ID</th>
                    <th className="text-left px-4 py-3">Subject</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Priority</th>
                    <th className="text-left px-4 py-3">Inventory</th>
                    <th className="text-left px-4 py-3">Created</th>
                    <th className="text-right px-4 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs">{t.ticket_number}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {t.subject}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full border px-2 py-0.5 text-xs">
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{t.priority ?? "-"}</td>
                      <td className="px-4 py-3">{t.inventory_item?.name ?? "-"}</td>
                      <td className="px-4 py-3">{fmtDate(t.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          className="rounded-lg border bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
                          onClick={() => router.push(`/portal/tickets/${t.id}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
