"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UsePollingOptions<T> {
  fetcher: () => Promise<T>;
  intervalMs?: number;
  enabled?: boolean;
}

interface UsePollingResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePolling<T>({
  fetcher,
  intervalMs = 30000,
  enabled = true,
}: UsePollingOptions<T>): UsePollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refetch = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Fetch error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    setIsLoading(true);
    refetch();
    const interval = setInterval(refetch, intervalMs);
    return () => clearInterval(interval);
  }, [refetch, intervalMs, enabled]);

  return { data, isLoading, error, refetch };
}
