import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.TICKETS_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8002";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return NextResponse.redirect(
      new URL("/login?error=Email+et+mot+de+passe+requis", request.url),
      303
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const body = await response.text();
      let detail = "Identifiants incorrects";
      try {
        detail = JSON.parse(body).detail || detail;
      } catch {}
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(detail)}`, request.url),
        303
      );
    }

    const data = await response.json();
    // Backend returns expires_at (unix timestamp); compute maxAge from that
    const maxAge = data.expires_at
      ? Math.max(0, data.expires_at - Math.floor(Date.now() / 1000))
      : 3600;
    const cookieStore = await cookies();
    cookieStore.set("access_token", data.access_token, cookieOptions(maxAge));
    cookieStore.set("refresh_token", data.refresh_token, cookieOptions(30 * 24 * 3600));

    return NextResponse.redirect(new URL("/events", request.url), 303);
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=Erreur+de+connexion+au+serveur", request.url),
      303
    );
  }
}
