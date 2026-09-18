import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/useAuth";
import type { Job } from "../types/job";

export function useJobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [loadedJob, setJob] = useState<Job | null>(null);
  const [loadedId, setLoadedId] = useState<string>();
  const isLoading = loadedId !== id;
  const job = loadedId === id ? loadedJob : null;
  const userId = user?.id;
  const role = user?.role;
  const [state, setState] = useState({
    context: { id, userId, role }, isModalOpen: false, isSent: false, isBookmarked: false, isSaving: false,
  });
  if (state.context.id !== id || state.context.userId !== userId || state.context.role !== role) {
    setState({ context: { id, userId, role }, isModalOpen: false, isSent: false, isBookmarked: false, isSaving: false });
  }
  const { context, isModalOpen, isSent, isBookmarked, isSaving } = state;
  const updateState = (patch: Partial<Omit<typeof state, 'context'>>) => {
    setState(current => current.context === context ? { ...current, ...patch } : current);
  };
  const setIsModalOpen = (value: boolean) => updateState({ isModalOpen: value });
  const setIsSent = (value: boolean) => updateState({ isSent: value });
  const bookmarkVersion = useRef(0);
  const pendingBookmarks = useRef(new Set<typeof context>());

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const version = ++bookmarkVersion.current;
    
    api.get(`/jobs/${id}`)
      .then(res => { if (!cancelled) setJob(res.data); })
      .catch(err => { if (!cancelled) setJob(null); console.error("Ошибка загрузки:", err); })
      .finally(() => { if (!cancelled) setLoadedId(id); });

    if (role === 'candidate') {
      api.get<Job[]>("/bookmarks")
        .then(res => {
          if (!cancelled && version === bookmarkVersion.current) {
            setState(current => ({ ...current, isBookmarked: res.data.some((b) => b.id === id) }));
          }
        })
        .catch(err => console.error("Ошибка загрузки закладок:", err));
    }
    return () => { cancelled = true; };
  }, [id, userId, role]);

  const toggleBookmark = async () => {
    if (!userId || role !== 'candidate' || !job || pendingBookmarks.current.has(context)) return;
    pendingBookmarks.current.add(context);
    bookmarkVersion.current += 1;
    updateState({ isSaving: true });
    try {
      const res = await api.post<{ saved: boolean }>(`/bookmarks/${job.id}`);
      updateState({ isBookmarked: res.data.saved });
    } catch (err) {
      console.error("Ошибка переключения закладки:", err);
    } finally {
      pendingBookmarks.current.delete(context);
      updateState({ isSaving: false });
    }
  };

  return {
    job, isLoading, apiUrl, user,
    modal: { isModalOpen, setIsModalOpen, isSent, setIsSent },
    bookmarks: { isBookmarked, isSaving, toggleBookmark }
  };
}
