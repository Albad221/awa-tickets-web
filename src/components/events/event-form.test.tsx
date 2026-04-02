import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { EventForm } from "@/components/events/event-form";

vi.mock("@/actions/event-actions", () => ({
  createEventAction: vi.fn(),
  updateEventAction: vi.fn(),
}));

vi.mock("@/components/events/image-upload", () => ({
  ImageUpload: ({ value }: { value: string | null }) => <div data-testid="image-upload">{value}</div>,
}));

describe("EventForm", () => {
  it("renders tier editing for existing events and serializes tier ids", () => {
    render(
      <EventForm
        categories={["concert"]}
        initialData={{
          id: "evt-1",
          organizer_id: "org-1",
          title: "Concert Test",
          slug: "concert-test",
          description: null,
          category: "concert",
          venue_name: "Grand Théâtre",
          venue_address: null,
          venue_city: "Dakar",
          venue_country: "SN",
          starts_at: "2026-04-10T20:00:00+00:00",
          ends_at: "2026-04-10T22:00:00+00:00",
          doors_open_at: null,
          timezone: "Africa/Dakar",
          cover_image_url: null,
          gallery: [],
          allow_transfers: true,
          allow_refunds: false,
          refund_deadline_hours: 48,
          tags: [],
          currency: "XOF",
          status: "draft",
          created_at: "2026-04-01T00:00:00+00:00",
          updated_at: "2026-04-01T00:00:00+00:00",
          tiers: [{
            id: "tier-1",
            event_id: "evt-1",
            name: "VIP",
            description: null,
            price: 15000,
            currency: "XOF",
            capacity: 50,
            sold_count: 0,
            min_per_order: 1,
            max_per_order: 10,
            sale_starts_at: null,
            sale_ends_at: null,
            sort_order: 0,
            is_visible: true,
          }],
        }}
      />
    );

    expect(screen.getByText("Tarifs *")).toBeInTheDocument();
    expect(screen.getByDisplayValue("VIP")).toBeInTheDocument();
    expect(screen.getByDisplayValue("15000")).toBeInTheDocument();

    const tiersInput = screen.getByDisplayValue(/tier-1/);
    expect(tiersInput).toHaveAttribute("name", "tiers");
  });
});
