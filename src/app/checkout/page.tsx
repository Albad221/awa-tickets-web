import Link from "next/link";
import { ExternalLink, ShieldCheck, TicketCheck } from "lucide-react";
import { SimulatePaymentForm } from "@/components/buyer/simulate-payment-form";
import { BuyerSiteShell } from "@/components/buyer/site-shell";
import { BUYER_LAB_MODE, buyerApiFetch } from "@/lib/buyer-api";
import { getBuyerIdentity, getCheckoutState } from "@/lib/buyer-session";
import { formatCFA } from "@/lib/format";
import type { PaymentStatus } from "@/lib/types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function CheckoutPage() {
  const [buyer, checkout] = await Promise.all([getBuyerIdentity(), getCheckoutState()]);

  let payment: PaymentStatus | null = null;
  if (buyer?.phone && checkout?.paymentId) {
    try {
      payment = await buyerApiFetch<PaymentStatus>(
        `/api/payments/${checkout.paymentId}/status`,
        buyer.phone
      );
    } catch {
      payment = null;
    }
  }

  return (
    <BuyerSiteShell buyer={buyer}>
      <section className="mx-auto max-w-5xl space-y-8 px-4 py-12 md:px-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Checkout</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Suivi du paiement</h1>
          <p className="text-base leading-7 text-slate-600">
            Cette page lit les endpoints de statut de paiement et de wallet acheteur. En mode lab, elle peut aussi simuler le webhook Wave pour déclencher la suite du flux.
          </p>
        </div>

        {!checkout ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-slate-950">Aucun checkout en cours</p>
            <p className="mt-2 text-sm text-slate-600">
              Créez une commande depuis le catalogue pour tester le parcours d&apos;achat.
            </p>
            <Link
              href="/catalog"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Ouvrir le catalogue
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Commande</p>
                  <h2 className="text-2xl font-semibold text-slate-950">{checkout.orderNumber}</h2>
                </div>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
                  {payment?.status || "processing"}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Événement</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{checkout.eventTitle}</p>
                  <p className="mt-1 text-sm text-slate-600">{checkout.tierName}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Montant</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {checkout.total === 0 ? "Gratuit" : formatCFA(checkout.total)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{checkout.quantity} billet(s)</p>
                </div>
              </div>

              {checkout.waveLaunchUrl && (
                <a
                  href={checkout.waveLaunchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Ouvrir la page de paiement
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-sky-700" />
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-950">Ce qui se passe derrière</p>
                    <p className="text-sm text-slate-600">
                      Le paiement confirmé déclenche ensuite le webhook backend, l&apos;émission des billets, puis la mise à disposition via les endpoints acheteur.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {BUYER_LAB_MODE && <SimulatePaymentForm />}

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <TicketCheck className="mt-0.5 h-5 w-5 text-sky-700" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">Vérifier les billets</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Une fois le statut passé à <strong>succeeded</strong>, ouvrez le wallet acheteur pour confirmer que les billets sont visibles.
                    </p>
                    <Link
                      href="/my-tickets"
                      className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-900 hover:border-slate-400"
                    >
                      Ouvrir mes billets
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </BuyerSiteShell>
  );
}
