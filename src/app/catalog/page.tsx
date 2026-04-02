import { BuyerIdentityForm } from "@/components/buyer/buyer-identity-form";
import { EventCard } from "@/components/buyer/event-card";
import { BuyerSiteShell } from "@/components/buyer/site-shell";
import { publicApiFetch } from "@/lib/buyer-api";
import { getBuyerIdentity } from "@/lib/buyer-session";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { AppConfig, Event } from "@/lib/types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function queryString(search: { q?: string; city?: string; category?: string }) {
  const params = new URLSearchParams();
  if (search.q) params.set("q", search.q);
  if (search.city) params.set("city", search.city);
  if (search.category) params.set("category", search.category);
  params.set("limit", "24");
  return params.toString();
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; category?: string }>;
}) {
  const filters = await searchParams;
  const [buyer, config, eventsData] = await Promise.all([
    getBuyerIdentity(),
    publicApiFetch<AppConfig>("/api/config"),
    publicApiFetch<{ events: Event[] }>(`/api/events?${queryString(filters)}`),
  ]);

  return (
    <BuyerSiteShell buyer={buyer}>
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-12 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Catalogue</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
              Tous les événements disponibles
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Utilisez cette vue pour valider le catalogue public, l&apos;affichage des tarifs visibles et la création de commandes côté acheteur.
            </p>
          </div>
          <BuyerIdentityForm buyer={buyer} />
        </div>

        <form className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[2fr_1.2fr_1.2fr_auto]">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Recherche</span>
            <input
              name="q"
              defaultValue={filters.q || ""}
              placeholder="Youssou Ndour, Dakar Arena..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Ville</span>
            <input
              name="city"
              defaultValue={filters.city || ""}
              placeholder="Dakar"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Catégorie</span>
            <select
              name="category"
              defaultValue={filters.category || ""}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-950"
            >
              <option value="">Toutes</option>
              {config.categories.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category] || category}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Filtrer
            </button>
          </div>
        </form>

        {eventsData.events.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-12 text-center text-slate-600">
            Aucun événement ne correspond à ce filtre.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {eventsData.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </BuyerSiteShell>
  );
}
