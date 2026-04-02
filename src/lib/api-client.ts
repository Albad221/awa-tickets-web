import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE_URL =
  process.env.TICKETS_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8002";

export { API_BASE_URL };

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401) {
      redirect("/login");
    }

    const errorBody = await response.text();
    let detail = `API error ${response.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      detail = parsed.detail || parsed.message || detail;
    } catch {
      // keep default
    }
    throw new Error(detail);
  }

  return response.json();
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, ...init } = options;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    // On 401, redirect to login. Token refresh is handled by middleware.ts.
    if (response.status === 401) {
      redirect("/login");
    }

    const errorBody = await response.text();
    let detail = `API error ${response.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      detail = parsed.detail || parsed.message || detail;
    } catch {
      // keep default
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
