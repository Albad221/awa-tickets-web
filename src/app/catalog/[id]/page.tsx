import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, MapPin, ShieldCheck, Ticket } from "lucide-react";
import { PurchasePanel } from "@/components/buyer/purchase-panel";
import { BuyerSiteShell } from "@/components/buyer/site-shell";
import { publicApiFetch } from "@/lib/buyer-api";
import { getBuyerIdentity } from "@/lib/buyer-session";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatCFA, formatDateTime } from "@/lib/format";
import type { Event } from "@/lib/types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [buyer, event] = await Promise.all([
    getBuyerIdentity(),
    publicApiFetch<Event>(`/api/events/${id}`),
  ]);

  const tiers = (event.tiers || event.ticket_tiers || []).filter((tier) => tier.is_visible !== false);

  return (
    <BuyerSiteShell buyer={buyer}>
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/catalog" className="text-sm font-semibold text-slate-600 hover:text-slate-950">
            ← Retour au catalogue
          </Link>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            {CATEGORY_LABELS[event.category] || event.category}
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_70px_-40px_rgba(15,23,42,0.65)]">
              <div className="relative aspect-[16/9] bg-slate-100">
                {event.cover_image_url ? (
                  <Image
                    src={event.cover_image_url}
                    alt={event.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#60a5fa,transparent_36%),linear-gradient(135deg,#0f172a,#1d4ed8)]" />
                )}
              </div>
              <div className="space-y-5 p-6 md:p-8">
                <div className="space-y-3">
                  <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{event.title}</h1>
                  {event.description && (
                    <p className="max-w-3xl text-base leading-7 text-slate-600">{event.description}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <CalendarDays className="h-5 w-5 text-sky-700" />
                    <p className="mt-3 text-sm text-slate-500">Début</p>
                    <p className="mt-1 font-semibold text-slate-950">{formatDateTime(event.starts_at)}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <Clock3 className="h-5 w-5 text-sky-700" />
                    <p className="mt-3 text-sm text-slate-500">Portes</p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {event.doors_open_at ? formatDateTime(event.doors_open_at) : "Non communiqué"}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <MapPin className="h-5 w-5 text-sky-700" />
                    <p className="mt-3 text-sm text-slate-500">Lieu</p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {event.venue_name}, {event.venue_city}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <ShieldCheck className="h-5 w-5 text-sky-700" />
                    <p className="mt-3 text-sm text-slate-500">Règles</p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {event.allow_refunds ? "Remboursable" : "Vente finale"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Ticket className="h-5 w-5 text-sky-700" />
                <h2 className="text-xl font-semibold text-slate-950">Tarifs disponibles</h2>
              </div>
              <div className="mt-5 divide-y divide-slate-100">
                {tiers.map((tier) => (
                  <div key={tier.id} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-semibold text-slate-950">{tier.name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {tier.price === 0 ? "Gratuit" : formatCFA(tier.price)} · {tier.available ?? Math.max(0, tier.capacity - tier.sold_count)} disponibles
                      </p>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <div>
                        min {tier.min_per_order} · max {tier.max_per_order}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <PurchasePanel event={event} buyer={buyer} />
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-950">Ce que ce test valide</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>Catalogue public et détail public de l&apos;événement</li>
                <li>Création de commande avec auth acheteur proxifiée</li>
                <li>Initialisation du checkout Wave</li>
                <li>Consultation des billets via les endpoints acheteur</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </BuyerSiteShell>
  );
}
