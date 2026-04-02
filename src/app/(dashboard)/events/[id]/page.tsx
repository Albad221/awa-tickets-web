import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/page-header";
import { PublishButton } from "@/components/events/publish-button";
import { CancelButton } from "@/components/events/cancel-button";
import { formatDateTime } from "@/lib/format";
import { EVENT_STATUS_LABELS, EVENT_STATUS_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import type { Event, EventStatus } from "@/lib/types";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await apiFetch<Event>(`/api/events/${id}`);

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.title}
        breadcrumbs={[
          { label: "Événements", href: "/events" },
          { label: event.title },
        ]}
      >
        <Link
          href={`/events/${id}/dashboard`}
          className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
        >
          Dashboard
        </Link>
        <Link
          href={`/events/${id}/scan`}
          className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
        >
          Scan
        </Link>
        {event.status === "draft" && (
          <>
            <Link
              href={`/events/${id}/edit`}
              className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
            >
              Modifier
            </Link>
            <PublishButton eventId={id} />
          </>
        )}
        {(event.status === "published" || event.status === "sold_out") && (
          <CancelButton eventId={id} />
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${EVENT_STATUS_COLORS[event.status as EventStatus] || ""}`}>
                {EVENT_STATUS_LABELS[event.status as EventStatus] || event.status}
              </span>
              <span className="text-sm text-muted-foreground">
                {CATEGORY_LABELS[event.category] || event.category}
              </span>
            </div>
            {event.description && (
              <p className="text-sm text-muted-foreground">{event.description}</p>
            )}
            <div className="grid gap-2 text-sm">
              <div><strong>Lieu :</strong> {event.venue_name}, {event.venue_city}</div>
              <div><strong>Début :</strong> {formatDateTime(event.starts_at)}</div>
              <div><strong>Fin :</strong> {formatDateTime(event.ends_at)}</div>
              {event.doors_open_at && (
                <div><strong>Portes :</strong> {formatDateTime(event.doors_open_at)}</div>
              )}
            </div>
          </div>

          {event.tiers && event.tiers.length > 0 && (
            <div className="rounded-lg border">
              <div className="border-b px-4 py-3">
                <h3 className="font-semibold">Tarifs</h3>
              </div>
              <div className="divide-y">
                {event.tiers.map((tier) => (
                  <div key={tier.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="font-medium">{tier.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {tier.price === 0 ? "Gratuit" : `${tier.price.toLocaleString("fr-FR")} ${tier.currency}`}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{tier.sold_count} / {tier.capacity}</p>
                      <p className="text-muted-foreground">
                        {tier.available !== undefined ? `${tier.available} dispo` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {event.cover_image_url && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg border">
              <Image
                src={event.cover_image_url}
                alt={event.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <div className="rounded-lg border p-4 text-sm space-y-2">
            <p><strong>Transferts :</strong> {event.allow_transfers ? "Autorisés" : "Désactivés"}</p>
            <p><strong>Remboursements :</strong> {event.allow_refunds ? "Autorisés" : "Désactivés"}</p>
            <p><strong>Devise :</strong> {event.currency}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
