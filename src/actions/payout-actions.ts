"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { apiFetch } from "@/lib/api-client";

export async function withdrawAction(): Promise<{ error?: string }> {
  try {
    await apiFetch("/api/payouts/me/withdraw", { method: "POST" });
    revalidatePath("/payouts");
    return {};
  } catch (error) {
    // Re-throw Next.js redirect exceptions (from apiFetch 401 → redirect("/login"))
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Erreur lors du retrait" };
  }
}
