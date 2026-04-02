import Link from "next/link";
import type { BuyerIdentity } from "@/lib/buyer-session";

interface BuyerSiteHeaderProps {
  buyer: BuyerIdentity | null;
}

export function BuyerSiteHeader({ buyer }: BuyerSiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1f6feb,#0d1117)] text-sm font-semibold text-white shadow-lg shadow-blue-500/20">
              AT
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                AWA Tickets
              </p>
              <p className="text-base font-semibold text-slate-900">Billetterie & test UI</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
            <Link href="/catalog" className="transition-colors hover:text-slate-950">
              Événements
            </Link>
            <Link href="/my-tickets" className="transition-colors hover:text-slate-950">
              Mes billets
            </Link>
            <Link href="/events" className="transition-colors hover:text-slate-950">
              Portail organisateur
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {buyer?.phone ? (
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-right text-xs text-slate-500 shadow-sm">
              <div className="font-semibold text-slate-900">{buyer.fullName || "Acheteur test"}</div>
              <div>{buyer.phone}</div>
            </div>
          ) : (
            <div className="rounded-full border border-dashed border-slate-300 px-4 py-2 text-xs text-slate-500">
              Aucun acheteur sélectionné
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
