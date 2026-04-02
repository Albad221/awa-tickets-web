import { apiFetch } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/page-header";
import { ScanSessionManager } from "@/components/events/scan-session-manager";
import type { ScanSession, ScanStats } from "@/lib/types";

export default async function ScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [sessionsData, stats] = await Promise.all([
    apiFetch<{ sessions: ScanSession[] }>(`/api/scan/sessions?event_id=${id}`),
    apiFetch<ScanStats>(`/api/scan/events/${id}/stats`),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sessions de scan"
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

      <ScanSessionManager eventId={id} sessions={sessionsData.sessions} />
    </div>
  );
}
