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
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!name || !phone || !email || !password) {
    return NextResponse.redirect(
      new URL("/register?error=Tous+les+champs+sont+requis", request.url),
      303
    );
  }

  try {
    // Step 1: Create Supabase Auth account (or login if already exists)
    let accessToken: string;
    let refreshToken: string;
    let expiresAt: number | undefined;

    const authResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (authResponse.ok) {
      const authData = await authResponse.json();
      accessToken = authData.access_token;
      refreshToken = authData.refresh_token;
      expiresAt = authData.expires_at;
    } else {
      // Registration failed — might be "already registered".
      // Try logging in instead so the user can retry step 2.
      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        // Neither register nor login worked
        const body = await authResponse.text();
        let detail = "Erreur lors de la création du compte";
        try {
          detail = JSON.parse(body).detail || detail;
        } catch {}
        return NextResponse.redirect(
          new URL(`/register?error=${encodeURIComponent(detail)}`, request.url),
          303
        );
      }

      const loginData = await loginResponse.json();
      accessToken = loginData.access_token;
      refreshToken = loginData.refresh_token;
      expiresAt = loginData.expires_at;
    }

    // Step 2: Create organizer profile (idempotent — backend returns 409 if exists)
    const orgResponse = await fetch(`${API_BASE_URL}/api/organizers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        display_name: name,
        phone,
        email,
        country: "SN",
      }),
    });

    if (!orgResponse.ok) {
      const status = orgResponse.status;
      // 409 = already exists (previous partial registration completed) — treat as success
      if (status !== 409) {
        const body = await orgResponse.text();
        let detail = "Erreur lors de la création du profil organisateur";
        try {
          detail = JSON.parse(body).detail || detail;
        } catch {}
        return NextResponse.redirect(
          new URL(`/register?error=${encodeURIComponent(detail)}`, request.url),
          303
        );
      }
    }

    // Set cookies
    const maxAge = expiresAt
      ? Math.max(0, expiresAt - Math.floor(Date.now() / 1000))
      : 3600;
    const cookieStore = await cookies();
    cookieStore.set("access_token", accessToken, cookieOptions(maxAge));
    cookieStore.set("refresh_token", refreshToken, cookieOptions(30 * 24 * 3600));

    return NextResponse.redirect(new URL("/events", request.url), 303);
  } catch {
    return NextResponse.redirect(
      new URL("/register?error=Erreur+de+connexion+au+serveur", request.url),
      303
    );
  }
}
