import type { EventStatus, KycStatus, PayoutStatus } from "./types";

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
