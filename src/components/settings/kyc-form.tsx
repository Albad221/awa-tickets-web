"use client";

import { useActionState } from "react";
import { submitKycAction } from "@/actions/organizer-actions";

export function KycForm() {
  const [state, formAction, pending] = useActionState(submitKycAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          Vérification soumise. Vous serez notifié du résultat.
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        La vérification KYC est requise pour recevoir des paiements.
        Utilisez Smile ID pour compléter la vérification, puis entrez l&apos;identifiant ci-dessous.
      </p>

      <div className="space-y-2">
        <label htmlFor="job_id" className="text-sm font-medium">Identifiant Smile ID</label>
        <input id="job_id" name="job_id" required placeholder="smile-job-xxxxx" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <button type="submit" disabled={pending} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {pending ? "..." : "Soumettre la vérification"}
      </button>
    </form>
  );
}
