import type { Job, Application } from '../types/job';
import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { useRouteResource } from './useRouteResource';

type FilterType = "all" | "new" | "reviewed" | "invited" | "rejected";

const jobErrors = {
  notFound: 'Job not found.',
  forbidden: 'You do not have access to manage this vacancy.',
  unavailable: 'Could not load the vacancy and applicants. Please try again.',
};

type ApplicationPage = { applications: Application[]; total: number; hasNextPage: boolean };

export function useJobManagement() {
  const { id } = useParams();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [filter, setFilter] = useState<FilterType>("all");
  const filterKey = JSON.stringify([id, filter]);
  const [pageState, setPageState] = useState({ filterKey, page: 1 });
  const page = pageState.filterKey === filterKey ? pageState.page : 1;
  const key = id ? JSON.stringify([filterKey, page]) : undefined;

  const loadJob = useCallback(async (signal: AbortSignal) => {
    const [jobResponse, applicationsResponse] = await Promise.all([
      api.get<Job>(`/jobs/${id}`, { signal }),
      api.get<ApplicationPage>(`/applications/job/${id}`, { params: { page, status: filter }, signal }),
    ]);
    return { job: jobResponse.data, ...applicationsResponse.data };
  }, [id, page, filter]);
  const { data, loading, error, retry } = useRouteResource(key, loadJob, jobErrors);
  const job = data?.job ?? null;
  const applications = data?.applications ?? [];
  
  const [expanded, setExpanded] = useState<{ key: string | undefined; id: string } | null>(null);
  const expandedAppId = expanded?.key === key ? expanded?.id ?? null : null;

  const handleUpdateStatus = async (appId: string, newStatus: Exclude<Application['status'], 'new'>) => {
    try {
      await api.patch(`/applications/${appId}`, { status: newStatus });
      retry();
    } catch {
      alert("Error updating status");
    }
  };

  const toggleExpand = (appId: string) => {
    setExpanded(expandedAppId === appId ? null : { key, id: appId });
  };

  const filteredApps = applications;


  return {
    job, applications, loading, error, retry, filter, setFilter, apiUrl,
    filteredApps, expandedAppId, toggleExpand, handleUpdateStatus,
    total: data?.total ?? 0,
    pagination: {
      page, hasNextPage: data?.hasNextPage ?? false,
      setPage: (nextPage: number) => setPageState({ filterKey, page: Math.max(1, nextPage) }),
    }
  };
}
