"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-12 text-center">
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 max-w-md">
        <p className="text-lg font-medium text-destructive">Erreur</p>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
