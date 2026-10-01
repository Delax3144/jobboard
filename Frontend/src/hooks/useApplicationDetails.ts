import type { Application } from '../types/job';
import { useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useRouteResource } from './useRouteResource';

const applicationErrors = {
  notFound: 'Application not found.',
  forbidden: 'You do not have access to this application.',
  unavailable: 'Could not load the application. Please try again.',
};

export function useApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  
  const loadApplication = useCallback(async (signal: AbortSignal) => {
    const { data } = await api.get<Application>(`/applications/${id}`, { signal });
    return data;
  }, [id]);
  const { data: app, loading, error, retry } = useRouteResource(id, loadApplication, applicationErrors);

  useEffect(() => {
    if (app) window.dispatchEvent(new Event('update_unread'));
  }, [app]);

  const isInvited = app?.status === 'invited';
  const isRejected = app?.status === 'rejected';
  const canChat = Boolean(app && app.status !== 'new');

  return {
    app,
    loading,
    error,
    retry,
    navigate,
    apiUrl,
    isInvited,
    isRejected,
    canChat
  };
}
