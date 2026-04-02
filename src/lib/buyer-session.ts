import "server-only";

import { cookies } from "next/headers";
import type { CheckoutState } from "@/lib/types";

const BUYER_PHONE_COOKIE = "buyer_phone";
const BUYER_NAME_COOKIE = "buyer_name";
const BUYER_EMAIL_COOKIE = "buyer_email";
const BUYER_CHECKOUT_COOKIE = "buyer_checkout";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export interface BuyerIdentity {
  phone: string;
  fullName: string | null;
  email: string | null;
}

export async function getBuyerIdentity(): Promise<BuyerIdentity | null> {
  const store = await cookies();
  const phone = store.get(BUYER_PHONE_COOKIE)?.value;
  if (!phone) {
    return null;
  }

  return {
    phone,
    fullName: store.get(BUYER_NAME_COOKIE)?.value || null,
    email: store.get(BUYER_EMAIL_COOKIE)?.value || null,
  };
}

export async function saveBuyerIdentity(input: BuyerIdentity): Promise<void> {
  const store = await cookies();
  store.set(BUYER_PHONE_COOKIE, input.phone, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 3600 });
  if (input.fullName) {
    store.set(BUYER_NAME_COOKIE, input.fullName, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 3600 });
  } else {
    store.delete(BUYER_NAME_COOKIE);
  }
  if (input.email) {
    store.set(BUYER_EMAIL_COOKIE, input.email, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 3600 });
  } else {
    store.delete(BUYER_EMAIL_COOKIE);
  }
}

export async function clearBuyerIdentity(): Promise<void> {
  const store = await cookies();
  store.delete(BUYER_PHONE_COOKIE);
  store.delete(BUYER_NAME_COOKIE);
  store.delete(BUYER_EMAIL_COOKIE);
  store.delete(BUYER_CHECKOUT_COOKIE);
}

export async function getCheckoutState(): Promise<CheckoutState | null> {
  const store = await cookies();
  const raw = store.get(BUYER_CHECKOUT_COOKIE)?.value;
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as CheckoutState;
  } catch {
    return null;
  }
}

export async function saveCheckoutState(state: CheckoutState): Promise<void> {
  const store = await cookies();
  store.set(BUYER_CHECKOUT_COOKIE, JSON.stringify(state), {
    ...COOKIE_OPTIONS,
    maxAge: 6 * 3600,
  });
}

export async function clearCheckoutState(): Promise<void> {
  const store = await cookies();
  store.delete(BUYER_CHECKOUT_COOKIE);
}
