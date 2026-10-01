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

export function useJobManagement() {
  const { id } = useParams();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const loadJob = useCallback(async (signal: AbortSignal) => {
    const [jobResponse, applicationsResponse] = await Promise.all([
      api.get<Job>(`/jobs/${id}`, { signal }),
      api.get<Application[]>(`/applications/job/${id}`, { signal }),
    ]);
    return { job: jobResponse.data, applications: applicationsResponse.data };
  }, [id]);
  const { data, loading, error, retry, updateData } = useRouteResource(id, loadJob, jobErrors);
  const job = data?.job ?? null;
  const applications = data?.applications ?? [];
  
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  const handleUpdateStatus = async (appId: string, newStatus: Exclude<Application['status'], 'new'>) => {
    try {
      await api.patch(`/applications/${appId}`, { status: newStatus });
      updateData(current => ({
        ...current,
        applications: current.applications.map(app => app.id === appId ? { ...app, status: newStatus } : app),
      }));
    } catch {
      alert("Error updating status");
    }
  };

  const toggleExpand = (appId: string) => {
    setExpandedAppId(expandedAppId === appId ? null : appId);
  };

  const filteredApps = filter === "all" ? applications : applications.filter(a => a.status === filter);


  return {
    job, applications, loading, error, retry, filter, setFilter, apiUrl,
    filteredApps, expandedAppId, toggleExpand, handleUpdateStatus
  };
}
