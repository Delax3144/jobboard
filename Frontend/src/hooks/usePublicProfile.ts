import type { User } from '../types/user';
import { useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useRouteResource } from './useRouteResource';

const profileErrors = {
  notFound: 'Candidate not found.',
  forbidden: 'You do not have access to this profile.',
  unavailable: 'Could not load the candidate profile. Please try again.',
};

export function usePublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  
  const loadProfile = useCallback(async (signal: AbortSignal) => {
    const { data } = await api.get<User>(`/auth/users/${id}`, { signal });
    return data;
  }, [id]);
  const { data: candidate, loading, error, retry } = useRouteResource(id, loadProfile, profileErrors);

  const profileData = useMemo(() => {
    if (!candidate) return null;

    return {
      isPrivate: candidate.isPublic === false || candidate.status === "Hidden",
      skills: candidate.skills ? candidate.skills.split(',').map((s: string) => s.trim()) : [],
      bio: candidate.bio || "This candidate hasn't added a bio yet.",
      experience: (candidate.experience || [])
    };
  }, [candidate]);

  return {
    navigate,
    apiUrl,
    candidate,
    loading,
    error,
    retry,
    profileData
  };
}
