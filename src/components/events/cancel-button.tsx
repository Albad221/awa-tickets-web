"use client";

import { useState } from "react";
import { cancelEventAction } from "@/actions/event-actions";

export function CancelButton({ eventId }: { eventId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!confirm("Annuler cet événement ? Tous les acheteurs seront remboursés.")) return;
    setPending(true);
    setError(null);
    const result = await cancelEventAction(eventId);
    setPending(false);
    if (result.error) setError(result.error);
  }

  return (
    <div>
      <button onClick={handleCancel} disabled={pending} className="inline-flex h-9 items-center rounded-md bg-red-600 px-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
        {pending ? "..." : "Annuler l'événement"}
      </button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
