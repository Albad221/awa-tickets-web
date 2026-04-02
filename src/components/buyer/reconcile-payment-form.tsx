"use client";

import { useActionState } from "react";
import { reconcileBuyerPaymentAction } from "@/actions/buyer-actions";

export function ReconcilePaymentForm() {
  const [state, formAction, pending] = useActionState(reconcileBuyerPaymentAction, null);

  return (
    <form action={formAction} className="space-y-3 rounded-3xl border border-sky-200 bg-sky-50 p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
          Vérification
        </p>
        <h3 className="mt-1 text-lg font-semibold text-slate-950">Confirmer le paiement</h3>
        <p className="mt-1 text-sm text-slate-600">
          Si Wave a débité mais que le webhook est en retard, ce bouton interroge le provider
          et finalise la commande côté backend.
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
        {pending ? "Vérification..." : "Vérifier le paiement"}
      </button>
    </form>
  );
}
