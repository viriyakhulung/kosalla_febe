"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, downloadWithAuth } from "@/lib/api";

type Attachment = {
  id: number;
  original_name: string;
  size: number;
  download_url: string;
};

type Ticket = {
  id: number;
  ticket_number: string;
  subject: string;
  status: string;
  created_at: string;
  description_html: string;

  category?: string | null;
  priority?: string | null;
  tagging_word?: string | null;
  requested_resolution_date?: string | null;

  inventory_item?: { id: number; name: string } | null;

  attachments?: Attachment[];
  attachments_count?: number;
};

function fmtDate(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function fmtBytes(n?: number) {
  if (!n && n !== 0) return "-";
  const kb = 1024;
  const mb = kb * 1024;
  if (n >= mb) return `${(n / mb).toFixed(2)} MB`;
  if (n >= kb) return `${(n / kb).toFixed(2)} KB`;
  return `${n} B`;
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const ticketId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const json = await apiFetch<{ data: Ticket }>(`/portal/tickets/${ticketId}`);
      setTicket(json?.data ?? null);
      if (!json?.data) throw new Error("Ticket tidak ditemukan.");
    } catch (e: any) {
      setError(e?.message ?? "Gagal load ticket");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ticketId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const meta = useMemo(() => {
    if (!ticket) return [];
    return [
      { label: "Ticket Number", value: ticket.ticket_number },
      { label: "Status", value: ticket.status },
      { label: "Priority", value: ticket.priority ?? "-" },
      { label: "Category", value: ticket.category ?? "-" },
      { label: "Inventory", value: ticket.inventory_item?.name ?? "-" },
      { label: "Tagging word", value: ticket.tagging_word || "-" },
      { label: "Requested date", value: ticket.requested_resolution_date || "-" },
      { label: "Created at", value: fmtDate(ticket.created_at) },
    ];
  }, [ticket]);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Ticket Detail</h1>
            <p className="mt-1 text-sm text-slate-600">
              Issue Details hanya <b>Description</b> (sesuai mindmap).
            </p>
          </div>

          <div className="flex gap-2">
            <button
              className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => router.push("/portal/tickets")}
            >
              Back
            </button>
            <button
              className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50"
              onClick={load}
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border bg-white p-6 shadow-sm text-sm text-slate-600">
            Loading...
          </div>
        ) : !ticket ? (
          <div className="rounded-xl border bg-white p-6 shadow-sm text-sm text-slate-600">
            Ticket tidak ditemukan.
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="rounded-xl border bg-white p-5 shadow-sm space-y-2">
              <div className="text-sm font-semibold text-slate-900">Subject</div>
              <div className="text-lg font-semibold text-slate-900">{ticket.subject}</div>
            </div>

            {/* Meta */}
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-900 mb-3">
                Basic Information
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {meta.map((m) => (
                  <div key={m.label} className="rounded-lg border bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">{m.label}</div>
                    <div className="mt-1 text-sm font-medium text-slate-900 break-words">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
              <div className="text-sm font-semibold text-slate-900">
                Issue Details (Description)
              </div>

              <div className="rounded-lg border bg-white p-4">
                <div
                  className="prose max-w-none prose-sm"
                  dangerouslySetInnerHTML={{ __html: ticket.description_html || "<p></p>" }}
                />
              </div>
            </div>

            {/* Attachments */}
            <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
              <div className="text-sm font-semibold text-slate-900">Attachments</div>

              {ticket.attachments?.length ? (
                <div className="overflow-auto">
                  <table className="min-w-[640px] w-full text-sm">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="text-left px-3 py-2">File name</th>
                        <th className="text-left px-3 py-2">Size</th>
                        <th className="text-right px-3 py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticket.attachments.map((a) => (
                        <tr key={a.id} className="border-t">
                          <td className="px-3 py-2">{a.original_name}</td>
                          <td className="px-3 py-2">{fmtBytes(a.size)}</td>
                          <td className="px-3 py-2 text-right">
                            <button
                              className="rounded-lg border bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
                              onClick={() => downloadWithAuth(a.download_url, a.original_name)}
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-slate-600">Tidak ada attachment.</div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
