"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { buyerApiFetch, simulateWaveCheckout } from "@/lib/buyer-api";
import {
  clearBuyerIdentity,
  getBuyerIdentity,
  getCheckoutState,
  saveBuyerIdentity,
  saveCheckoutState,
} from "@/lib/buyer-session";
import type { BuyerOrder, CheckoutState } from "@/lib/types";

type ActionState = { error?: string } | null;

export async function saveBuyerIdentityAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const phone = (formData.get("phone") as string | null)?.trim() || "";
  const fullName = (formData.get("full_name") as string | null)?.trim() || null;
  const email = (formData.get("email") as string | null)?.trim() || null;

  if (!phone) {
    return { error: "Le numéro de téléphone est requis." };
  }

  await saveBuyerIdentity({ phone, fullName, email });
  revalidatePath("/my-tickets");
  redirect("/my-tickets");
}

export async function clearBuyerIdentityAction(): Promise<void> {
  await clearBuyerIdentity();
  redirect("/");
}

export async function startBuyerCheckoutAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const eventId = (formData.get("event_id") as string | null)?.trim() || "";
  const eventTitle = (formData.get("event_title") as string | null)?.trim() || "Événement";
  const tierId = (formData.get("tier_id") as string | null)?.trim() || "";
  const tierName = (formData.get("tier_name") as string | null)?.trim() || "Tarif";
  const phone = (formData.get("phone") as string | null)?.trim() || "";
  const fullName = (formData.get("full_name") as string | null)?.trim() || null;
  const email = (formData.get("email") as string | null)?.trim() || null;
  const quantity = Number(formData.get("quantity") || 1);
  const total = Number(formData.get("total") || 0);
  const currency = (formData.get("currency") as string | null)?.trim() || "XOF";

  if (!eventId || !tierId || !phone || !Number.isFinite(quantity) || quantity < 1) {
    return { error: "Sélectionnez un tarif, une quantité valide et un numéro de téléphone." };
  }

  try {
    await saveBuyerIdentity({ phone, fullName, email });

    const order = await buyerApiFetch<BuyerOrder>("/api/orders", phone, {
      method: "POST",
      body: {
        event_id: eventId,
        tier_id: tierId,
        quantity,
        payment_method: "wave",
        idempotency_key: randomUUID(),
      },
    });

    if (fullName || email) {
      await buyerApiFetch("/api/users/me", phone, {
        method: "PATCH",
        body: {
          full_name: fullName,
          email,
        },
      });
    }

    const checkout = await buyerApiFetch<{
      payment_id: string;
      provider_session_id: string;
      wave_launch_url?: string | null;
      status: string;
    }>("/api/payments/checkout", phone, {
      method: "POST",
      body: { order_id: order.id },
    });

    const checkoutState: CheckoutState = {
      orderId: order.id,
      orderNumber: order.order_number,
      eventId,
      eventTitle,
      tierName,
      quantity,
      total: total || order.total,
      currency,
      paymentId: checkout.payment_id,
      providerSessionId: checkout.provider_session_id,
      waveLaunchUrl: checkout.wave_launch_url ?? null,
    };
    await saveCheckoutState(checkoutState);

    redirect("/checkout");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return {
      error:
        error instanceof Error
          ? error.message
          : "Impossible de démarrer le paiement pour le moment.",
    };
  }
}

export async function simulateBuyerPaymentAction(): Promise<ActionState> {
  const identity = await getBuyerIdentity();
  const checkout = await getCheckoutState();

  if (!identity?.phone || !checkout?.providerSessionId) {
    return { error: "Aucun paiement en attente à simuler." };
  }

  try {
    await simulateWaveCheckout(checkout.providerSessionId);
    revalidatePath("/checkout");
    revalidatePath("/my-tickets");
    return null;
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return {
      error:
        error instanceof Error
          ? error.message
          : "La simulation du paiement a échoué.",
    };
  }
}

export async function reconcileBuyerPaymentAction(): Promise<ActionState> {
  const identity = await getBuyerIdentity();
  const checkout = await getCheckoutState();

  if (!identity?.phone || !checkout?.paymentId) {
    return { error: "Aucun paiement à vérifier." };
  }

  try {
    await buyerApiFetch(`/api/payments/${checkout.paymentId}/reconcile`, identity.phone, {
      method: "POST",
    });
    revalidatePath("/checkout");
    revalidatePath("/my-tickets");
    return null;
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return {
      error:
        error instanceof Error
          ? error.message
          : "Impossible de vérifier le paiement pour le moment.",
    };
  }
}
