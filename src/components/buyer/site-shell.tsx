import type { BuyerIdentity } from "@/lib/buyer-session";
import { BuyerSiteHeader } from "@/components/buyer/site-header";

interface BuyerSiteShellProps {
  buyer: BuyerIdentity | null;
  children: React.ReactNode;
}

export function BuyerSiteShell({ buyer, children }: BuyerSiteShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef4ff_0%,#fffaf2_42%,#ffffff_100%)] text-slate-950">
      <BuyerSiteHeader buyer={buyer} />
      <main>{children}</main>
    </div>
  );
}
