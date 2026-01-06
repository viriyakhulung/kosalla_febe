import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type Ticket = {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  description_html: string;
  category: string;
  product_type: string;
  priority: string;
  tagging_word?: string;
  requested_date?: string;
  attachments?: Array<{ name: string; size: number }>;
};

function store(): Ticket[] {
  const g = globalThis as any;
  if (!g.__kosallaTickets) g.__kosallaTickets = [];
  return g.__kosallaTickets as Ticket[];
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kosalla_token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const data = store().slice().reverse();
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("kosalla_token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const fd = await req.formData();

  const subject = String(fd.get("subject") ?? "");
  const category = String(fd.get("category") ?? "");
  const product_type = String(fd.get("product_type") ?? "");
  const priority = String(fd.get("priority") ?? "Normal");
  const tagging_word = String(fd.get("tagging_word") ?? "");
  const requested_date = String(fd.get("requested_date") ?? "");
  const description_html = String(fd.get("description_html") ?? "");

  if (!subject.trim() || !category.trim() || !product_type.trim()) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const attachmentsFiles = fd.getAll("attachments[]") as File[];
  if (attachmentsFiles.length > 5) {
    return NextResponse.json({ message: "Max 5 files" }, { status: 400 });
  }
  for (const f of attachmentsFiles) {
    if (f.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: `File too large: ${f.name}` }, { status: 400 });
    }
  }

  const now = new Date();
  const t: Ticket = {
    id: `T-${now.getTime()}`,
    subject,
    status: "Open",
    created_at: now.toISOString(),
    description_html,
    category,
    product_type,
    priority,
    tagging_word: tagging_word || undefined,
    requested_date: requested_date || undefined,
    attachments: attachmentsFiles.map((f) => ({ name: f.name, size: f.size })),
  };

  store().push(t);
  return NextResponse.json({ data: t }, { status: 201 });
}
