"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { apiFetch } from "@/lib/api-client";

export async function createScanSessionAction(
  _prevState: { error?: string; session?: { token: string; scan_url: string; gate_name: string } } | null,
  formData: FormData
): Promise<{ error?: string; session?: { token: string; scan_url: string; gate_name: string } } | null> {
  const eventId = formData.get("event_id") as string;
  const gateName = formData.get("gate_name") as string;
  const deviceLabel = (formData.get("device_label") as string) || null;
  const expiresInHours = parseInt(formData.get("expires_in_hours") as string) || 12;

  if (!gateName) {
    return { error: "Nom du point d'entrée requis" };
  }

  try {
    const session = await apiFetch<{ token: string; scan_url: string; gate_name: string }>(
      "/api/scan/sessions",
      {
        method: "POST",
        body: { event_id: eventId, gate_name: gateName, device_label: deviceLabel, expires_in_hours: expiresInHours },
      }
    );
    revalidatePath(`/events/${eventId}/scan`);
    return { session };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: error instanceof Error ? error.message : "Erreur lors de la création" };
  }
}

export async function revokeScanSessionAction(sessionId: string, eventId: string): Promise<{ error?: string }> {
  try {
    await apiFetch(`/api/scan/sessions/${sessionId}`, { method: "DELETE" });
    revalidatePath(`/events/${eventId}/scan`);
    return {};
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: error instanceof Error ? error.message : "Erreur lors de la révocation" };
  }
}
