"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/portal/RichTextEditor";
import AttachmentPicker from "@/components/portal/AttachmentPicker";
import { apiFetch } from "@/lib/api";

type InventoryItem = {
  id: number;
  name: string;
};

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-center gap-3 border-b last:border-b-0">
      <div className="bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
        {label}
      </div>
      <div className="px-3 py-2">{children}</div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="border-b bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800">
      {title}
    </div>
  );
}

export default function CreateTicketPage() {
  const router = useRouter();

  // Minimal fields (sesuai yang sudah kamu buat)
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [inventoryItemId, setInventoryItemId] = useState<number | "">("");
  const [priority, setPriority] = useState("Normal");

  const [taggingWord, setTaggingWord] = useState("");
  const [requestedDate, setRequestedDate] = useState("");

  // Optional fields (sebelumnya disabled)
  const [version, setVersion] = useState("");
  const [buildNo, setBuildNo] = useState("");
  const [patchNo, setPatchNo] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [project, setProject] = useState("");
  const [customer, setCustomer] = useState("");
  const [severity, setSeverity] = useState("N/A");
  const [expectedDate, setExpectedDate] = useState("");
  const [completePs, setCompletePs] = useState<"yes" | "no" | "">("");
  const [scheduleComment, setScheduleComment] = useState("");

  // Issue Details = Description ONLY
  const [descriptionHtml, setDescriptionHtml] = useState("<p></p>");

  // Attachments
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const issueNumber = useMemo(() => "AUTO", []); // placeholder (nanti backend generate)

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoadingProducts(true);
        const res = await apiFetch<{ data: InventoryItem[] }>("/portal/inventory-items");
        setInventoryItems(res?.data ?? []);
      } catch (e: any) {
        console.error("Gagal load inventory items", e?.message);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  async function submit(status: "Draft" | "Open") {
    setError("");
    setFileError("");

    if (!subject.trim()) return setError("Subject wajib diisi.");
    if (!category.trim()) return setError("Category wajib diisi.");
    if (!inventoryItemId) return setError("Product wajib dipilih.");

    const stripped = descriptionHtml.replace(/<[^>]*>/g, "").trim();
    if (!stripped) return setError("Description wajib diisi.");

    const selectedProductName =
      inventoryItems.find((p) => p.id === inventoryItemId)?.name ?? "";

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("status", status); // ✅ buat Save Draft / Save
      fd.append("subject", subject);
      fd.append("category", category);
      if (selectedProductName) {
        fd.append("product_type", selectedProductName); // optional mapping ke backend sebagai category fallback
      }
      fd.append("inventory_item_id", String(inventoryItemId));
      fd.append("priority", priority);
      fd.append("tagging_word", taggingWord);
      fd.append("requested_date", requestedDate);
      fd.append("expected_date", expectedDate);
      fd.append("complete_ps", completePs);
      fd.append("schedule_comment", scheduleComment);

      // optional fields (belum dipakai backend, tapi disertakan agar tidak hilang)
      fd.append("version", version);
      fd.append("build_no", buildNo);
      fd.append("patch_no", patchNo);
      fd.append("module", moduleName);
      fd.append("error_code", errorCode);
      fd.append("project", project);
      fd.append("customer", customer);
      fd.append("severity", severity);

      fd.append("description_html", descriptionHtml);

      files.forEach((f) => fd.append("attachments[]", f));

      const res = await fetch("/api/tickets", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Submit gagal (status ${res.status})`);
      }

      router.push("/portal/tickets");
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Submit gagal");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Top toolbar (mirip referensi) */}
      <div className="border-b bg-slate-100">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-slate-900 text-white">
              ↥
            </span>
            Submit an Issue
          </div>

          <div className="ml-auto flex items-center gap-2">
            <select
              className="h-9 w-[280px] rounded border bg-white px-2 text-sm"
              defaultValue=""
              disabled
              title="Template belum diaktifkan"
            >
              <option value="">--- Select Template ---</option>
            </select>

            <button
              type="button"
              disabled
              className="h-9 rounded bg-blue-600 px-3 text-sm font-medium text-white opacity-60"
              title="Nanti kita sambungkan ke Template Management"
            >
              Template Management
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        {(error || fileError) && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error || fileError}
          </div>
        )}

        {/* Subject row full width */}
        <div className="mb-4 grid grid-cols-[180px_1fr] border">
          <div className="bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            Subject
          </div>
          <div className="px-3 py-2">
            <input
              className="h-9 w-full rounded border px-3 text-sm"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Masukkan subject issue"
            />
          </div>
        </div>

        {/* Basic + Additional (2 kolom) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="border">
            <SectionTitle title="* Basic Information" />

            <Row label="Issue Number">
              <input
                className="h-9 w-full rounded border bg-slate-50 px-3 text-sm"
                value={issueNumber}
                readOnly
              />
            </Row>

            <Row label="Category *">
              <input
                className="h-9 w-full rounded border px-3 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Contoh: Installation / Performance / Bug"
              />
            </Row>

            <Row label="Product *">
              <select
                className="h-9 w-full rounded border bg-white px-2 text-sm"
                value={inventoryItemId}
                onChange={(e) =>
                  setInventoryItemId(e.target.value ? Number(e.target.value) : "")
                }
                disabled={loadingProducts}
              >
                <option value="">--- Select Product ---</option>
                {inventoryItems.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Row>

            {/* Placeholder fields (mirip referensi, belum dipakai) */}
            <Row label="Version">
              <input
                className="h-9 w-full rounded border px-3 text-sm"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="Masukkan version"
              />
            </Row>

            <Row label="Build No">
              <input
                className="h-9 w-full rounded border px-3 text-sm"
                value={buildNo}
                onChange={(e) => setBuildNo(e.target.value)}
                placeholder="Masukkan build number"
              />
            </Row>

            <Row label="Patch No">
              <input
                className="h-9 w-full rounded border px-3 text-sm"
                value={patchNo}
                onChange={(e) => setPatchNo(e.target.value)}
                placeholder="Masukkan patch number"
              />
            </Row>

            <Row label="Module">
              <input
                className="h-9 w-full rounded border px-3 text-sm"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="Masukkan module"
              />
            </Row>

            <Row label="Error Code">
              <input
                className="h-9 w-full rounded border px-3 text-sm"
                value={errorCode}
                onChange={(e) => setErrorCode(e.target.value)}
                placeholder="Masukkan error code"
              />
            </Row>

    <Row label="Priority">
      <select
        className="h-9 w-full rounded border bg-white px-2 text-sm"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option>Low</option>
        <option>Normal</option>
        <option>High</option>
      </select>
    </Row>

            <Row label="Severity">
              <select
                className="h-9 w-full rounded border bg-white px-2 text-sm"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option>N/A</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </Row>

            <Row label="Reporter">
              <div className="text-sm text-slate-600">(auto from profile)</div>
            </Row>

            <Row label="Project">
              <input
                className="h-9 w-full rounded border px-3 text-sm"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Masukkan project"
              />
            </Row>

            <Row label="Customer">
              <input
                className="h-9 w-full rounded border px-3 text-sm"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Masukkan customer"
              />
            </Row>
          </div>

          <div className="border">
            <SectionTitle title="* Additional Information" />

            <Row label="Tagging word">
              <input
                className="h-9 w-full rounded border px-3 text-sm"
                value={taggingWord}
                onChange={(e) => setTaggingWord(e.target.value)}
                placeholder="Contoh: Senior Engineer"
              />
            </Row>

            <Row label="Requested date for resolution">
              <input
                type="date"
                className="h-9 w-full rounded border px-3 text-sm"
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
              />
            </Row>

            {/* Placeholder fields (mirip referensi, belum dipakai) */}
            <Row label="Expected Date(PS)">
              <input
                type="date"
                className="h-9 w-full rounded border px-3 text-sm"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
              />
            </Row>

            <Row label="Complete(PS)">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="complete_ps"
                    value="yes"
                    checked={completePs === "yes"}
                    onChange={() => setCompletePs("yes")}
                  />{" "}
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="complete_ps"
                    value="no"
                    checked={completePs === "no"}
                    onChange={() => setCompletePs("no")}
                  />{" "}
                  No
                </label>
              </div>
            </Row>

            <Row label="Schedule Comment(PS)">
              <input
                className="h-9 w-full rounded border px-3 text-sm"
                value={scheduleComment}
                onChange={(e) => setScheduleComment(e.target.value)}
                placeholder="Masukkan schedule comment"
              />
            </Row>
          </div>
        </div>

        {/* Issue Details (Description only) */}
        <div className="mt-4 border">
          <div className="border-b bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800">
            * Issue Details
          </div>

          {/* Tab (hanya Description sesuai mindmap) */}
          <div className="border-b bg-white px-3 py-2">
            <span className="inline-flex rounded border bg-slate-50 px-3 py-1 text-sm font-medium">
              Description
            </span>
          </div>

          <div className="p-3">
            <RichTextEditor value={descriptionHtml} onChange={setDescriptionHtml} />
          </div>
        </div>

        {/* Attachments */}
        <div className="mt-4 border">
          <div className="border-b bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800">
            Attachment (Max 5 files, 10MB/file)
          </div>
          <div className="p-3">
            <AttachmentPicker
              files={files}
              setFiles={setFiles}
              error={fileError}
              setError={setFileError}
            />
          </div>
        </div>

        {/* Related Issue (placeholder) */}
        <div className="mt-4 border">
          <div className="border-b bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800">
            Related Issue
          </div>
          <div className="p-3 text-sm text-slate-700">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" defaultChecked disabled /> Parent
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" disabled /> Child
                </label>
              </div>
              <div className="flex gap-2">
                <button className="rounded bg-blue-600 px-3 py-1 text-white opacity-60" disabled>
                  Add
                </button>
                <button className="rounded bg-blue-600 px-3 py-1 text-white opacity-60" disabled>
                  Delete
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded border">
              <div className="grid grid-cols-5 bg-slate-50 text-xs font-semibold text-slate-700">
                <div className="px-3 py-2">✓</div>
                <div className="px-3 py-2">Relation</div>
                <div className="px-3 py-2">Issue Number</div>
                <div className="px-3 py-2">Status</div>
                <div className="px-3 py-2">Subject</div>
              </div>
              <div className="px-3 py-3 text-xs text-slate-500">
                (coming soon)
              </div>
            </div>
          </div>
        </div>

        {/* User List registered (placeholder) */}
        <div className="mt-4 border">
          <div className="border-b bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800">
            User List registered in monitored issue
          </div>
          <div className="p-3 text-sm text-slate-700">
            <div className="mb-2 flex justify-end gap-2">
              <button className="rounded bg-blue-600 px-3 py-1 text-white opacity-60" disabled>
                Add
              </button>
              <button className="rounded bg-blue-600 px-3 py-1 text-white opacity-60" disabled>
                Delete
              </button>
            </div>

            <div className="overflow-hidden rounded border">
              <div className="grid grid-cols-4 bg-slate-50 text-xs font-semibold text-slate-700">
                <div className="px-3 py-2">✓</div>
                <div className="px-3 py-2">User</div>
                <div className="px-3 py-2">Issue Notification</div>
                <div className="px-3 py-2">SMS Notification</div>
              </div>
              <div className="px-3 py-3 text-xs text-slate-500">
                (coming soon)
              </div>
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={submitting}
            onClick={() => submit("Draft")}
            title="Simpan sebagai draft (mock dulu)"
          >
            Save Draft
          </button>

          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={submitting}
            onClick={() => submit("Open")}
          >
            Save
          </button>

          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={submitting}
            onClick={() => router.push("/portal/tickets")}
          >
            List
          </button>
        </div>
      </div>
    </main>
  );
}


