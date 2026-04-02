import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/page-header";
import { formatDate } from "@/lib/format";
import { EVENT_STATUS_LABELS, EVENT_STATUS_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import type { Event, EventStatus } from "@/lib/types";

export default async function EventsPage() {
  const data = await apiFetch<{ events: Event[] }>("/api/events?mine=true");
  const events = data.events;

  return (
    <div className="space-y-6">
      <PageHeader title="Mes événements">
        <Link
          href="/events/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Créer un événement
        </Link>
      </PageHeader>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium">Aucun événement</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Créez votre premier événement pour commencer à vendre des billets.
          </p>
          <Link
            href="/events/new"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Créer un événement
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="group rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
            >
              {event.cover_image_url && (
                <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-md bg-muted">
                  <Image
                    src={event.cover_image_url}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${EVENT_STATUS_COLORS[event.status as EventStatus] || ""}`}>
                    {EVENT_STATUS_LABELS[event.status as EventStatus] || event.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {CATEGORY_LABELS[event.category] || event.category}
                  </span>
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {event.venue_name} · {event.venue_city}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(event.starts_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
