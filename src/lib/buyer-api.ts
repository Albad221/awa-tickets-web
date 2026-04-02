import "server-only";

import { createHmac, randomUUID } from "node:crypto";

const API_BASE_URL =
  process.env.TICKETS_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8002";

const INTERNAL_API_KEY =
  process.env.TICKETS_INTERNAL_API_KEY ||
  process.env.INTERNAL_API_KEY ||
  "";

const WAVE_WEBHOOK_SECRET =
  process.env.TICKETS_WAVE_WEBHOOK_SECRET ||
  process.env.WAVE_WEBHOOK_SECRET ||
  "";

export const BUYER_LAB_MODE = process.env.BUYER_LAB_MODE === "true";

interface BuyerFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

function buildBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }
  return JSON.stringify(body);
}

async function parseError(response: Response): Promise<never> {
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

export async function publicApiFetch<T>(
  path: string,
  options: BuyerFetchOptions = {}
): Promise<T> {
  const { body, ...init } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    },
    body: buildBody(body),
    cache: "no-store",
  });

  if (!response.ok) {
    await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

function requireInternalApiKey(): string {
  if (!INTERNAL_API_KEY) {
    throw new Error(
      "TICKETS_INTERNAL_API_KEY is not configured on the web app. Buyer test UI cannot place orders without it."
    );
  }
  return INTERNAL_API_KEY;
}

export async function buyerApiFetch<T>(
  path: string,
  phone: string,
  options: BuyerFetchOptions = {}
): Promise<T> {
  const { body, ...init } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": requireInternalApiKey(),
      "X-User-Phone": phone,
      ...(init.headers as Record<string, string> | undefined),
    },
    body: buildBody(body),
    cache: "no-store",
  });

  if (!response.ok) {
    await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

function waveSignature(body: Uint8Array, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export async function simulateWaveCheckout(sessionId: string): Promise<void> {
  if (!BUYER_LAB_MODE) {
    throw new Error("Le simulateur de paiement n'est pas activé dans cet environnement.");
  }
  if (!WAVE_WEBHOOK_SECRET) {
    throw new Error("TICKETS_WAVE_WEBHOOK_SECRET is not configured for the buyer lab.");
  }

  const payload = {
    type: "checkout.session.completed",
    data: {
      id: sessionId,
      payment_id: `web_${randomUUID().slice(0, 12)}`,
    },
  };
  const body = new TextEncoder().encode(JSON.stringify(payload));
  const response = await fetch(`${API_BASE_URL}/api/payments/webhooks/wave`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Wave-Signature": waveSignature(body, WAVE_WEBHOOK_SECRET),
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    await parseError(response);
  }
}
