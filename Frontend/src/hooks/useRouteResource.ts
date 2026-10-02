import { useEffect, useState } from 'react';
import axios from 'axios';

type LoadError = { message: string; retryable: boolean };
type ErrorMessages = { notFound: string; forbidden: string; unavailable: string };
type ResourceResult<T> = {
  key: string;
  attempt: number;
  data: T | null;
  error: LoadError | null;
};

function loadError(error: unknown, messages: ErrorMessages): LoadError {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  if (status === 404) return { message: messages.notFound, retryable: false };
  if (status === 403) return { message: messages.forbidden, retryable: false };
  if (status === 401) return { message: 'Please sign in again to continue.', retryable: false };
  return { message: messages.unavailable, retryable: true };
}

export function useRouteResource<T>(
  key: string | undefined,
  load: (signal: AbortSignal) => Promise<T>,
  messages: ErrorMessages,
  retainErrorOnRetry = false,
) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<ResourceResult<T> | null>(null);
  const current = result !== null && result.key === key && result.attempt === attempt ? result : null;

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    void load(controller.signal).then(data => {
      if (!controller.signal.aborted) setResult({ key, attempt, data, error: null });
    }).catch(error => {
      if (!controller.signal.aborted) setResult({ key, attempt, data: null, error: loadError(error, messages) });
    });
    return () => controller.abort();
  }, [key, attempt, load, messages]);

  function updateData(update: (data: T) => T) {
    setResult(previous => previous !== null && previous.key === key && previous.attempt === attempt && previous.data !== null
      ? { ...previous, data: update(previous.data) }
      : previous);
  }

  return {
    data: current?.data ?? null,
    loading: Boolean(key) && current === null,
    error: key ? current?.error ?? (retainErrorOnRetry && result?.key === key ? result.error : null)
      : { message: messages.notFound, retryable: false },
    retry: () => setAttempt(previous => previous + 1),
    updateData,
  };
}
