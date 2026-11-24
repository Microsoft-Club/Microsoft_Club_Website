import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export type LoadStatus = 'loading' | 'ready' | 'error';

const toList = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  const nested = (payload as { data?: unknown } | null)?.data;
  return Array.isArray(nested) ? (nested as T[]) : [];
};

export function useApiList<T>(path: string) {
  const [items, setItems] = useState<T[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    api
      .get(path, { signal: controller.signal })
      .then((res) => {
        setItems(toList<T>(res.data));
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.error(`Failed to load ${path}`, err);
        setStatus('error');
      });
    return () => controller.abort();
  }, [path, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { items, status, retry };
}
