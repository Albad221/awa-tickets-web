import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { apiFetch } from "./api-client";
import type { OrganizerSession } from "./types";

export async function getSession(): Promise<{
  accessToken: string | undefined;
  refreshToken: string | undefined;
}> {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get("access_token")?.value,
    refreshToken: cookieStore.get("refresh_token")?.value,
  };
}

export async function requireSession(): Promise<OrganizerSession> {
  const { accessToken, refreshToken } = await getSession();

  if (!accessToken && !refreshToken) {
    // No tokens at all — genuinely unauthenticated
    redirect("/login");
  }

  if (!accessToken && refreshToken) {
    // Refresh token exists but access token is missing — this means the proxy
    // tried to refresh and failed (transient backend/network error). Throw an
    // error so the dashboard error boundary shows "Erreur + Réessayer" instead
    // of silently redirecting to login and losing the refresh token.
    throw new Error("Session temporairement indisponible. Veuillez réessayer.");
  }

  // Has access token — call the backend
  // apiFetch redirects to /login on 401 (genuinely expired/invalid token).
  // Other errors (500, network) propagate to the error boundary.
  return await apiFetch<OrganizerSession>("/api/organizers/me");
}
