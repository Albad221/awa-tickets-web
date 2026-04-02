import { apiFetch } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/page-header";
import { formatCFA } from "@/lib/format";
import type { EventDashboard } from "@/lib/types";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Single source of truth: the dashboard endpoint already includes check_in_count
  const dashboard = await apiFetch<EventDashboard>(`/api/events/${id}/dashboard`);

  const fillRate = dashboard.total_capacity > 0
    ? Math.round((dashboard.total_sold / dashboard.total_capacity) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        breadcrumbs={[
          { label: "Événements", href: "/events" },
          { label: "Dashboard" },
        ]}
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Billets vendus</p>
          <p className="mt-2 text-3xl font-semibold">{dashboard.total_sold}</p>
          <p className="text-xs text-muted-foreground">/ {dashboard.total_capacity}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Revenus</p>
          <p className="mt-2 text-3xl font-semibold">{formatCFA(dashboard.total_revenue)}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Check-ins</p>
          <p className="mt-2 text-3xl font-semibold">{dashboard.check_in_count}</p>
          <p className="text-xs text-muted-foreground">/ {dashboard.total_sold} vendus</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Taux de remplissage</p>
          <p className="mt-2 text-3xl font-semibold">{fillRate}%</p>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold">Ventes par tarif</h3>
        </div>
        <div className="divide-y">
          {dashboard.tiers.map((tier) => {
            const pct = tier.capacity > 0 ? Math.round((tier.sold / tier.capacity) * 100) : 0;
            return (
              <div key={tier.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{tier.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {tier.sold} / {tier.capacity} ({pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
