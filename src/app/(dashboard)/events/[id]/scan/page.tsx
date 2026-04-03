import { apiFetch } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/page-header";
import { EventOpsConsole } from "@/components/events/event-ops-console";
import { ScanOpsLiveRefresh } from "@/components/events/scan-ops-live-refresh";
import { ScanSessionManager } from "@/components/events/scan-session-manager";
import type { ScanOpsResponse, ScanSession, ScanStats, StaffUser } from "@/lib/types";

export default async function ScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [sessionsData, stats, ops, staffUsers] = await Promise.all([
    apiFetch<{ sessions: ScanSession[] }>(`/api/scan/sessions?event_id=${id}`),
    apiFetch<ScanStats>(`/api/scan/events/${id}/stats`),
    apiFetch<ScanOpsResponse>(`/api/scan/events/${id}/ops`),
    apiFetch<{ staff_users: StaffUser[] }>(`/api/staff/users`),
  ]);

  return (
    <div className="space-y-6">
      <ScanOpsLiveRefresh />

      <PageHeader
        title="Opérations de scan"
        breadcrumbs={[
          { label: "Événements", href: "/events" },
          { label: "Scan" },
        ]}
      />

      <div className="grid gap-4 grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total scans</p>
          <p className="mt-1 text-2xl font-semibold">{stats.total_scans}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Admis</p>
          <p className="mt-1 text-2xl font-semibold">{stats.admitted}</p>
        </div>
      </div>

      <EventOpsConsole
        eventId={id}
        staffUsers={staffUsers.staff_users}
        ops={ops}
      />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Lien d&apos;urgence</h2>
          <p className="text-sm text-muted-foreground">
            Utilisez ces sessions lien uniquement en fallback si l&apos;auth staff est indisponible.
          </p>
        </div>
        <ScanSessionManager eventId={id} sessions={sessionsData.sessions} />
      </div>
    </div>
  );
}
