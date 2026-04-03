import type { Event } from "@/lib/types";

export type TicketDesignTemplate =
  | "stadium_classic"
  | "night_pulse"
  | "sunset_heat"
  | "minimal_ink";

export interface TicketDesignPreset {
  id: TicketDesignTemplate;
  name: string;
  blurb: string;
  recommendedFor: string[];
  heroGradient: string;
  articleClass: string;
  heroOverlayClass: string;
  heroTextClass: string;
  heroMutedClass: string;
  pillClass: string;
  pricePillClass: string;
  passShellClass: string;
  passCardClass: string;
  accentRingClass: string;
  infoCardTone: "blue" | "amber" | "slate";
}

export const TICKET_DESIGN_PRESETS: TicketDesignPreset[] = [
  {
    id: "stadium_classic",
    name: "Stadium Classic",
    blurb: "Référence billetterie sportive, lisible et premium.",
    recommendedFor: ["sport", "concert"],
    heroGradient: "linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,64,175,0.92))",
    articleClass:
      "bg-[radial-gradient(circle_at_top_left,#eff6ff,transparent_28%),linear-gradient(180deg,#ffffff,#f8fafc)] border-slate-200",
    heroOverlayClass: "bg-slate-950/78",
    heroTextClass: "text-white",
    heroMutedClass: "text-blue-100/90",
    pillClass: "border border-white/15 bg-white/10 text-white/90",
    pricePillClass: "bg-amber-300 text-slate-950",
    passShellClass: "bg-[linear-gradient(180deg,#0f172a,#111827)] text-white",
    passCardClass: "bg-white/95 text-slate-950",
    accentRingClass: "border-amber-300/70",
    infoCardTone: "amber",
  },
  {
    id: "night_pulse",
    name: "Night Pulse",
    blurb: "Concert / nightlife avec énergie plus visuelle.",
    recommendedFor: ["concert", "festival"],
    heroGradient: "linear-gradient(135deg,rgba(49,46,129,0.96),rgba(190,24,93,0.86))",
    articleClass:
      "bg-[radial-gradient(circle_at_top_left,#ede9fe,transparent_24%),linear-gradient(180deg,#ffffff,#faf5ff)] border-fuchsia-100",
    heroOverlayClass: "bg-indigo-950/75",
    heroTextClass: "text-white",
    heroMutedClass: "text-fuchsia-100/90",
    pillClass: "border border-white/20 bg-white/12 text-white/90",
    pricePillClass: "bg-white text-fuchsia-700",
    passShellClass: "bg-[linear-gradient(180deg,#1e1b4b,#4c1d95)] text-white",
    passCardClass: "bg-white/95 text-slate-950",
    accentRingClass: "border-fuchsia-300/70",
    infoCardTone: "blue",
  },
  {
    id: "sunset_heat",
    name: "Sunset Heat",
    blurb: "Festival / événement populaire avec couleurs chaudes.",
    recommendedFor: ["festival", "market", "concert"],
    heroGradient: "linear-gradient(135deg,rgba(154,52,18,0.96),rgba(234,88,12,0.88),rgba(250,204,21,0.72))",
    articleClass:
      "bg-[radial-gradient(circle_at_top_left,#fff7ed,transparent_26%),linear-gradient(180deg,#fffef8,#fff7ed)] border-orange-100",
    heroOverlayClass: "bg-orange-950/58",
    heroTextClass: "text-white",
    heroMutedClass: "text-orange-100/90",
    pillClass: "border border-white/18 bg-white/14 text-white/95",
    pricePillClass: "bg-slate-950 text-amber-200",
    passShellClass: "bg-[linear-gradient(180deg,#7c2d12,#c2410c)] text-white",
    passCardClass: "bg-white text-slate-950",
    accentRingClass: "border-orange-300/70",
    infoCardTone: "amber",
  },
  {
    id: "minimal_ink",
    name: "Minimal Ink",
    blurb: "Conférence / corporate, sobre et éditorial.",
    recommendedFor: ["conference", "theatre", "conference_talk"],
    heroGradient: "linear-gradient(135deg,rgba(15,23,42,0.94),rgba(51,65,85,0.92))",
    articleClass:
      "bg-[linear-gradient(180deg,#ffffff,#f8fafc)] border-slate-200",
    heroOverlayClass: "bg-white/78",
    heroTextClass: "text-slate-950",
    heroMutedClass: "text-slate-600",
    pillClass: "border border-slate-300 bg-white/80 text-slate-700",
    pricePillClass: "bg-slate-950 text-white",
    passShellClass: "bg-[linear-gradient(180deg,#111827,#1f2937)] text-white",
    passCardClass: "bg-white text-slate-950",
    accentRingClass: "border-slate-300/70",
    infoCardTone: "slate",
  },
];

const PRESET_MAP = Object.fromEntries(
  TICKET_DESIGN_PRESETS.map((preset) => [preset.id, preset]),
) as Record<TicketDesignTemplate, TicketDesignPreset>;

export function recommendedTicketDesign(category?: string | null): TicketDesignTemplate {
  const normalized = (category || "").toLowerCase();
  if (normalized.includes("conference")) return "minimal_ink";
  if (normalized.includes("festival")) return "sunset_heat";
  if (normalized.includes("sport")) return "stadium_classic";
  if (normalized.includes("theatre")) return "minimal_ink";
  return "night_pulse";
}

export function normalizeTicketDesignTemplate(
  value?: string | null,
  category?: string | null,
): TicketDesignTemplate {
  if (value && value in PRESET_MAP) {
    return value as TicketDesignTemplate;
  }
  return recommendedTicketDesign(category);
}

export function getTicketDesignPreset(
  value?: string | null,
  category?: string | null,
): TicketDesignPreset {
  return PRESET_MAP[normalizeTicketDesignTemplate(value, category)];
}

export function getEventTicketDesignPreset(event?: Pick<Event, "ticket_design_template" | "category"> | null) {
  return getTicketDesignPreset(event?.ticket_design_template, event?.category);
}
