"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/actions/organizer-actions";
import type { OrganizerSession } from "@/lib/types";

interface ProfileFormProps {
  organizer: OrganizerSession;
}

export function ProfileForm({ organizer }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfileAction, null);

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      {state?.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          Profil mis à jour.
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="display_name" className="text-sm font-medium">Nom affiché</label>
        <input id="display_name" name="display_name" defaultValue={organizer.display_name} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <textarea id="description" name="description" rows={3} defaultValue={organizer.description || ""} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label htmlFor="logo_url" className="text-sm font-medium">URL du logo</label>
        <input id="logo_url" name="logo_url" type="url" defaultValue={organizer.logo_url || ""} placeholder="https://..." className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label htmlFor="payout_phone" className="text-sm font-medium">Téléphone de paiement</label>
        <input id="payout_phone" name="payout_phone" type="tel" defaultValue={organizer.payout_phone || ""} placeholder="+221 77 123 45 67" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label htmlFor="payout_method" className="text-sm font-medium">Méthode de paiement</label>
        <select id="payout_method" name="payout_method" defaultValue={organizer.payout_method || "wave"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="wave">Wave</option>
          <option value="orange_money">Orange Money</option>
          <option value="bank_transfer">Virement bancaire</option>
        </select>
      </div>

      <button type="submit" disabled={pending} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {pending ? "..." : "Enregistrer"}
      </button>
    </form>
  );
}
