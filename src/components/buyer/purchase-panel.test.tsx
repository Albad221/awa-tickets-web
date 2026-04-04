import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { PurchasePanel } from "@/components/buyer/purchase-panel";

vi.mock("@/actions/buyer-actions", () => ({
  startBuyerCheckoutAction: vi.fn(),
}));

describe("PurchasePanel", () => {
  it("shows event-level fee estimates", () => {
    render(
      <PurchasePanel
        buyer={null}
        event={{
          id: "evt-1",
          organizer_id: "org-1",
          title: "Grand Concert",
          slug: "grand-concert",
          description: null,
          category: "concert",
          venue_name: "Arena",
          venue_address: null,
          venue_city: "Dakar",
          venue_country: "SN",
          starts_at: "2026-04-10T20:00:00+00:00",
          ends_at: "2026-04-10T22:00:00+00:00",
          doors_open_at: null,
          qr_release_mode: "12h_before_event",
          ticket_design_template: "stadium_classic",
          timezone: "Africa/Dakar",
          cover_image_url: null,
          gallery: [],
          allow_transfers: true,
          allow_refunds: false,
          refund_deadline_hours: 48,
          effective_fee_percent: 5,
          effective_fee_min_xof: 100,
          tags: [],
          currency: "XOF",
          status: "published",
          created_at: "2026-04-01T00:00:00+00:00",
          updated_at: "2026-04-01T00:00:00+00:00",
          tiers: [
            {
              id: "tier-1",
              event_id: "evt-1",
              name: "VIP",
              description: null,
              price: 10000,
              currency: "XOF",
              capacity: 50,
              sold_count: 0,
              available: 50,
              min_per_order: 1,
              max_per_order: 10,
              sale_starts_at: null,
              sale_ends_at: null,
              sort_order: 0,
              is_visible: true,
            },
          ],
        }}
      />
    );

    expect(screen.getByText("Sous-total : 10 000 CFA")).toBeInTheDocument();
    expect(screen.getByText("Frais AWA estimés : 500 CFA (5% min 100 CFA)")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10500")).toHaveAttribute("name", "total");
  });
});
