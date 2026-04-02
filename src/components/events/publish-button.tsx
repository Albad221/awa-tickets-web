"use client";

import { useState } from "react";
import { publishEventAction } from "@/actions/event-actions";

export function PublishButton({ eventId }: { eventId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePublish() {
    if (!confirm("Publier cet événement ? Il sera visible publiquement.")) return;
    setPending(true);
    setError(null);
    const result = await publishEventAction(eventId);
    setPending(false);
    if (result.error) setError(result.error);
  }

  return (
    <div>
      <button onClick={handlePublish} disabled={pending} className="inline-flex h-9 items-center rounded-md bg-green-600 px-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
        {pending ? "..." : "Publier"}
      </button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
