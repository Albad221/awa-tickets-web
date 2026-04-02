"use client";

import { useActionState } from "react";
import { simulateBuyerPaymentAction } from "@/actions/buyer-actions";

export function SimulatePaymentForm() {
  const [state, formAction, pending] = useActionState(simulateBuyerPaymentAction, null);

  return (
    <form action={formAction} className="space-y-3 rounded-3xl border border-amber-200 bg-amber-50 p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Lab mode
        </p>
        <h3 className="mt-1 text-lg font-semibold text-slate-950">Simuler le webhook Wave</h3>
        <p className="mt-1 text-sm text-slate-600">
          Déclenche la confirmation de paiement côté backend pour vérifier la chaîne complète:
          webhook, émission des billets, callback externe, puis lecture via les endpoints acheteur.
        </p>
      </div>

      {state?.error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Simulation..." : "Simuler le paiement réussi"}
      </button>
    </form>
  );
}
