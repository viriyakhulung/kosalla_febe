import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kosalla_token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${API_BASE}/portal/tickets?per_page=20`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => null);
  return NextResponse.json(json, { status: res.status });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("kosalla_token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const form = await req.formData();

  // Map field FE -> BE
  const fd = new FormData();
  fd.set("subject", String(form.get("subject") ?? ""));
  fd.set("description_html", String(form.get("description_html") ?? ""));

  const category = String(form.get("category") ?? "");
  const productType = String(form.get("product_type") ?? "");
  if (category) fd.set("category", category);
  else if (productType) fd.set("category", productType);

  const tagging = String(form.get("tagging_word") ?? "");
  if (tagging) fd.set("tagging_word", tagging);

  const reqDate = String(form.get("requested_date") ?? "");
  if (reqDate) fd.set("requested_resolution_date", reqDate);

  const priorityMap: Record<string, string> = {
    Low: "low",
    Normal: "normal",
    High: "high",
    Urgent: "high", // backend hanya low|normal|high
  };
  const priority = priorityMap[String(form.get("priority") ?? "Normal")] || "normal";
  fd.set("priority", priority);

  const inventoryItemId = form.get("inventory_item_id");
  if (inventoryItemId) fd.set("inventory_item_id", String(inventoryItemId));

  // Create ticket
  const ticketRes = await fetch(`${API_BASE}/portal/tickets`, {
    method: "POST",
    body: fd,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const ticketJson = await ticketRes.json().catch(() => null);
  if (!ticketRes.ok) {
    return NextResponse.json(ticketJson ?? { message: "Create failed" }, { status: ticketRes.status });
  }

  const ticketId = ticketJson?.data?.id || ticketJson?.id;
  const files = form.getAll("attachments[]") as File[];
  if (!files.length) {
    return NextResponse.json(ticketJson, { status: 201 });
  }

  // Upload attachments ke backend (field: files[])
  const uploadFd = new FormData();
  files.forEach((f) => uploadFd.append("files[]", f));

  const uploadRes = await fetch(`${API_BASE}/tickets/${ticketId}/attachments`, {
    method: "POST",
    body: uploadFd,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const uploadJson = await uploadRes.json().catch(() => null);
  if (!uploadRes.ok) {
    return NextResponse.json(uploadJson ?? { message: "Upload failed" }, { status: uploadRes.status });
  }

  return NextResponse.json({ ...ticketJson, attachments: uploadJson?.attachments }, { status: 201 });
}
