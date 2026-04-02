"use client";

import { useState } from "react";
import { withdrawAction } from "@/actions/payout-actions";

interface WithdrawButtonProps {
  label: string;
}

export function WithdrawButton({ label }: WithdrawButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleWithdraw() {
    if (!confirm("Confirmer le retrait ?")) return;
    setPending(true);
    setError(null);
    const result = await withdrawAction();
    setPending(false);
    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <div>
      <button
        onClick={handleWithdraw}
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? "Retrait en cours..." : label}
      </button>
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
