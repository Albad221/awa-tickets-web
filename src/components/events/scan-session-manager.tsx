"use client";

import { useActionState, useState } from "react";
import { createScanSessionAction, revokeScanSessionAction } from "@/actions/scan-actions";
import { formatRelative } from "@/lib/format";
import type { ScanSession } from "@/lib/types";

interface ScanSessionManagerProps {
  eventId: string;
  sessions: ScanSession[];
}

export function ScanSessionManager({ eventId, sessions }: ScanSessionManagerProps) {
  const [state, formAction, pending] = useActionState(createScanSessionAction, null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  async function handleRevoke(sessionId: string) {
    if (!confirm("Révoquer cette session de scan ?")) return;
    setRevoking(sessionId);
    setRevokeError(null);
    const result = await revokeScanSessionAction(sessionId, eventId);
    setRevoking(null);
    if (result.error) {
      setRevokeError(result.error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Créer une session de scan</h3>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="event_id" value={eventId} />

          {state?.error && (
            <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{state.error}</div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label htmlFor="gate_name" className="text-xs font-medium">Point d&apos;entrée *</label>
              <input id="gate_name" name="gate_name" required placeholder="Ex: Entrée principale" className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm" />
            </div>
            <div className="space-y-1">
              <label htmlFor="device_label" className="text-xs font-medium">Appareil</label>
              <input id="device_label" name="device_label" placeholder="Ex: iPhone de Moussa" className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm" />
            </div>
            <div className="space-y-1">
              <label htmlFor="expires_in_hours" className="text-xs font-medium">Expiration</label>
              <select id="expires_in_hours" name="expires_in_hours" defaultValue="12" className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm">
                <option value="4">4 heures</option>
                <option value="8">8 heures</option>
                <option value="12">12 heures</option>
                <option value="24">24 heures</option>
                <option value="48">48 heures</option>
                <option value="72">72 heures</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={pending} className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {pending ? "..." : "Créer la session"}
          </button>
        </form>

        {/* Show created session URL */}
        {state?.session && (
          <div className="mt-3 rounded-md bg-green-50 border border-green-200 p-3">
            <p className="text-sm font-medium text-green-800">Session créée : {state.session.gate_name}</p>
            <div className="mt-2 flex items-center gap-2">
              <input readOnly value={state.session.scan_url} className="flex-1 h-8 rounded-md border bg-white px-2 text-xs font-mono" />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(state.session!.scan_url)}
                className="inline-flex h-8 items-center rounded-md border px-2 text-xs hover:bg-muted"
              >
                Copier
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active sessions list */}
      {revokeError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{revokeError}</div>
      )}
      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold">Sessions actives</h3>
        </div>
        {sessions.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Aucune session de scan active.
          </div>
        ) : (
          <div className="divide-y">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{session.gate_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.device_label || "—"} · Expire {formatRelative(session.expires_at)}
                    {session.last_used_at && ` · Dernier scan ${formatRelative(session.last_used_at)}`}
                  </p>
                </div>
                <button
                  onClick={() => handleRevoke(session.id)}
                  disabled={revoking === session.id}
                  className="inline-flex h-8 items-center rounded-md border border-red-200 px-2 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {revoking === session.id ? "..." : "Révoquer"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
