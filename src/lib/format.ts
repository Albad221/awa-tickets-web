import { format, formatDistanceToNow, isValid } from "date-fns";
import { fr } from "date-fns/locale";

export function formatCFA(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} CFA`;
}

function safeParse(dateString: string): Date | null {
  const d = new Date(dateString);
  return isValid(d) ? d : null;
}

export function formatDate(dateString: string): string {
  const d = safeParse(dateString);
  return d ? format(d, "dd MMM yyyy", { locale: fr }) : "—";
}

export function formatDateTime(dateString: string): string {
  const d = safeParse(dateString);
  return d ? format(d, "dd MMM yyyy HH:mm", { locale: fr }) : "—";
}

export function formatTime(dateString: string): string {
  const d = safeParse(dateString);
  return d ? format(d, "HH:mm", { locale: fr }) : "—";
}

export function formatRelative(dateString: string): string {
  const d = safeParse(dateString);
  return d ? formatDistanceToNow(d, { addSuffix: true, locale: fr }) : "—";
}
