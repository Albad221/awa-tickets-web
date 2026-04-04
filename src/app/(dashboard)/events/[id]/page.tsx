import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/layout/page-header";
import { PublishButton } from "@/components/events/publish-button";
import { CancelButton } from "@/components/events/cancel-button";
import { formatCFA, formatDateTime } from "@/lib/format";
import {
  APPROVAL_STATUS_COLORS,
  APPROVAL_STATUS_LABELS,
  CATEGORY_LABELS,
  EVENT_REVIEW_STATUS_COLORS,
  EVENT_REVIEW_STATUS_LABELS,
  EVENT_STATUS_COLORS,
  EVENT_STATUS_LABELS,
  STAFFING_MODE_LABELS,
} from "@/lib/constants";
import type { ApprovalStatus, Event, EventReviewStatus, EventStatus, KycStatus } from "@/lib/types";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event, session] = await Promise.all([
    apiFetch<Event>(`/api/events/${id}`),
    requireSession(),
  ]);
  const approvalStatus = (session.approval_status || "pending_review") as ApprovalStatus;
  const kycStatus = session.kyc_status as KycStatus;
  const reviewStatus = (event.review_status || "not_submitted") as EventReviewStatus;

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
            <PublishButton
              eventId={id}
              approvalStatus={approvalStatus}
              kycStatus={kycStatus}
              reviewStatus={reviewStatus}
            />
          </>
        )}
        {(event.status === "published" || event.status === "sold_out") && (
          <CancelButton eventId={id} />
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${EVENT_STATUS_COLORS[event.status as EventStatus] || ""}`}>
                {EVENT_STATUS_LABELS[event.status as EventStatus] || event.status}
              </span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${EVENT_REVIEW_STATUS_COLORS[reviewStatus] || ""}`}>
                {EVENT_REVIEW_STATUS_LABELS[reviewStatus] || reviewStatus}
              </span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${APPROVAL_STATUS_COLORS[approvalStatus] || ""}`}>
                Organisateur {APPROVAL_STATUS_LABELS[approvalStatus] || approvalStatus}
              </span>
              <span className="text-sm text-muted-foreground">
                {CATEGORY_LABELS[event.category] || event.category}
              </span>
            </div>
            {reviewStatus === "pending_review" && (
              <div className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
                Votre événement est en attente de validation AWA. Il restera en brouillon jusqu&apos;à approbation.
              </div>
            )}
            {reviewStatus === "rejected" && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
                Validation refusée{event.review_notes ? ` : ${event.review_notes}` : "."} Corrigez les informations puis soumettez de nouveau.
              </div>
            )}
            {approvalStatus !== "approved" && (
              <div className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
                Votre compte organisateur n&apos;est pas encore validé par AWA. Vous pouvez préparer les brouillons mais pas publier.
              </div>
            )}
            {kycStatus !== "verified" && (
              <div className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
                KYC actuel : {kycStatus}. La publication sera débloquée après validation.
              </div>
            )}
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
            <p>
              <strong>Commission appliquée :</strong>{" "}
              {event.effective_fee_percent ?? 7}% (minimum {formatCFA(event.effective_fee_min_xof ?? 100)})
            </p>
            {event.platform_fee_percent_override != null && (
              <p className="text-xs text-muted-foreground">
                Commission négociée spécifique à cet événement.
              </p>
            )}
          </div>
          <div className="rounded-lg border p-4 text-sm space-y-2">
            <p><strong>Mode de scan :</strong> {STAFFING_MODE_LABELS[event.staffing_mode || "organizer_self_staff"]}</p>
            <p><strong>Besoin déclaré :</strong> {event.requested_staff_count ?? 0} personne(s) · {event.requested_shift_count ?? 1} shift(s)</p>
            {event.staffing_mode === "awa_provided" && (
              <>
                <p><strong>Staff confirmé AWA :</strong> {event.confirmed_staff_count ?? 0}</p>
                <p><strong>Charge opérationnelle :</strong> {formatCFA(event.staffing_charge_total ?? 0)}</p>
              </>
            )}
            {event.staffing_notes && (
              <p className="text-muted-foreground">{event.staffing_notes}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
