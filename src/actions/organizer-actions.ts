"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { apiFetch } from "@/lib/api-client";

export async function updateProfileAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  const body: Record<string, unknown> = {};

  // Required field — always include
  const displayName = formData.get("display_name") as string;
  if (displayName) body.display_name = displayName;

  // Payout method — always include (select always has a value)
  const payoutMethod = formData.get("payout_method") as string;
  if (payoutMethod) body.payout_method = payoutMethod;

  // Clearable optional fields — send null when empty to allow clearing
  const clearableFields = ["description", "payout_phone", "logo_url"];
  for (const field of clearableFields) {
    const value = formData.get(field) as string;
    body[field] = value || null;
  }

  try {
    await apiFetch("/api/organizers/me", { method: "PATCH", body });
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: error instanceof Error ? error.message : "Erreur lors de la mise à jour" };
  }
}

export async function submitKycAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  const jobId = formData.get("job_id") as string;
  if (!jobId) {
    return { error: "Identifiant de vérification requis" };
  }

  try {
    await apiFetch("/api/organizers/me/kyc", {
      method: "POST",
      body: { job_id: jobId },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: error instanceof Error ? error.message : "Erreur lors de la soumission KYC" };
  }
}
