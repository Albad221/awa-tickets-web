import { apiFetch } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/page-header";
import { EventForm } from "@/components/events/event-form";
import type { Event, AppConfig } from "@/lib/types";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event, config] = await Promise.all([
    apiFetch<Event>(`/api/events/${id}`),
    apiFetch<AppConfig>("/api/config"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modifier l'événement"
        breadcrumbs={[
          { label: "Événements", href: "/events" },
          { label: event.title, href: `/events/${id}` },
          { label: "Modifier" },
        ]}
      />
      <EventForm categories={config.categories} initialData={event} />
    </div>
  );
}
