// src/hooks/useJobDetails.ts
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Job } from "../types/job";

export function useJobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    
    api.get(`/jobs/${id}`)
      .then(res => setJob(res.data))
      .catch(err => console.error("Ошибка загрузки:", err))
      .finally(() => setIsLoading(false));

    if (user?.role === 'candidate') {
      api.get("/bookmarks")
        .then(res => {
          setIsBookmarked(res.data.some((b: any) => b.id === id));
        })
        .catch(err => console.error("Ошибка загрузки закладок:", err));
    }
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