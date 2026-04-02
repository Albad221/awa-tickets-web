import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BuyerSiteShell } from "@/components/buyer/site-shell";
import { PrintTicketButton } from "@/components/buyer/print-ticket-button";
import { TicketQr } from "@/components/buyer/ticket-qr";
import { buyerApiFetch, publicApiFetch } from "@/lib/buyer-api";
import { getBuyerIdentity } from "@/lib/buyer-session";
import { formatDateTime } from "@/lib/format";
import type { BuyerTicket, Event, TicketTier } from "@/lib/types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function BuyerTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, buyer] = await Promise.all([params, getBuyerIdentity()]);

  if (!buyer?.phone) {
    redirect("/my-tickets");
  }

  let ticket: BuyerTicket;
  try {
    ticket = await buyerApiFetch<BuyerTicket>(`/api/tickets/${id}`, buyer.phone);
  } catch {
    notFound();
  }

  const event = await publicApiFetch<Event & { tiers?: TicketTier[] }>(
    `/api/events/${ticket.event_id}`
  );
  const tiers = event.tiers ?? event.ticket_tiers ?? [];
  const tier = tiers.find((item) => item.id === ticket.tier_id);
  const venue = [event.venue_name, event.venue_city].filter(Boolean).join(", ") || "Lieu à confirmer";

  return (
    <BuyerSiteShell buyer={buyer}>
      <section className="mx-auto max-w-4xl px-4 py-6 sm:py-10 md:px-8 md:py-12 print:max-w-none print:px-0 print:py-0">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <Link
            href="/my-tickets"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-900 hover:border-slate-400 sm:w-auto"
          >
            Retour aux billets
          </Link>
          <PrintTicketButton />
        </div>

        <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)] sm:rounded-[36px] print:rounded-none print:border-0 print:shadow-none">
          <div className="bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] px-5 py-6 text-white sm:px-8 sm:py-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
              AWA Tickets
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">{event.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
              Présentez ce QR code à l’entrée. Vous pouvez enregistrer cette page en PDF depuis le bouton
              « Imprimer / PDF ».
            </p>
          </div>

          <div className="grid gap-6 px-5 py-5 sm:gap-8 sm:px-8 sm:py-8 md:grid-cols-[minmax(0,260px)_1fr] print:grid-cols-[280px_1fr]">
            <div className="space-y-4">
              <TicketQr payload={ticket.qr_payload} size={220} className="mx-auto w-full max-w-[240px] sm:max-w-[280px]" />
              <div className="rounded-3xl bg-slate-50 px-5 py-4 text-center text-sm text-slate-600 sm:text-left">
                <p className="font-semibold text-slate-900">{ticket.ticket_number}</p>
                <p className="mt-1">Statut: {ticket.status}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard label="Événement" value={event.title} />
                <InfoCard label="Tarif" value={tier?.name ?? "Billet"} />
                <InfoCard label="Lieu" value={venue} />
                <InfoCard label="Début" value={formatDateTime(event.starts_at)} />
              </div>

              {event.doors_open_at && (
                <div className="rounded-3xl border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">Ouverture des portes</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {formatDateTime(event.doors_open_at)}
                  </p>
                </div>
              )}

              <div className="rounded-3xl border border-dashed border-slate-300 p-5 text-sm leading-6 text-slate-600">
                <p className="font-semibold text-slate-900">Acheteur</p>
                <p className="mt-2">{buyer.fullName || "Acheteur AWA Tickets"}</p>
                <p>{buyer.phone}</p>
                {buyer.email && <p>{buyer.email}</p>}
              </div>
            </div>
          </div>
        </article>
      </section>
    </BuyerSiteShell>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-sm sm:normal-case sm:tracking-normal">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold leading-6 text-slate-950 sm:text-lg">{value}</p>
    </div>
  );
}
