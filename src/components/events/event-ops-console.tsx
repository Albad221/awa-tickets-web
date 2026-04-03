"use client";

import { useActionState, useState } from "react";
import {
  assignStaffToEventAction,
  createStaffUserAction,
  pauseScanSessionAction,
  resumeScanSessionAction,
  revokeScanSessionAction,
} from "@/actions/scan-actions";
import { formatRelative } from "@/lib/format";
import type { ScanOpsResponse, StaffUser } from "@/lib/types";

interface EventOpsConsoleProps {
  eventId: string;
  staffUsers: StaffUser[];
  ops: ScanOpsResponse;
}

export function EventOpsConsole({ eventId, staffUsers, ops }: EventOpsConsoleProps) {
  const [staffState, staffAction, creatingStaff] = useActionState(createStaffUserAction, null);
  const [assignState, assignAction, assigning] = useActionState(assignStaffToEventAction, null);
  const [sessionActionError, setSessionActionError] = useState<string | null>(null);
  const [busySessionId, setBusySessionId] = useState<string | null>(null);

  async function handleSessionAction(
    sessionId: string,
    action: "pause" | "resume" | "revoke",
  ) {
    const confirmed = action === "revoke"
      ? confirm("Révoquer cette session scanner ?")
      : true;
    if (!confirmed) return;

    setSessionActionError(null);
    setBusySessionId(sessionId);
    const result = action === "pause"
      ? await pauseScanSessionAction(sessionId, eventId)
      : action === "resume"
        ? await resumeScanSessionAction(sessionId, eventId)
        : await revokeScanSessionAction(sessionId, eventId);
    setBusySessionId(null);

    if (result.error) {
      setSessionActionError(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Scanners actifs</p>
          <p className="mt-1 text-2xl font-semibold">
            {ops.scanners.filter((scanner) => scanner.status === "active").length}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Alertes</p>
          <p className="mt-1 text-2xl font-semibold">{ops.alerts.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Staff assigné</p>
          <p className="mt-1 text-2xl font-semibold">{ops.roster.length}</p>
        </div>
      </div>

      {ops.alerts.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <h3 className="font-semibold text-amber-900">Alertes opérationnelles</h3>
          <div className="mt-3 space-y-2">
            {ops.alerts.map((alert) => (
              <div key={`${alert.type}-${alert.session_id ?? alert.message}`} className="rounded-md bg-white px-3 py-2 text-sm text-amber-900">
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Créer un membre du staff</h3>
            <form action={staffAction} className="mt-4 space-y-3">
              <input type="hidden" name="event_id" value={eventId} />
              {staffState?.error && (
                <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                  {staffState.error}
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  name="display_name"
                  placeholder="Nom affiché"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
                <input
                  name="phone"
                  placeholder="+221771234567"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={creatingStaff}
                className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {creatingStaff ? "..." : "Créer le staff"}
              </button>
            </form>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Assigner à cet événement</h3>
            <form action={assignAction} className="mt-4 space-y-3">
              <input type="hidden" name="event_id" value={eventId} />
              {assignState?.error && (
                <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                  {assignState.error}
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-3">
                <select
                  name="staff_user_id"
                  defaultValue=""
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="" disabled>Sélectionner un staff</option>
                  {staffUsers
                    .filter((user) => user.status === "active")
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.display_name} · {user.phone}
                      </option>
                    ))}
                </select>
                <select
                  name="role"
                  defaultValue="scanner"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="scanner">Scanner</option>
                  <option value="event_lead">Event lead</option>
                  <option value="support">Support</option>
                </select>
                <input
                  name="allowed_gates"
                  placeholder="Entrée principale, VIP"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={assigning}
                className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {assigning ? "..." : "Assigner"}
              </button>
            </form>
          </div>

          <div className="rounded-lg border">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold">Roster et affectations</h3>
            </div>
            <div className="divide-y">
              {ops.roster.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">Aucune affectation active.</div>
              ) : (
                ops.roster.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{assignment.staff_users?.display_name ?? assignment.staff_user_id}</p>
                      <p className="text-xs text-muted-foreground">
                        {assignment.staff_users?.phone ?? "—"} · {assignment.role}
                        {assignment.allowed_gates.length > 0 && ` · ${assignment.allowed_gates.join(", ")}`}
                      </p>
                    </div>
                    <span className="rounded-full border px-2 py-1 text-xs capitalize">
                      {assignment.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold">Scanners par porte</h3>
            </div>
            <div className="divide-y">
              {ops.by_gate.map((gate) => (
                <div key={gate.gate_name} className="grid grid-cols-4 gap-3 px-4 py-3 text-sm">
                  <div className="font-medium">{gate.gate_name}</div>
                  <div>{gate.admitted} admis</div>
                  <div>{gate.total_scans} scans</div>
                  <div>{gate.active_scanners} actifs</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold">Appareils actifs</h3>
            </div>
            {sessionActionError && (
              <div className="border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {sessionActionError}
              </div>
            )}
            <div className="divide-y">
              {ops.scanners.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">Aucun scanner actif.</div>
              ) : (
                ops.scanners.map((scanner) => (
                  <div key={scanner.session_id} className="space-y-3 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          {scanner.gate_name} · {scanner.device_name || "Appareil inconnu"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {scanner.staff_user?.display_name || "Session lien"} · {scanner.session_kind}
                          {scanner.last_heartbeat_at && ` · heartbeat ${formatRelative(scanner.last_heartbeat_at)}`}
                          {scanner.pending_queue_count > 0 && ` · queue ${scanner.pending_queue_count}`}
                        </p>
                      </div>
                      <span className="rounded-full border px-2 py-1 text-xs capitalize">
                        {scanner.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {scanner.status === "active" ? (
                        <button
                          onClick={() => handleSessionAction(scanner.session_id, "pause")}
                          disabled={busySessionId === scanner.session_id}
                          className="inline-flex h-8 items-center rounded-md border px-2 text-xs hover:bg-muted disabled:opacity-50"
                        >
                          {busySessionId === scanner.session_id ? "..." : "Pause"}
                        </button>
                      ) : scanner.status === "paused" ? (
                        <button
                          onClick={() => handleSessionAction(scanner.session_id, "resume")}
                          disabled={busySessionId === scanner.session_id}
                          className="inline-flex h-8 items-center rounded-md border px-2 text-xs hover:bg-muted disabled:opacity-50"
                        >
                          {busySessionId === scanner.session_id ? "..." : "Reprendre"}
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleSessionAction(scanner.session_id, "revoke")}
                        disabled={busySessionId === scanner.session_id}
                        className="inline-flex h-8 items-center rounded-md border border-red-200 px-2 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {busySessionId === scanner.session_id ? "..." : "Révoquer"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold">Flux de scans récents</h3>
            </div>
            <div className="divide-y">
              {ops.recent_scans.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">Aucun scan récent.</div>
              ) : (
                ops.recent_scans.map((scan) => (
                  <div key={scan.id} className="grid grid-cols-[auto_1fr] gap-3 px-4 py-3 text-sm">
                    <span className="rounded-full border px-2 py-1 text-xs capitalize">
                      {scan.result}
                    </span>
                    <div>
                      <p className="font-medium">
                        {scan.ticket_number || "Ticket inconnu"} · {scan.gate_name || "Porte inconnue"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {scan.staff_name || "Session lien"} · {scan.device_name || "Appareil inconnu"} · {formatRelative(scan.scanned_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
