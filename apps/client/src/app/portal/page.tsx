// app/portal/page.tsx
import Link from "next/link";

export default function PortalPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Portal</h1>
          <p className="mt-2 text-slate-600">
            Welcome to Kosalla Portal.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/portal/tickets/new"
            className="rounded-xl border bg-white p-5 shadow-sm hover:shadow transition"
          >
            <div className="text-lg font-semibold text-slate-900">Create Ticket</div>
            <div className="mt-1 text-sm text-slate-600">
              Submit issue baru (Description + Attachment).
            </div>
          </Link>

          <Link
            href="/portal/tickets"
            className="rounded-xl border bg-white p-5 shadow-sm hover:shadow transition"
          >
            <div className="text-lg font-semibold text-slate-900">Ticket History</div>
            <div className="mt-1 text-sm text-slate-600">
              Lihat semua tiket dalam organisasi.
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
