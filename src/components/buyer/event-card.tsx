import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { formatCFA, formatDateTime } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { Event, TicketTier } from "@/lib/types";

function visibleTiers(event: Event): TicketTier[] {
  return (event.tiers || event.ticket_tiers || []).filter((tier) => tier.is_visible !== false);
}

export function EventCard({ event }: { event: Event }) {
  const tiers = visibleTiers(event);
  const lowestPrice = tiers.length > 0 ? Math.min(...tiers.map((tier) => tier.price)) : null;
  const totalAvailable = tiers.reduce((sum, tier) => sum + (tier.available ?? Math.max(0, tier.capacity - tier.sold_count)), 0);

  return (
    <Link
      href={`/catalog/${event.id}`}
      className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_-32px_rgba(15,23,42,0.45)] transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {event.cover_image_url ? (
          <Image
            src={event.cover_image_url}
            alt={event.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#60a5fa,transparent_45%),linear-gradient(135deg,#0f172a,#1d4ed8)]" />
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
            {CATEGORY_LABELS[event.category] || event.category}
          </span>
          <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {lowestPrice === null ? "À venir" : lowestPrice === 0 ? "Gratuit" : `Dès ${formatCFA(lowestPrice)}`}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-slate-950">{event.title}</h3>
          {event.description && (
            <p className="line-clamp-2 text-sm leading-6 text-slate-600">{event.description}</p>
          )}
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <span>{formatDateTime(event.starts_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>
              {event.venue_name}, {event.venue_city}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-slate-400" />
            <span>{totalAvailable} billets disponibles</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
