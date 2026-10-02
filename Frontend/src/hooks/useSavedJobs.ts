import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../lib/api';
import type { Job } from '../types/job';
import { useRouteResource } from './useRouteResource';

type SavedPage = { jobs: Array<Job & { savedAt: string }>; total: number; hasNextPage: boolean };
const messages = { notFound: 'Saved jobs not found.', forbidden: 'Access Denied',
  unavailable: "Couldn't load your saved jobs. Please try again." };

export function useSavedJobs() {
  const { user } = useAuth();
  const userId = user?.role === 'candidate' ? user.id : undefined;
  const [pageState, setPageState] = useState({ userId, page: 1 });
  const page = pageState.userId === userId ? pageState.page : 1;
  const load = useCallback(async (signal: AbortSignal) => {
    const response = await api.get<SavedPage>('/bookmarks', { params: { page }, signal });
    return response.data;
  }, [page]);
  const resource = useRouteResource(userId ? JSON.stringify([userId, page]) : undefined, load, messages, true);
  const jobs = resource.data?.jobs ?? [];
  const requests = useRef(new Map<string, AbortController>());
  const currentPage = useRef(page);
  const [removing, setRemoving] = useState({ userId, ids: new Set<string>() });
  const [failure, setFailure] = useState<{ userId: string; message: string } | null>(null);
  useEffect(() => { currentPage.current = page; }, [page]);
  useEffect(() => {
    const pending = requests.current;
    return () => { pending.forEach(controller => controller.abort()); pending.clear(); };
  }, [userId]);
  const setPage = (next: number) => setPageState({ userId, page: Math.max(1, next) });

  const removeBookmark = async (jobId: string) => {
    if (!userId || requests.current.has(jobId)) return;
    const controller = new AbortController();
    requests.current.set(jobId, controller);
    setRemoving({ userId, ids: new Set(requests.current.keys()) });
    setFailure(null);
    try {
      await api.delete(`/bookmarks/${jobId}`, { signal: controller.signal });
      if (controller.signal.aborted) return;
      if (jobs.length === 1 && page > 1 && currentPage.current === page) setPage(page - 1);
      else resource.retry();
    } catch {
      if (!controller.signal.aborted) setFailure({ userId, message: "Couldn't remove this job. Please try again." });
    } finally {
      if (!controller.signal.aborted) {
        requests.current.delete(jobId);
        setRemoving({ userId, ids: new Set(requests.current.keys()) });
      }
    }
  };
  return { user, savedJobs: jobs, total: resource.data?.total ?? 0, loading: resource.loading,
    error: userId ? resource.error?.message : undefined, retry: resource.retry,
    removalError: failure?.userId === userId ? failure?.message : undefined,
    removingIds: removing.userId === userId ? removing.ids : new Set<string>(), removeBookmark,
    pagination: { page, setPage, hasNextPage: resource.data?.hasNextPage ?? false } };
}
