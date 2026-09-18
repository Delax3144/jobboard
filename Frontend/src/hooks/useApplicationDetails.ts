import type { Application } from '../types/job';
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

export function useApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/applications/${id}`)
      .then(res => {
        setApp(res.data);
        window.dispatchEvent(new Event('update_unread'));
      })
      .catch(err => console.error("Failed to load application details", err))
      .finally(() => setLoading(false));
  }, [id]);

  const isInvited = app?.status === 'invited';
  const isRejected = app?.status === 'rejected';
  const canChat = app?.status !== 'new';

  return {
    app,
    loading,
    navigate,
    apiUrl,
    isInvited,
    isRejected,
    canChat
  };
}
