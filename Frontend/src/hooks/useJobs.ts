import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../lib/api";
import { useAuth } from "../context/useAuth";
import type { Job } from "../types/job";

export const FILTER_LOCATIONS = ["Remote", "Poland", "Ukraine", "Germany", "UK", "USA"];
export const FILTER_LEVELS = ["Intern", "Junior", "Middle", "Senior", "Lead"];
export const MAX_SALARY_LIMIT = 50000;

export function useJobs() {
  const { user } = useAuth();
  const [result, setResult] = useState<{ key: string; jobs: Job[]; hasNextPage: boolean } | null>(null);
  const [pageState, setPageState] = useState({ filterKey: '', page: 1 });
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const userId = user?.id;
  const role = user?.role;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState<number>(0);
  const [maxSalary, setMaxSalary] = useState<number>(MAX_SALARY_LIMIT);

  const params = useMemo(() => ({
    search: searchTerm.trim(), locations: selectedLocations, levels: selectedLevels,
    minSalary, maxSalary,
  }), [searchTerm, selectedLocations, selectedLevels, minSalary, maxSalary]);
  const filterKey = JSON.stringify(params);
  const page = pageState.filterKey === filterKey ? pageState.page : 1;
  const key = JSON.stringify([filterKey, page, userId, role]);
  const error = failure?.key === key ? failure.message : '';
  const [attempt, setAttempt] = useState(0);

  const fetchData = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page), search: params.search,
        minSalary: String(params.minSalary), maxSalary: String(params.maxSalary),
      });
      params.locations.forEach(value => query.append('locations', value));
      params.levels.forEach(value => query.append('levels', value));
      const jobsRes = await api.get<{ jobs: Job[]; hasNextPage: boolean }>("/jobs", { params: query, signal });
      if (signal.aborted) return;
      let ids = new Set<string>();
      if (userId && role === 'candidate') {
        const bookmarksRes = await api.get<Job[]>("/bookmarks", { signal });
        ids = new Set(bookmarksRes.data.map(job => job.id));
      }
      if (signal.aborted) return;
      setResult({ key, jobs: jobsRes.data.jobs, hasNextPage: jobsRes.data.hasNextPage });
      setSavedJobIds(ids);
      setFailure(null);
    } catch {
      if (!signal.aborted) setFailure({ key, message: 'Could not load jobs or saved jobs. Please try again.' });
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [key, page, params, userId, role]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => { void fetchData(controller.signal); }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [fetchData, attempt]);
  const currentResult = result?.key === key ? result : null;
  const pending = loading || (!currentResult && !error);
  const retry = () => {
    if (loading) return;
    setLoading(true);
    setAttempt(value => value + 1);
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

  return {
    data: { loading: pending, error, retry, savedJobIds, user },
    list: { filteredJobs: currentResult?.jobs ?? [], toggleBookmark },
    pagination: {
      page, hasNextPage: currentResult?.hasNextPage ?? false,
      setPage: (nextPage: number) => setPageState({ filterKey, page: Math.max(1, nextPage) }),
    },
    filters: {
      searchTerm, setSearchTerm,
      selectedLocations, setSelectedLocations,
      selectedLevels, setSelectedLevels,
      minSalary, setMinSalary: (value: number) => {
        setMinSalary(value);
        setMaxSalary(previous => Math.max(previous, value));
      },
      maxSalary, setMaxSalary,
      toggleFilter, clearAllFilters
    }
  };
}
