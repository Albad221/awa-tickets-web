"use client";

import { useActionState } from "react";
import { saveBuyerIdentityAction } from "@/actions/buyer-actions";
import type { BuyerIdentity } from "@/lib/buyer-session";

export function BuyerIdentityForm({ buyer }: { buyer: BuyerIdentity | null }) {
  const [state, formAction, pending] = useActionState(saveBuyerIdentityAction, null);

  return (
    <form action={formAction} className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Choisir l&apos;acheteur test</h2>
        <p className="mt-1 text-sm text-slate-600">
          Le portail utilisera ce numéro pour appeler les endpoints acheteur via la même auth proxy que votre agent IA.
        </p>
      </div>

      {state?.error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Téléphone</span>
          <input
            name="phone"
            required
            defaultValue={buyer?.phone || "+221771234567"}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Nom</span>
          <input
            name="full_name"
            defaultValue={buyer?.fullName || ""}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Email</span>
          <input
            name="email"
            type="email"
            defaultValue={buyer?.email || ""}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Utiliser cet acheteur"}
      </button>
    </form>
  );
}
