import type { Application } from '../types/job';
import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../lib/api";

export function useApplications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    await api.get("/applications/my")
      .then((res) => {
        setApps(res.data);
        setError('');
      })
      .catch(() => { setError('Could not load your applications. Please try again.'); })
      .finally(() => { setIsLoading(false); });
  }, []);
  useEffect(() => { void fetchData(); }, [fetchData]);
  const retry = () => {
    if (isLoading) return;
    setIsLoading(true);
    void fetchData();
  };

  const stats = useMemo(() => {
    return {
      total: apps.length,
      invited: apps.filter(a => a.status === 'invited').length,
      pending: apps.filter(a => a.status === 'new' || a.status === 'reviewed').length,
    };
  }, [apps]);

  return { apps, isLoading, error, retry, stats };
}
