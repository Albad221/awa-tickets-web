import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.TICKETS_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8002";

const INTERNAL_API_KEY =
  process.env.TICKETS_INTERNAL_API_KEY ||
  process.env.INTERNAL_API_KEY ||
  "";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = await cookies();
  const phone = store.get("buyer_phone")?.value;

  if (!phone) {
    return NextResponse.json({ error: "Acheteur non sélectionné" }, { status: 401 });
  }
  if (!INTERNAL_API_KEY) {
    return NextResponse.json({ error: "TICKETS_INTERNAL_API_KEY manquant" }, { status: 500 });
  }

  const response = await fetch(`${API_BASE_URL}/api/tickets/${id}/pdf`, {
    method: "GET",
    headers: {
      "X-Api-Key": INTERNAL_API_KEY,
      "X-User-Phone": phone,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    return NextResponse.json(
      { error: body || `Erreur PDF (${response.status})` },
      { status: response.status }
    );
  }

  const pdf = await response.arrayBuffer();
  return new Response(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": response.headers.get("Content-Disposition") || 'inline; filename="ticket.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
