"use client";

export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-12 text-center">
      <p className="text-lg font-medium text-destructive">Erreur</p>
      <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
      >
        Réessayer
      </button>
    </div>
  );
}
