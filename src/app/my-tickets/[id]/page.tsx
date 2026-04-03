import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BuyerSiteShell } from "@/components/buyer/site-shell";
import { PrintTicketButton } from "@/components/buyer/print-ticket-button";
import { TicketQr } from "@/components/buyer/ticket-qr";
import { buyerApiFetch } from "@/lib/buyer-api";
import { getBuyerIdentity } from "@/lib/buyer-session";
import { formatCFA, formatDateTime, formatRelative } from "@/lib/format";
import { getTicketDesignPreset } from "@/lib/ticket-designs";
import type { BuyerTicket } from "@/lib/types";

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

  const event = ticket.event;
  if (!event) {
    notFound();
  }

  const tier = ticket.tier;
  const venue = [event.venue_name, event.venue_city].filter(Boolean).join(", ") || "Lieu à confirmer";
  const priceLabel =
    typeof tier?.price === "number"
      ? tier.currency === "XOF"
        ? formatCFA(tier.price)
        : `${tier.price} ${tier.currency}`
      : null;
  const status = statusMeta(ticket.delivery_state, ticket.status);
  const category = event.category || "Billet événement";
  const design = getTicketDesignPreset(event.ticket_design_template, event.category);
  const qrAvailability = ticket.qr_available
    ? "Disponible maintenant"
    : ticket.qr_release_at
      ? `Ouverture ${formatRelative(ticket.qr_release_at)}`
      : "12h avant l'événement";
  const heroBackground = event.cover_image_url
    ? `${design.heroGradient}, url(${event.cover_image_url})`
    : design.heroGradient;

  return (
    <BuyerSiteShell buyer={buyer}>
      <section className="mx-auto max-w-5xl px-4 py-6 sm:py-10 md:px-8 md:py-12 print:max-w-none print:px-0 print:py-0">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <Link
            href="/my-tickets"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-900 hover:border-slate-400 sm:w-auto"
          >
            Retour aux billets
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={ticket.pdf_url || `/api/buyer/tickets/${ticket.id}/pdf`}
              target="_blank"
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 hover:border-slate-400"
            >
              Télécharger PDF
            </Link>
            <PrintTicketButton />
          </div>
        </div>

        <article className={`relative overflow-hidden rounded-[28px] border shadow-[0_40px_100px_-52px_rgba(15,23,42,0.45)] sm:rounded-[40px] print:rounded-none print:border-0 print:bg-white print:shadow-none ${design.articleClass}`}>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-cover bg-center print:hidden"
            style={{ backgroundImage: heroBackground }}
          />
          <div className={`pointer-events-none absolute inset-x-0 top-0 h-48 print:hidden ${design.heroOverlayClass}`} />
          <div className="pointer-events-none absolute -left-16 top-20 h-44 w-44 rounded-full bg-white/10 blur-3xl print:hidden" />
          <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-amber-300/10 blur-3xl print:hidden" />

          <div className="relative px-5 pb-5 pt-5 sm:px-8 sm:pb-8 sm:pt-8">
            <div className={`flex flex-wrap items-start justify-between gap-4 ${design.heroTextClass}`}>
              <div className="max-w-2xl">
                <p className={`text-xs font-semibold uppercase tracking-[0.32em] ${design.heroMutedClass}`}>AWA Tickets</p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">{event.title}</h1>
                <p className={`mt-3 max-w-xl text-sm leading-6 sm:text-base ${design.heroMutedClass}`}>
                  {ticket.qr_available
                    ? "Votre billet est actif. Présentez ce QR à l’entrée ou gardez le PDF officiel hors ligne."
                    : "Votre billet est confirmé. Conservez ce pass ; le QR s’affichera automatiquement quand la fenêtre d’ouverture commencera."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 self-start">
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${design.pillClass}`}>
                  {category}
                </span>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${status.badgeClass}`}>
                  {status.label}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr] print:mt-4 print:grid-cols-[320px_1fr]">
              <div className={`rounded-[30px] p-4 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.85)] sm:p-5 print:border print:border-slate-200 ${design.passShellClass}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`text-[11px] uppercase tracking-[0.28em] ${design.heroMutedClass}`}>Pass mobile</p>
                    <p className="mt-1 text-lg font-semibold">{tier?.name ?? "Billet"}</p>
                  </div>
                  {priceLabel ? (
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${design.pricePillClass}`}>
                      {priceLabel}
                    </span>
                  ) : null}
                </div>

                <div className={`mt-4 rounded-[28px] p-4 shadow-inner sm:p-5 ${design.passCardClass}`}>
                  {ticket.qr_available && ticket.qr_payload ? (
                    <TicketQr payload={ticket.qr_payload} size={240} className="mx-auto w-full max-w-[260px]" />
                  ) : (
                    <div className="mx-auto flex min-h-[260px] w-full max-w-[260px] flex-col items-center justify-center rounded-[28px] border border-dashed border-amber-300 bg-amber-50 px-6 text-center">
                      <span className="rounded-full bg-amber-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900">
                        QR verrouillé
                      </span>
                      <p className="mt-4 text-sm font-semibold text-slate-900">
                        QR disponible {ticket.qr_release_at ? formatRelative(ticket.qr_release_at) : "12h avant l'événement"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Le billet reste valable. Le même QR apparaîtra ici, dans le lien ticket et dans le PDF.
                      </p>
                    </div>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <PassStat label="Ticket" value={ticket.ticket_number} />
                    <PassStat label="Portes" value={ticket.entry_gates?.join(" / ") || "À confirmer"} />
                    <PassStat label="Début" value={formatDateTime(event.starts_at)} />
                    <PassStat label="Lieu" value={event.venue_name || "À confirmer"} />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoCard label="Date et heure" value={formatDateTime(event.starts_at)} accent={design.infoCardTone} />
                  <InfoCard label="Lieu" value={venue} accent={design.infoCardTone} />
                  <InfoCard label="Tarif" value={tier?.name ?? "Billet"} accent={design.infoCardTone} />
                  <InfoCard
                    label="Ouverture des portes"
                    value={event.doors_open_at ? formatDateTime(event.doors_open_at) : "À confirmer"}
                    accent={design.infoCardTone}
                  />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-[28px] border border-slate-200 bg-white/80 p-5 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Lecture rapide</p>
                    <div className="mt-4 space-y-3">
                      <QuickRow label="Statut du billet" value={status.labelLong} />
                      <QuickRow label="Politique QR" value={qrAvailability} />
                      <QuickRow label="Accès" value={ticket.entry_gates?.join(" / ") || "Portes communiquées plus tard"} />
                      {priceLabel ? <QuickRow label="Montant payé" value={priceLabel} /> : null}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-5 text-sm leading-6 text-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Acheteur</p>
                    <p className="mt-3 text-base font-semibold text-slate-950">{buyer.fullName || "Acheteur AWA Tickets"}</p>
                    <p>{buyer.phone}</p>
                    {buyer.email && <p>{buyer.email}</p>}
                  </div>
                </div>

                <div
                  className={`rounded-[28px] p-5 text-sm leading-6 ${
                    ticket.qr_available
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border border-amber-200 bg-amber-50 text-amber-900"
                  }`}
                >
                  <p className="font-semibold">
                    {ticket.qr_available ? "Billet prêt pour l’entrée" : "Billet confirmé, QR différé"}
                  </p>
                  <p className="mt-2">
                    {ticket.qr_available
                      ? "Conservez ce pass, le lien ticket et le PDF dans vos favoris. Le même QR est exposé dans tous les supports."
                      : `Le QR est masqué pour limiter le partage avant l’événement. Il deviendra visible ${ticket.qr_release_at ? formatRelative(ticket.qr_release_at) : "12h avant l'événement"}.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>
    </BuyerSiteShell>
  );
}

function InfoCard({
  label,
  value,
  accent = "slate",
}: {
  label: string;
  value: string;
  accent?: "blue" | "amber" | "slate";
}) {
  const accentClass =
    accent === "blue"
      ? "bg-blue-50 text-blue-700"
      : accent === "amber"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4 backdrop-blur-sm sm:p-5">
      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${accentClass}`}>
        {label}
      </span>
      <p className="mt-3 text-base font-semibold leading-6 text-slate-950 sm:text-lg">{value}</p>
    </div>
  );
}

function PassStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-100/90 px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function QuickRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-950 sm:text-right">{value}</p>
    </div>
  );
}

function statusMeta(
  deliveryState?: string,
  fallbackStatus?: string,
): { label: string; labelLong: string; badgeClass: string } {
  switch (deliveryState) {
    case "issued_qr_locked":
      return {
        label: "QR bientôt",
        labelLong: "Billet confirmé · QR disponible avant l’événement",
        badgeClass: "bg-amber-300 text-slate-950",
      };
    case "issued_qr_ready":
      return {
        label: "QR prêt",
        labelLong: "Billet confirmé · QR disponible maintenant",
        badgeClass: "bg-emerald-300 text-slate-950",
      };
    case "used":
      return {
        label: "Utilisé",
        labelLong: "Billet déjà scanné",
        badgeClass: "bg-slate-200 text-slate-900",
      };
    case "cancelled":
      return {
        label: "Annulé",
        labelLong: "Billet annulé",
        badgeClass: "bg-red-300 text-slate-950",
      };
    case "paid_issuing":
      return {
        label: "Émission",
        labelLong: "Paiement reçu · émission en cours",
        badgeClass: "bg-sky-300 text-slate-950",
      };
    case "awaiting_payment":
      return {
        label: "Paiement",
        labelLong: "En attente de paiement",
        badgeClass: "bg-white/20 text-white",
      };
    default:
      return {
        label: fallbackStatus || "Billet",
        labelLong: fallbackStatus || "Billet",
        badgeClass: "bg-emerald-300 text-slate-950",
      };
  }
}
