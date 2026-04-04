import type { ApprovalStatus, EventReviewStatus, EventStatus, KycStatus, PayoutStatus, StaffingMode } from "./types";

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Brouillon",
  published: "Publié",
  sold_out: "Complet",
  completed: "Terminé",
  cancelling: "Annulation...",
  cancelled: "Annulé",
};

export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-green-100 text-green-800",
  sold_out: "bg-orange-100 text-orange-800",
  completed: "bg-blue-100 text-blue-800",
  cancelling: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
};

export const KYC_STATUS_LABELS: Record<KycStatus, string> = {
  pending: "Non soumis",
  submitted: "En cours",
  verified: "Vérifié",
  rejected: "Rejeté",
};

export const KYC_STATUS_COLORS: Record<KycStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  submitted: "bg-yellow-100 text-yellow-800",
  verified: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending_review: "En revue",
  approved: "Approuvé",
  rejected: "Refusé",
  suspended: "Suspendu",
};

export const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  pending_review: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  suspended: "bg-slate-200 text-slate-800",
};

export const EVENT_REVIEW_STATUS_LABELS: Record<EventReviewStatus, string> = {
  not_submitted: "Non soumis",
  pending_review: "En validation",
  approved: "Validé",
  rejected: "Refusé",
};

export const EVENT_REVIEW_STATUS_COLORS: Record<EventReviewStatus, string> = {
  not_submitted: "bg-muted text-muted-foreground",
  pending_review: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export const STAFFING_MODE_LABELS: Record<StaffingMode, string> = {
  organizer_self_staff: "Mon équipe scanne",
  awa_provided: "AWA fournit les scanners",
};

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  pending: "En attente",
  processing: "En cours",
  paid: "Payé",
  failed: "Échoué",
};

export const PAYOUT_STATUS_COLORS: Record<PayoutStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  processing: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export const CATEGORY_LABELS: Record<string, string> = {
  concert: "Concert",
  festival: "Festival",
  sport: "Sport",
  conference: "Conférence",
  theater: "Théâtre",
  comedy: "Comédie",
  party: "Soirée",
  networking: "Networking",
  workshop: "Atelier",
  other: "Autre",
};
