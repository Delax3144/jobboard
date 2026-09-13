// src/hooks/useJobDetails.ts
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/useAuth";
import type { Job } from "../types/job";

export function useJobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [job, setJob] = useState<Job | null>(null);
  const [loadedId, setLoadedId] = useState<string>();
  const isLoading = loadedId !== id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    
    api.get(`/jobs/${id}`)
      .then(res => { if (!cancelled) setJob(res.data); })
      .catch(err => { if (!cancelled) setJob(null); console.error("Ошибка загрузки:", err); })
      .finally(() => { if (!cancelled) setLoadedId(id); });

    if (user?.role === 'candidate') {
      api.get<Job[]>("/bookmarks")
        .then(res => {
          setIsBookmarked(res.data.some((b) => b.id === id));
        })
        .catch(err => console.error("Ошибка загрузки закладок:", err));
    }
    return () => { cancelled = true; };
  }, [id, user]);

  const toggleBookmark = async () => {
    if (!user || user.role !== 'candidate' || !job) return;
    try {
      await api.post(`/bookmarks/${job.id}`);
      setIsBookmarked(!isBookmarked); 
    } catch (err) {
      console.error("Ошибка переключения закладки:", err);
    }
  };

  return {
    job, isLoading, apiUrl, user,
    modal: { isModalOpen, setIsModalOpen, isSent, setIsSent },
    bookmarks: { isBookmarked, toggleBookmark }
  };
}
