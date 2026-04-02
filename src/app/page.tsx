import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { BuyerIdentityForm } from "@/components/buyer/buyer-identity-form";
import { EventCard } from "@/components/buyer/event-card";
import { BuyerSiteShell } from "@/components/buyer/site-shell";
import { publicApiFetch } from "@/lib/buyer-api";
import { getBuyerIdentity } from "@/lib/buyer-session";
import type { AppConfig, Event } from "@/lib/types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const [buyer, eventsData, config] = await Promise.all([
    getBuyerIdentity(),
    publicApiFetch<{ events: Event[] }>("/api/events?limit=6"),
    publicApiFetch<AppConfig>("/api/config"),
  ]);

  const events = eventsData.events;

  return (
    <BuyerSiteShell buyer={buyer}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#93c5fd,transparent_32%),radial-gradient(circle_at_bottom_right,#fdba74,transparent_24%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.4fr_0.9fr] md:px-8 md:py-24">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-medium text-sky-700 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Buyer lab connecté aux vrais endpoints tickets
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 md:text-6xl">
                Voir les événements, créer une commande et vérifier le parcours d&apos;achat complet.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Cette interface graphique sert de laboratoire manuel. Elle affiche les événements publiés et déclenche exactement les endpoints HTTP du backend pour la création de commande, le checkout, puis la lecture des billets côté acheteur.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Parcourir les événements
              </Link>
              <Link
                href="/my-tickets"
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-900 hover:border-slate-400"
              >
                Voir mes billets
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                <p className="text-sm text-slate-500">Catégories</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{config.categories.length}</p>
              </div>
              <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                <p className="text-sm text-slate-500">Méthodes de paiement</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{config.payment_methods.length}</p>
              </div>
              <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                <p className="text-sm text-slate-500">Support</p>
                <p className="mt-2 text-base font-semibold text-slate-950">{config.support.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <BuyerIdentityForm buyer={buyer} />
            <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_80px_-35px_rgba(15,23,42,0.7)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-200">
                Chemin testé
              </p>
              <ol className="mt-4 space-y-3 text-sm text-slate-200">
                <li>1. Lire le catalogue public des événements.</li>
                <li>2. Créer une commande acheteur via la surface HTTP interne.</li>
                <li>3. Démarrer le checkout Wave.</li>
                <li>4. Vérifier le statut et les billets côté acheteur.</li>
              </ol>
              <Link
                href="/catalog"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white"
              >
                Ouvrir le laboratoire
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-14 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">En vedette</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Événements publiés</h2>
          </div>
          <Link href="/catalog" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
            Tout voir
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-12 text-center text-slate-600">
            Aucun événement publié pour le moment.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </BuyerSiteShell>
  );
}
