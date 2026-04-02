import { apiFetch } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/page-header";
import { WithdrawButton } from "@/components/payouts/withdraw-button";
import { formatCFA, formatDateTime } from "@/lib/format";
import { PAYOUT_STATUS_LABELS, PAYOUT_STATUS_COLORS } from "@/lib/constants";
import type { OrganizerBalance, PayoutBatch, PayoutStatus } from "@/lib/types";

export default async function PayoutsPage() {
  const [balance, payoutsData] = await Promise.all([
    apiFetch<OrganizerBalance>("/api/organizers/me/balance"),
    apiFetch<{ payouts: PayoutBatch[] }>("/api/payouts/me"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Paiements" />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">En attente</p>
          <p className="mt-2 text-2xl font-semibold">{formatCFA(balance.accrued)}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Disponible</p>
          <p className="mt-2 text-2xl font-semibold text-green-700">{formatCFA(balance.eligible)}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total versé</p>
          <p className="mt-2 text-2xl font-semibold">{formatCFA(balance.paid)}</p>
        </div>
      </div>

      {balance.eligible > 0 && (
        <WithdrawButton label={`Retirer ${formatCFA(balance.eligible)}`} />
      )}

      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold">Historique des paiements</h3>
        </div>
        {payoutsData.payouts.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Aucun paiement pour le moment.
          </div>
        ) : (
          <div className="divide-y">
            {payoutsData.payouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{formatCFA(payout.total_net)}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(payout.requested_at)}</p>
                </div>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PAYOUT_STATUS_COLORS[payout.status as PayoutStatus] || ""}`}>
                  {PAYOUT_STATUS_LABELS[payout.status as PayoutStatus] || payout.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
