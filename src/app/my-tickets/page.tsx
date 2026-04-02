import Link from "next/link";
import { clearBuyerIdentityAction } from "@/actions/buyer-actions";
import { BuyerIdentityForm } from "@/components/buyer/buyer-identity-form";
import { BuyerSiteShell } from "@/components/buyer/site-shell";
import { buyerApiFetch } from "@/lib/buyer-api";
import { getBuyerIdentity } from "@/lib/buyer-session";
import { formatCFA, formatDateTime } from "@/lib/format";
import type { BuyerOrder, BuyerTicket } from "@/lib/types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function BuyerTicketsPage() {
  const buyer = await getBuyerIdentity();

  let orders: BuyerOrder[] = [];
  let tickets: BuyerTicket[] = [];
  let loadError: string | null = null;

  if (buyer?.phone) {
    try {
      const [ordersData, ticketsData] = await Promise.all([
        buyerApiFetch<{ orders: BuyerOrder[] }>("/api/users/me/orders", buyer.phone),
        buyerApiFetch<{ tickets: BuyerTicket[] }>("/api/users/me/tickets", buyer.phone),
      ]);
      orders = ordersData.orders;
      tickets = ticketsData.tickets;
    } catch (error) {
      loadError = error instanceof Error ? error.message : "Impossible de charger les billets.";
    }
  }

  return (
    <BuyerSiteShell buyer={buyer}>
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-12 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_1.45fr]">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Wallet acheteur</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Mes billets et commandes</h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Cette page relit les endpoints acheteur avec le numéro sélectionné pour confirmer que les billets sont visibles après paiement.
              </p>
            </div>

            <BuyerIdentityForm buyer={buyer} />

            {buyer?.phone && (
              <form action={clearBuyerIdentityAction}>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-900 hover:border-slate-400"
                >
                  Changer d&apos;acheteur
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            {loadError && (
              <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">{loadError}</div>
            )}

            {!buyer?.phone ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
                Choisissez un acheteur test pour voir ses commandes et ses billets.
              </div>
            ) : (
              <>
                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-slate-950">Commandes</h2>
                    <Link href="/catalog" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
                      Acheter un nouveau billet
                    </Link>
                  </div>
                  <div className="mt-5 space-y-3">
                    {orders.length === 0 ? (
                      <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-600">
                        Aucune commande pour cet acheteur.
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div key={order.id} className="rounded-3xl border border-slate-200 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm text-slate-500">{order.order_number}</p>
                              <p className="mt-1 text-lg font-semibold text-slate-950">
                                {order.total === 0 ? "Gratuit" : formatCFA(order.total)}
                              </p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                              {order.status}
                            </span>
                          </div>
                          <div className="mt-3 text-sm text-slate-600">
                            {order.quantity} billet(s) · créé le {formatDateTime(order.created_at)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-semibold text-slate-950">Billets</h2>
                  <div className="mt-5 space-y-3">
                    {tickets.length === 0 ? (
                      <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-600">
                        Aucun billet visible pour le moment. Si le paiement est en cours, revenez après la confirmation.
                      </div>
                    ) : (
                      tickets.map((ticket) => (
                        <div key={ticket.id} className="rounded-3xl border border-slate-200 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm text-slate-500">{ticket.ticket_number}</p>
                              <p className="mt-1 text-lg font-semibold text-slate-950">
                                {ticket.events?.title || "Billet"}
                              </p>
                            </div>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                              {ticket.status}
                            </span>
                          </div>
                          <div className="mt-3 space-y-1 text-sm text-slate-600">
                            <p>{ticket.events?.venue_name || "Lieu à confirmer"} · {ticket.events?.venue_city || "—"}</p>
                            {ticket.events?.starts_at && <p>{formatDateTime(ticket.events.starts_at)}</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </BuyerSiteShell>
  );
}
