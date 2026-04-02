import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { ScanSessionManager } from "@/components/events/scan-session-manager";

const { revokeScanSessionAction } = vi.hoisted(() => ({
  revokeScanSessionAction: vi.fn(),
}));

vi.mock("@/actions/scan-actions", () => ({
  createScanSessionAction: vi.fn(),
  revokeScanSessionAction,
}));

describe("ScanSessionManager", () => {
  it("shows a revoke error banner when revocation fails", async () => {
    revokeScanSessionAction.mockResolvedValueOnce({ error: "Révocation impossible" });
    vi.stubGlobal("confirm", vi.fn(() => true));

    render(
      <ScanSessionManager
        eventId="evt-1"
        sessions={[{
          id: "sess-1",
          event_id: "evt-1",
          gate_name: "Entrée A",
          device_label: null,
          expires_at: "2099-01-01T12:00:00+00:00",
          revoked_at: null,
          last_used_at: null,
          created_at: "2099-01-01T00:00:00+00:00",
        }]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Révoquer" }));

    await waitFor(() => {
      expect(screen.getByText("Révocation impossible")).toBeInTheDocument();
    });
  });
});
