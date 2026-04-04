"use client";

import { useActionState, useMemo, useState } from "react";
import { startBuyerCheckoutAction } from "@/actions/buyer-actions";
import { calculateServiceFee, formatCFA } from "@/lib/format";
import type { BuyerIdentity } from "@/lib/buyer-session";
import type { Event, TicketTier } from "@/lib/types";

function visibleTiers(event: Event): TicketTier[] {
  return (event.tiers || event.ticket_tiers || []).filter((tier) => tier.is_visible !== false);
}

export function PurchasePanel({
  event,
  buyer,
}: {
  event: Event;
  buyer: BuyerIdentity | null;
}) {
  const tiers = visibleTiers(event);
  const [selectedTierId, setSelectedTierId] = useState(tiers[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [state, formAction, pending] = useActionState(startBuyerCheckoutAction, null);

  const selectedTier = useMemo(
    () => tiers.find((tier) => tier.id === selectedTierId) || tiers[0] || null,
    [tiers, selectedTierId]
  );

  const maxQuantity = selectedTier ? Math.min(selectedTier.max_per_order, selectedTier.available ?? selectedTier.capacity) : 1;
  const effectiveQuantity = Math.min(quantity, Math.max(1, maxQuantity));
  const subtotal = selectedTier ? selectedTier.price * effectiveQuantity : 0;
  const effectiveFeePercent = event.effective_fee_percent ?? 7;
  const effectiveFeeMin = event.effective_fee_min_xof ?? 100;
  const serviceFee = calculateServiceFee(subtotal, effectiveFeePercent, effectiveFeeMin);
  const total = subtotal + serviceFee;

  return (
    <form action={formAction} className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.45)]">
      <input type="hidden" name="event_id" value={event.id} />
      <input type="hidden" name="event_title" value={event.title} />
      <input type="hidden" name="tier_id" value={selectedTier?.id || ""} />
      <input type="hidden" name="tier_name" value={selectedTier?.name || ""} />
      <input type="hidden" name="currency" value={selectedTier?.currency || event.currency} />
      <input type="hidden" name="total" value={total} />

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Achat test</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Acheter ce billet</h2>
        <p className="mt-1 text-sm text-slate-600">
          Cette interface appelle les mêmes endpoints HTTP que l&apos;agent IA utiliserait côté serveur.
        </p>
      </div>

      {state?.error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      <div className="space-y-3">
        <span className="text-sm font-medium text-slate-700">Tarif</span>
        <div className="space-y-2">
          {tiers.map((tier) => {
            const available = tier.available ?? Math.max(0, tier.capacity - tier.sold_count);
            const checked = tier.id === selectedTier?.id;
            return (
              <label
                key={tier.id}
                className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition ${
                  checked ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="font-medium text-slate-950">{tier.name}</div>
                  <div className="text-sm text-slate-600">
                    {tier.price === 0 ? "Gratuit" : formatCFA(tier.price)} · {available} dispo
                  </div>
                </div>
                <input
                  type="radio"
                  name="tier_picker"
                  checked={checked}
                  onChange={() => {
                    setSelectedTierId(tier.id);
                    setQuantity(Math.min(quantity, Math.max(1, Math.min(tier.max_per_order, available))));
                  }}
                  className="h-4 w-4"
                />
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
          <span className="font-medium text-slate-700">Quantité</span>
          <input
            name="quantity"
            type="number"
            min={1}
            max={maxQuantity}
            value={effectiveQuantity}
            onChange={(event) => setQuantity(Number(event.target.value || 1))}
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

      <div className="rounded-2xl bg-slate-950 p-5 text-white">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-slate-300">Montant estimé</p>
            <p className="mt-1 text-3xl font-semibold">
              {selectedTier ? (selectedTier.price === 0 ? "Gratuit" : formatCFA(total)) : "—"}
            </p>
            {selectedTier && selectedTier.price > 0 && (
              <div className="mt-3 space-y-1 text-xs text-slate-300">
                <p>Sous-total : {formatCFA(subtotal)}</p>
                <p>Frais AWA estimés : {formatCFA(serviceFee)} ({effectiveFeePercent}% min {formatCFA(effectiveFeeMin)})</p>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={pending || !selectedTier}
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 hover:bg-slate-100 disabled:opacity-50"
          >
            {pending ? "Création..." : "Créer la commande"}
          </button>
        </div>
      </div>
    </form>
  );
}
