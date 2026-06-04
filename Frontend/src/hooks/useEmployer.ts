// src/hooks/useEmployer.ts
import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Job, Application, JobStatus } from "../types/job";

export const LOCATIONS = ["Remote", "Poland", "Ukraine", "Germany", "UK", "USA"];
export const LEVELS = ["Intern", "Junior", "Middle", "Senior", "Lead"];

export function useEmployer() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  // Form State
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [level, setLevel] = useState(LEVELS[1]);
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [status, setJobStatus] = useState<JobStatus>("published");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.get(`/jobs?ownerId=${user.id}`),
        api.get('/applications/owner') 
      ]);
      setJobs(jobsRes.data.jobs);
      setApplications(appsRes.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, [user]);

  const dashboardStats = useMemo(() => ({
    active: jobs.filter(j => j.status === "published").length,
    newApps: applications.filter(a => a.status === "new").length,
    totalApps: applications.length
  }), [jobs, applications]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [jobs, searchQuery]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  
  const currentJobs = useMemo(() => {
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    return filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  }, [filteredJobs, currentPage]);

  async function handleSubmit() {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('companyName', companyName);
    formData.append('location', location);
    formData.append('level', level);
    formData.append('salaryFrom', salaryFrom);
    formData.append('salaryTo', salaryTo);
    formData.append('tags', tags);
    formData.append('description', description); 
    formData.append('status', status);
    if (logoFile) formData.append('logo', logoFile);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editingJobId) await api.patch(`/jobs/${editingJobId}`, formData, config);
      else await api.post('/jobs', formData, config);
      resetForm();
      fetchData();
    } catch (err) { alert("Error saving job"); }
  }

  async function handleDelete(id: string) {
    if (window.confirm("Are you sure you want to delete this vacancy permanently?")) {
      try {
        await api.delete(`/jobs/${id}`);
        fetchData();
        if (currentJobs.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
      } catch (err) { alert("Delete failed"); }
    }
  }

  function resetForm() {
    setEditingJobId(null);
    setTitle(""); setCompanyName(""); setSalaryFrom(""); setSalaryTo(""); 
    setDescription(""); setTags(""); setLogoFile(null);
    setLocation(LOCATIONS[0]); setLevel(LEVELS[1]);
    const fileInput = document.getElementById('logoInput') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }

  function fillForm(job: Job) {
    setEditingJobId(job.id);
    setTitle(job.title); setCompanyName(job.companyName); setLocation(job.location);
    setSalaryFrom(String(job.salaryFrom)); setSalaryTo(String(job.salaryTo));
    setLevel(job.level); setTags(job.tags); setDescription(job.description);
    setJobStatus(job.status);
    
    setTimeout(() => {
      document.getElementById('job-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // Возвращаем аккуратно сгруппированные данные
  return {
    data: { jobs, applications, isLoading, dashboardStats },
    list: { searchQuery, setSearchQuery, currentJobs, filteredJobs, currentPage, setCurrentPage, totalPages, handleDelete, fillForm },
    form: { title, setTitle, companyName, setCompanyName, location, setLocation, salaryFrom, setSalaryFrom, salaryTo, setSalaryTo, level, setLevel, tags, setTags, description, setDescription, status, setJobStatus, setLogoFile, editingJobId, handleSubmit, resetForm }
  };
}