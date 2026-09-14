// src/hooks/useJobs.ts
import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../lib/api";
import { useAuth } from "../context/useAuth";
import type { Job } from "../types/job";

export const FILTER_LOCATIONS = ["Remote", "Poland", "Ukraine", "Germany", "UK", "USA"];
export const FILTER_LEVELS = ["Intern", "Junior", "Middle", "Senior", "Lead"];
export const MAX_SALARY_LIMIT = 50000;

export function useJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userId = user?.id;
  const role = user?.role;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState<number>(0);
  const [maxSalary, setMaxSalary] = useState<number>(MAX_SALARY_LIMIT);

  const fetchData = useCallback(async () => {
    try {
      const jobsRes = await api.get("/jobs");
      const data = Array.isArray(jobsRes.data) ? jobsRes.data : (jobsRes.data.jobs || []);
      setJobs(data);

      if (userId && role === 'candidate') {
        const bookmarksRes = await api.get<Job[]>("/bookmarks");
        const ids = new Set(bookmarksRes.data.map((job) => job.id));
        setSavedJobIds(ids);
      } else {
        setSavedJobIds(new Set());
      }
      setError('');
    } catch {
      setError('Could not load jobs or saved jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId, role]);
  useEffect(() => { void fetchData(); }, [fetchData]);
  const retry = () => {
    if (loading) return;
    setLoading(true);
    void fetchData();
  };

  const toggleBookmark = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!user) return alert("Please log in as a candidate to save jobs.");
    if (user.role !== 'candidate') return alert("Only candidates can save jobs.");

    try {
      const res = await api.post(`/bookmarks/${jobId}`);
      setSavedJobIds(prev => {
        const newSet = new Set(prev);
        if (res.data.saved) newSet.add(jobId); else newSet.delete(jobId);
        return newSet;
      });
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    }
  };

  const toggleFilter = (setState: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setState(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedLocations([]);
    setSelectedLevels([]);
    setMinSalary(0);
    setMaxSalary(MAX_SALARY_LIMIT);
  };

  const filteredJobs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return jobs.filter(job => {
      const matchesSearch = !query ||
        job.title.toLowerCase().includes(query) ||
        job.companyName.toLowerCase().includes(query) ||
        job.tags?.toLowerCase().includes(query);
      
      const matchesLocation = selectedLocations.length === 0 || 
        selectedLocations.some(loc => job.location?.toLowerCase().includes(loc.toLowerCase()));

      const matchesLevel = selectedLevels.length === 0 || 
        selectedLevels.some(lvl => {
          const target = lvl.toLowerCase();
          if (job.level) return job.level.toLowerCase() === target;
          return job.title.toLowerCase().includes(target) || (job.tags && job.tags.toString().toLowerCase().includes(target));
        });

      const jobMin = job.salaryFrom || 0;
      const jobMax = job.salaryTo || 0;
      const matchesSalary = jobMax >= minSalary && jobMin <= maxSalary;

      return matchesSearch && matchesLocation && matchesLevel && matchesSalary;
    });
  }, [jobs, searchTerm, selectedLocations, selectedLevels, minSalary, maxSalary]);

  return {
    data: { loading, error, retry, savedJobIds, user },
    list: { filteredJobs, toggleBookmark },
    filters: {
      searchTerm, setSearchTerm,
      selectedLocations, setSelectedLocations,
      selectedLevels, setSelectedLevels,
      minSalary, setMinSalary,
      maxSalary, setMaxSalary,
      toggleFilter, clearAllFilters
    }
  };
}
