"use client";

import { getTicketDesignPreset, recommendedTicketDesign, TICKET_DESIGN_PRESETS, type TicketDesignTemplate } from "@/lib/ticket-designs";

interface TicketDesignPickerProps {
  category?: string | null;
  coverImageUrl?: string | null;
  value: TicketDesignTemplate;
  onChange: (value: TicketDesignTemplate) => void;
}

export function TicketDesignPicker({
  category,
  coverImageUrl,
  value,
  onChange,
}: TicketDesignPickerProps) {
  const recommended = recommendedTicketDesign(category);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Design du billet</p>
          <p className="text-xs text-muted-foreground">
            Choisissez un pass parmi 4 propositions. L’image de couverture est utilisée dans l’aperçu quand elle existe.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(recommended)}
          className="inline-flex h-9 items-center rounded-full border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:border-slate-400"
        >
          Utiliser le recommandé
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TICKET_DESIGN_PRESETS.map((preset) => {
          const selected = preset.id === value;
          const preview = getTicketDesignPreset(preset.id, category);
          const backgroundImage = coverImageUrl
            ? `${preview.heroGradient}, url(${coverImageUrl})`
            : preview.heroGradient;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.id)}
              className={`overflow-hidden rounded-[24px] border text-left transition ${selected ? "border-slate-950 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.5)]" : "border-slate-200 hover:border-slate-300 hover:shadow-[0_18px_45px_-32px_rgba(15,23,42,0.3)]"}`}
            >
              <div className="p-3">
                <div
                  className={`overflow-hidden rounded-[20px] border ${preview.accentRingClass} ${preview.articleClass}`}
                >
                  <div
                    className="relative h-40 bg-cover bg-center"
                    style={{ backgroundImage }}
                  >
                    <div className={`absolute inset-0 ${preview.heroOverlayClass}`} />
                    <div className="relative flex h-full flex-col justify-between p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${preview.pillClass}`}>
                          {category || "concert"}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${preview.pricePillClass}`}>
                          5 000 XOF
                        </span>
                      </div>
                      <div>
                        <p className={`text-lg font-semibold ${preview.heroTextClass}`}>Wommah Contest</p>
                        <p className={`mt-1 text-xs ${preview.heroMutedClass}`}>Impact Hub, Dakar</p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 ${preview.passCardClass}`}>
                    <div className="grid grid-cols-2 gap-3">
                      <PreviewStat label="Date" value="03 avr. 2026" />
                      <PreviewStat label="Heure" value="13:10 GMT" />
                    </div>
                    <div className="mt-3 rounded-[18px] border border-dashed border-slate-300 bg-white p-3 text-center text-xs text-slate-500">
                      Aperçu QR / ticket / portes
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 bg-white px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{preset.name}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{preset.blurb}</p>
                  </div>
                  {preset.id === recommended ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Recommandé
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}
