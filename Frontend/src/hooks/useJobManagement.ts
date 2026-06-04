// src/hooks/useJobManagement.ts
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";

type FilterType = "all" | "new" | "reviewed" | "invited" | "rejected";

export function useJobManagement() {
  const { id } = useParams();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
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

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      await api.patch(`/applications/${appId}`, { status: newStatus });
      setApplications(apps => apps.map(app => app.id === appId ? { ...app, status: newStatus } : app));
    } catch (err) {
      alert("Error updating status");
    }
  };

  const toggleExpand = (appId: string) => {
    setExpandedAppId(expandedAppId === appId ? null : appId);
  };

  const filteredApps = filter === "all" ? applications : applications.filter(a => a.status === filter);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'reviewed': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' }; 
      case 'invited': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' }; 
      case 'rejected': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' }; 
      default: return { bg: 'rgba(255, 255, 255, 0.05)', text: '#aaa', border: 'rgba(255, 255, 255, 0.1)' }; 
    }
  };

  return {
    job, applications, loading, filter, setFilter, apiUrl,
    filteredApps, expandedAppId, toggleExpand, handleUpdateStatus, getStatusColor
  };
}