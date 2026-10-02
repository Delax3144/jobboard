import { useCallback, useState } from 'react';
import type { SetStateAction } from 'react';
import api from '../lib/api';
import type { Job } from '../types/job';
import { useRouteResource } from './useRouteResource';

export type EmployerJob = Job & {
  totalApplicants: number;
  newApplicants: number;
  applicantPreviews: Array<{ id: string; candidate: { email: string } }>;
};
type Dashboard = { jobs: EmployerJob[]; total: number; totalPages: number;
  stats: { active: number; newApps: number; totalApps: number } };
const messages = {
  notFound: 'Could not find your vacancies.', forbidden: 'Employers only.',
  unavailable: 'Could not load your vacancies and applications. Please try again.',
};

export function useEmployerJobs(userId: string | undefined) {
  const [searchQuery, setSearchQuery] = useState('');
  const filterKey = JSON.stringify([userId, searchQuery.trim()]);
  const [pageState, setPageState] = useState({ filterKey, page: 1 });
  const currentPage = pageState.filterKey === filterKey ? pageState.page : 1;
  const key = userId ? JSON.stringify([filterKey, currentPage]) : undefined;
  const load = useCallback(async (signal: AbortSignal) => {
    const response = await api.get<Dashboard>('/jobs/mine', {
      params: { page: currentPage, search: searchQuery.trim() }, signal,
    });
    return response.data;
  }, [currentPage, searchQuery]);
  const resource = useRouteResource(key, load, messages, true);
  const setCurrentPage = (value: SetStateAction<number>) => {
    setPageState({ filterKey, page: Math.max(1, typeof value === 'function' ? value(currentPage) : value) });
  };
  return {
    jobs: resource.data?.jobs ?? [], total: resource.data?.total ?? 0,
    totalPages: resource.data?.totalPages ?? 0,
    dashboardStats: resource.data?.stats ?? { active: 0, newApps: 0, totalApps: 0 },
    isLoading: resource.loading, error: resource.error?.message ?? '', retry: resource.retry,
    searchQuery, setSearchQuery, currentPage, setCurrentPage,
  };
}
