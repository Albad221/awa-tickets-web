import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/layout/page-header";
import { KycForm } from "@/components/settings/kyc-form";
import {
  APPROVAL_STATUS_COLORS,
  APPROVAL_STATUS_LABELS,
  KYC_STATUS_COLORS,
  KYC_STATUS_LABELS,
} from "@/lib/constants";
import type { ApprovalStatus, KycStatus } from "@/lib/types";

export default async function SettingsPage() {
  const session = await requireSession();
  const kycStatus = session.kyc_status as KycStatus;
  const approvalStatus = (session.approval_status || "pending_review") as ApprovalStatus;

  return (
    <div className="space-y-6">
      <PageHeader title="Paramètres" />

      <div className="max-w-lg rounded-lg border p-6 space-y-4">
        <h3 className="font-semibold">Validation organisateur</h3>
        <div className="flex items-center gap-3">
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${APPROVAL_STATUS_COLORS[approvalStatus] || ""}`}>
            {APPROVAL_STATUS_LABELS[approvalStatus] || approvalStatus}
          </span>
          {approvalStatus === "approved" && (
            <p className="text-sm text-green-700">Votre organisation peut publier après validation KYC.</p>
          )}
          {approvalStatus === "pending_review" && (
            <p className="text-sm text-yellow-700">AWA doit encore valider votre compte organisateur.</p>
          )}
          {approvalStatus === "rejected" && (
            <p className="text-sm text-red-700">Votre profil doit être revu par AWA avant publication.</p>
          )}
        </div>
      </div>

      <div className="max-w-lg rounded-lg border p-6 space-y-4">
        <h3 className="font-semibold">Vérification KYC</h3>
        <div className="flex items-center gap-3">
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${KYC_STATUS_COLORS[kycStatus] || ""}`}>
            {KYC_STATUS_LABELS[kycStatus] || kycStatus}
          </span>
          {kycStatus === "verified" && (
            <p className="text-sm text-green-700">Votre identité est vérifiée.</p>
          )}
          {kycStatus === "submitted" && (
            <p className="text-sm text-yellow-700">Vérification en cours...</p>
          )}
          {kycStatus === "rejected" && (
            <p className="text-sm text-red-700">Vérification rejetée. Veuillez réessayer.</p>
          )}
        </div>
        {(kycStatus === "pending" || kycStatus === "rejected") && (
          <KycForm />
        )}
      </div>
    </div>
  );
}
