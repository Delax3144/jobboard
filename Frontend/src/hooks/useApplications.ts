import type { Application } from '../types/job';
// src/hooks/useApplications.ts
import { useEffect, useState, useMemo } from "react";
import api from "../lib/api";

export function useApplications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/applications/my")
      .then((res) => {
        setApps(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  // useMemo гарантирует, что статистика пересчитывается только если изменился массив apps
  const stats = useMemo(() => {
    return {
      total: apps.length,
      invited: apps.filter(a => a.status === 'invited').length,
      pending: apps.filter(a => a.status === 'new' || a.status === 'reviewed').length,
    };
  }, [apps]);

  return { apps, isLoading, stats };
}
