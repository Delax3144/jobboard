// src/hooks/usePublicProfile.ts
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

export function usePublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/auth/users/${id}`)
      .then(res => setCandidate(res.data))
      .catch(err => console.error("Failed to load profile", err))
      .finally(() => setLoading(false));
  }, [id]);

  // Вычисляем производные данные только когда изменяется candidate
  const profileData = useMemo(() => {
    if (!candidate) return null;

    return {
      isPrivate: candidate.isPublic === false || candidate.status === "Hidden",
      skills: candidate.skills ? candidate.skills.split(',').map((s: string) => s.trim()) : [],
      bio: candidate.bio || "This candidate hasn't added a bio yet.",
      // Безопасный парсинг JSON для опыта работы
      experience: typeof candidate.experience === 'string' 
        ? JSON.parse(candidate.experience) 
        : (candidate.experience || [])
    };
  }, [candidate]);

  return {
    navigate,
    apiUrl,
    candidate,
    loading,
    profileData
  };
}