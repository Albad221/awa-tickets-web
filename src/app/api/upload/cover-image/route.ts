import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { RefreshResponse, UploadResponse } from "@/lib/types";

const API_BASE_URL =
  process.env.TICKETS_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8002";

function cloneFormData(source: FormData): FormData {
  const copy = new FormData();
  for (const [key, value] of source.entries()) {
    copy.append(key, value);
  }
  return copy;
}

async function uploadWithAccessToken(
  formData: FormData,
  accessToken?: string
): Promise<Response> {
  return fetch(`${API_BASE_URL}/api/upload/cover-image`, {
    method: "POST",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: formData,
    cache: "no-store",
  });
}

function getErrorMessage(rawBody: string, fallback: string): string {
  try {
    const parsed = JSON.parse(rawBody) as {
      detail?: string;
      message?: string;
      error?: string;
    };
    return parsed.detail || parsed.message || parsed.error || fallback;
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  if (!formData.get("file")) {
    return NextResponse.json({ error: "Fichier image requis" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  let uploadResponse = await uploadWithAccessToken(cloneFormData(formData), accessToken);
  let refreshedTokens: RefreshResponse | null = null;

  if (uploadResponse.status === 401 && refreshToken) {
    const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });

    if (refreshResponse.ok) {
      refreshedTokens = (await refreshResponse.json()) as RefreshResponse;
      uploadResponse = await uploadWithAccessToken(
        cloneFormData(formData),
        refreshedTokens.access_token
      );
    }
  }

  if (!uploadResponse.ok) {
    const rawBody = await uploadResponse.text();
    return NextResponse.json(
      {
        error: getErrorMessage(
          rawBody,
          `Erreur lors du téléchargement (${uploadResponse.status})`
        ),
      },
      { status: uploadResponse.status }
    );
  }

  const data = (await uploadResponse.json()) as UploadResponse;
  const response = NextResponse.json(data);

  if (refreshedTokens) {
    const maxAge = refreshedTokens.expires_at
      ? Math.max(0, refreshedTokens.expires_at - Math.floor(Date.now() / 1000))
      : 3600;
    response.cookies.set("access_token", refreshedTokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    if (refreshedTokens.refresh_token) {
      response.cookies.set("refresh_token", refreshedTokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 3600,
      });
    }
  }

  return response;
}
