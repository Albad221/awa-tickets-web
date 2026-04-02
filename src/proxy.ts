import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.TICKETS_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8002";

const PUBLIC_PATHS = ["/", "/catalog", "/checkout", "/my-tickets", "/login", "/register", "/auth/"];
const PROTECTED_PATHS = ["/events", "/profile", "/payouts", "/settings"];

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => (p === "/" ? pathname === "/" : pathname.startsWith(p)))
  ) {
    return NextResponse.next();
  }

  if (!PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (accessToken) {
    return NextResponse.next();
  }

  // Access token missing but refresh token exists → refresh
  if (refreshToken) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshResponse.ok) {
        const tokens = await refreshResponse.json();

        const expiresAt = tokens.expires_at;
        const maxAge = expiresAt
          ? Math.max(0, expiresAt - Math.floor(Date.now() / 1000))
          : 3600;

        request.cookies.set("access_token", tokens.access_token);
        if (tokens.refresh_token) {
          request.cookies.set("refresh_token", tokens.refresh_token);
        }

        const response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set("access_token", tokens.access_token, cookieOptions(maxAge));
        if (tokens.refresh_token) {
          response.cookies.set("refresh_token", tokens.refresh_token, cookieOptions(30 * 24 * 3600));
        }
        return response;
      }

      // Refresh returned non-OK: distinguish auth rejection (401/403) from transient failure
      if (refreshResponse.status === 401 || refreshResponse.status === 403) {
        // Token is genuinely invalid/expired — force logout
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("access_token");
        response.cookies.delete("refresh_token");
        return response;
      }

      // Server error (500, 502, etc.) — let the request through without token.
      // The page will get a 401 from apiFetch and show the error boundary,
      // but the user keeps their refresh token for the next request.
      return NextResponse.next();
    } catch {
      // Network error — transient. Let the request through; don't clear cookies.
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
