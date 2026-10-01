import type { Application } from '../types/job';
import { useEffect, useState, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/useAuth';

type ApplicationPage = {
  applications: Application[];
  stats: { total: number; invited: number; pending: number };
  hasNextPage: boolean;
};
const emptyStats = { total: 0, invited: 0, pending: 0 };

export function useApplications() {
  const { user } = useAuth();
  const userId = user?.id;
  const [pageState, setPageState] = useState({ userId, page: 1 });
  const page = pageState.userId === userId ? pageState.page : 1;
  const key = JSON.stringify([userId, page]);
  const [result, setResult] = useState<{ key: string; data: ApplicationPage } | null>(null);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const current = result?.key === key ? result.data : null;
  const error = failure?.key === key ? failure.message : '';

  const fetchData = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    try {
      const response = await api.get<ApplicationPage>('/applications/my', { params: { page }, signal });
      if (signal.aborted) return;
      setResult({ key, data: response.data });
      setFailure(null);
    } catch {
      if (!signal.aborted) setFailure({ key, message: 'Could not load your applications. Please try again.' });
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [key, page]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData, attempt]);

  return {
    apps: current?.applications ?? [],
    stats: current?.stats ?? emptyStats,
    isLoading: loading || (!current && !error), error,
    retry: () => {
      if (loading) return;
      setLoading(true);
      setAttempt(value => value + 1);
    },
    pagination: {
      page, hasNextPage: current?.hasNextPage ?? false,
      setPage: (nextPage: number) => setPageState({ userId, page: Math.max(1, nextPage) }),
    },
  };
}
