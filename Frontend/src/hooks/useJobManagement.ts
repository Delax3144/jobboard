import type { Job, Application } from '../types/job';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";

type FilterType = "all" | "new" | "reviewed" | "invited" | "rejected";

export function useJobManagement() {
  const { id } = useParams();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appsRes] = await Promise.all([
          api.get(`/jobs/${id}`),
          api.get(`/applications/job/${id}`)
        ]);
        setJob(jobRes.data);
        setApplications(appsRes.data);
      } catch (err) {
        console.error("Failed to load applicants", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleUpdateStatus = async (appId: string, newStatus: Exclude<Application['status'], 'new'>) => {
    try {
      await api.patch(`/applications/${appId}`, { status: newStatus });
      setApplications(apps => apps.map(app => app.id === appId ? { ...app, status: newStatus } : app));
    } catch {
      alert("Error updating status");
    }
  };

  const toggleExpand = (appId: string) => {
    setExpandedAppId(expandedAppId === appId ? null : appId);
  };

  const filteredApps = filter === "all" ? applications : applications.filter(a => a.status === filter);


  return {
    job, applications, loading, filter, setFilter, apiUrl,
    filteredApps, expandedAppId, toggleExpand, handleUpdateStatus
  };
}
