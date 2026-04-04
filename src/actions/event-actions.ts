"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { apiFetch } from "@/lib/api-client";

export async function createEventAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const tiersJson = formData.get("tiers") as string;
  let tiers = [];
  try {
    tiers = JSON.parse(tiersJson || "[]");
  } catch {
    return { error: "Format des tarifs invalide" };
  }

  const body = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    category: formData.get("category") as string,
    venue_name: formData.get("venue_name") as string,
    venue_address: (formData.get("venue_address") as string) || null,
    venue_city: (formData.get("venue_city") as string) || "Dakar",
    starts_at: formData.get("starts_at") as string,
    ends_at: formData.get("ends_at") as string,
    doors_open_at: (formData.get("doors_open_at") as string) || null,
    qr_release_mode: (formData.get("qr_release_mode") as string) || "12h_before_event",
    ticket_design_template: (formData.get("ticket_design_template") as string) || "stadium_classic",
    cover_image_url: (formData.get("cover_image_url") as string) || null,
    allow_transfers: formData.get("allow_transfers") === "on",
    allow_refunds: formData.get("allow_refunds") === "on",
    staffing_mode: (formData.get("staffing_mode") as string) || "organizer_self_staff",
    requested_staff_count: Number(formData.get("requested_staff_count") || 0),
    requested_shift_count: Number(formData.get("requested_shift_count") || 1),
    staffing_notes: (formData.get("staffing_notes") as string) || null,
    currency: "XOF",
    tiers,
  };

  if (!body.title || !body.venue_name || !body.starts_at || !body.ends_at) {
    return { error: "Titre, lieu, date de début et date de fin sont requis" };
  }
  if (tiers.length === 0) {
    return { error: "Au moins un tarif est requis" };
  }

  try {
    const event = await apiFetch<{ id: string }>("/api/events", {
      method: "POST",
      body,
    });
    redirect(`/events/${event.id}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: error instanceof Error ? error.message : "Erreur lors de la création" };
  }
}

export async function updateEventAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const eventId = formData.get("event_id") as string;
  const body: Record<string, unknown> = {};
  const tiersJson = formData.get("tiers") as string;
  let tiers = [];

  try {
    tiers = JSON.parse(tiersJson || "[]");
  } catch {
    return { error: "Format des tarifs invalide" };
  }

  // Required fields — always include if present
  const requiredFields = ["title", "venue_name", "venue_city", "starts_at", "ends_at", "category", "qr_release_mode", "ticket_design_template"];
  for (const field of requiredFields) {
    const value = formData.get(field) as string;
    if (value) {
      body[field] = value;
    }
  }

  // Clearable optional fields — send null when empty to allow clearing
  const clearableFields = ["description", "venue_address", "doors_open_at", "cover_image_url"];
  for (const field of clearableFields) {
    const value = formData.get(field) as string;
    body[field] = value || null;
  }

  // Booleans — unchecked checkboxes don't submit, so explicitly set false
  body.allow_transfers = formData.get("allow_transfers") === "on";
  body.allow_refunds = formData.get("allow_refunds") === "on";
  body.staffing_mode = (formData.get("staffing_mode") as string) || "organizer_self_staff";
  body.requested_staff_count = Number(formData.get("requested_staff_count") || 0);
  body.requested_shift_count = Number(formData.get("requested_shift_count") || 1);
  body.staffing_notes = (formData.get("staffing_notes") as string) || null;
  body.tiers = tiers;

  if (tiers.length === 0) {
    return { error: "Au moins un tarif est requis" };
  }

  try {
    await apiFetch(`/api/events/${eventId}`, { method: "PATCH", body });
    revalidatePath(`/events/${eventId}`);
    redirect(`/events/${eventId}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: error instanceof Error ? error.message : "Erreur lors de la modification" };
  }
}

export async function publishEventAction(eventId: string): Promise<{ error?: string; submittedForReview?: boolean }> {
  try {
    const response = await apiFetch<{ status?: string }>(`/api/events/${eventId}/publish`, { method: "POST" });
    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");
    return response.status === "submitted_for_review"
      ? { submittedForReview: true }
      : {};
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: error instanceof Error ? error.message : "Erreur lors de la publication" };
  }
}

export async function cancelEventAction(eventId: string): Promise<{ error?: string }> {
  try {
    await apiFetch(`/api/events/${eventId}/cancel`, { method: "POST" });
    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");
    return {};
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: error instanceof Error ? error.message : "Erreur lors de l'annulation" };
  }
}
