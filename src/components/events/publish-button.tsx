"use client";

import { useState } from "react";
import { publishEventAction } from "@/actions/event-actions";
import type { ApprovalStatus, EventReviewStatus, KycStatus } from "@/lib/types";

function getBlockingReason(
  approvalStatus: ApprovalStatus | undefined,
  kycStatus: KycStatus,
  reviewStatus: EventReviewStatus | undefined
): string | null {
  if (approvalStatus && approvalStatus !== "approved") {
    return "Votre compte organisateur doit être validé par AWA avant publication.";
  }
  if (kycStatus !== "verified") {
    return "Votre KYC doit être validé avant publication.";
  }
  if (reviewStatus === "pending_review") {
    return "Cet événement est déjà en attente de validation par AWA.";
  }
  return null;
}

export function PublishButton({
  eventId,
  approvalStatus,
  kycStatus,
  reviewStatus,
}: {
  eventId: string;
  approvalStatus?: ApprovalStatus;
  kycStatus: KycStatus;
  reviewStatus?: EventReviewStatus;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const blockingReason = getBlockingReason(approvalStatus, kycStatus, reviewStatus);
  const buttonLabel = reviewStatus === "rejected" ? "Soumettre à nouveau" : "Publier";

  async function handlePublish() {
    if (blockingReason) {
      setError(blockingReason);
      return;
    }
    if (!confirm("Publier cet événement ? Il sera soit mis en ligne, soit envoyé en validation AWA.")) return;
    setPending(true);
    setError(null);
    setNotice(null);
    const result = await publishEventAction(eventId);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.submittedForReview) {
      setNotice("Événement soumis à validation. Il sera publié après revue par un admin AWA.");
      return;
    }
    setNotice("Événement publié.");
  }

  return (
    <div>
      <button
        onClick={handlePublish}
        disabled={pending || !!blockingReason}
        className="inline-flex h-9 items-center rounded-md bg-green-600 px-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {pending ? "..." : buttonLabel}
      </button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      {notice && <p className="mt-1 text-xs text-green-700">{notice}</p>}
    </div>
  );
}
