import { apiFetch } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/page-header";
import { EventForm } from "@/components/events/event-form";
import type { AppConfig } from "@/lib/types";

export default async function NewEventPage() {
  const config = await apiFetch<AppConfig>("/api/config");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Créer un événement"
        breadcrumbs={[
          { label: "Événements", href: "/events" },
          { label: "Nouveau" },
        ]}
      />
      <EventForm categories={config.categories} />
    </div>
  );
}
