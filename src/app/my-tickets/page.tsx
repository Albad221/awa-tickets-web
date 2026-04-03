import Link from "next/link";
import { clearBuyerIdentityAction } from "@/actions/buyer-actions";
import { BuyerIdentityForm } from "@/components/buyer/buyer-identity-form";
import { BuyerSiteShell } from "@/components/buyer/site-shell";
import { TicketQr } from "@/components/buyer/ticket-qr";
import { buyerApiFetch } from "@/lib/buyer-api";
import { getBuyerIdentity } from "@/lib/buyer-session";
import { formatCFA, formatDateTime, formatRelative } from "@/lib/format";
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
                          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                            {ticket.qr_available && ticket.qr_payload ? (
                              <TicketQr payload={ticket.qr_payload} size={180} className="mx-auto md:mx-0" />
                            ) : (
                              <div className="mx-auto flex h-[180px] w-[180px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500 md:mx-0">
                                QR disponible {ticket.qr_release_at ? formatRelative(ticket.qr_release_at) : "12h avant l'événement"}
                              </div>
                            )}
                            <div>
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm text-slate-500">{ticket.ticket_number}</p>
                                  <p className="mt-1 text-lg font-semibold text-slate-950">
                                    {ticket.event?.title || ticket.events?.title || "Billet"}
                                  </p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusBadgeClass(ticket.delivery_state)}`}>
                                  {statusLabel(ticket.delivery_state, ticket.status)}
                                </span>
                              </div>
                              <div className="mt-3 space-y-1 text-sm text-slate-600">
                                <p>{ticket.event?.venue_name || ticket.events?.venue_name || "Lieu à confirmer"} · {ticket.event?.venue_city || ticket.events?.venue_city || "—"}</p>
                                {(ticket.event?.starts_at || ticket.events?.starts_at) && (
                                  <p>{formatDateTime(ticket.event?.starts_at || ticket.events?.starts_at || "")}</p>
                                )}
                                {ticket.entry_gates?.length ? (
                                  <p>Portes : {ticket.entry_gates.join(" / ")}</p>
                                ) : null}
                                {!ticket.qr_available && ticket.qr_release_at ? (
                                  <p>QR disponible {formatRelative(ticket.qr_release_at)}</p>
                                ) : null}
                              </div>
                              <div className="mt-4 flex flex-wrap gap-3">
                                <Link
                                  href={`/my-tickets/${ticket.id}`}
                                  className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                  Voir le billet
                                </Link>
                                <Link
                                  href={ticket.pdf_url || `/api/buyer/tickets/${ticket.id}/pdf`}
                                  target="_blank"
                                  className="inline-flex h-10 items-center justify-center rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-900 hover:border-slate-400"
                                >
                                  Télécharger PDF
                                </Link>
                              </div>
                            </div>
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

function statusLabel(deliveryState?: string, fallbackStatus?: string): string {
  switch (deliveryState) {
    case "issued_qr_locked":
      return "QR bientôt";
    case "issued_qr_ready":
      return "QR disponible";
    case "used":
      return "Utilisé";
    case "cancelled":
      return "Annulé";
    case "paid_issuing":
      return "Émission";
    case "awaiting_payment":
      return "Paiement";
    default:
      return fallbackStatus || "Billet";
  }
}

function statusBadgeClass(deliveryState?: string): string {
  switch (deliveryState) {
    case "issued_qr_locked":
      return "bg-amber-100 text-amber-700";
    case "issued_qr_ready":
      return "bg-emerald-100 text-emerald-700";
    case "used":
      return "bg-slate-200 text-slate-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "paid_issuing":
      return "bg-sky-100 text-sky-700";
    case "awaiting_payment":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-emerald-100 text-emerald-700";
  }
}
