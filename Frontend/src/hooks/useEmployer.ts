import { useState, useRef } from "react";
import axios from 'axios';
import api from "../lib/api";
import { apiErrorMessage } from '../lib/apiError';
import { useAuth } from "../context/useAuth";
import type { Job, JobStatus } from "../types/job";

import { useEmployerJobs } from "./useEmployerJobs";

export const LOCATIONS = ["Remote", "Poland", "Ukraine", "Germany", "UK", "USA"];
export const LEVELS = ["Intern", "Junior", "Middle", "Senior", "Lead"];

const JOB_FORM_FIELDS = ['title', 'companyName', 'location', 'salaryFrom', 'salaryTo', 'level', 'tags', 'description', 'status'] as const;
export type JobFormField = typeof JOB_FORM_FIELDS[number];
type JobFormErrors = Partial<Record<JobFormField, string>>;

export function useEmployer() {
  const { user } = useAuth();
  const dashboard = useEmployerJobs(user?.id);
  const { jobs, isLoading, error, retry, dashboardStats, searchQuery, setSearchQuery,
    currentPage, setCurrentPage, totalPages } = dashboard;
  const currentJobs = jobs;
  const fetchData = retry;

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
  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<JobFormErrors>({});

  async function handleSubmit() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError('');
    setFieldErrors({});
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
      void fetchData();
    } catch (error) {
      const errors: JobFormErrors = {};
      if (axios.isAxiosError<{ errors?: Partial<Record<JobFormField, string[]>> }>(error)) {
        for (const field of JOB_FORM_FIELDS) {
          const message = error.response?.data?.errors?.[field]?.[0];
          if (message) errors[field] = message;
        }
      }
      setFieldErrors(errors);
      setSubmitError(Object.keys(errors).length > 0
        ? 'Please correct the highlighted fields.'
        : apiErrorMessage(error, 'Could not save the vacancy. Please try again.'));
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (window.confirm("Are you sure you want to delete this vacancy permanently?")) {
      try {
        await api.delete(`/jobs/${id}`);
        if (currentJobs.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
        else fetchData();
      } catch { alert("Delete failed"); }
    }
  }

  function resetForm() {
    setSubmitError('');
    setFieldErrors({});
    setEditingJobId(null);
    setJobStatus("published");
    setTitle(""); setCompanyName(""); setSalaryFrom(""); setSalaryTo(""); 
    setDescription(""); setTags(""); setLogoFile(null);
    setLocation(LOCATIONS[0]); setLevel(LEVELS[1]);
    const fileInput = document.getElementById('logoInput') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }

  function fillForm(job: Job) {
    if (submittingRef.current) return;
    setSubmitError('');
    setFieldErrors({});
    setEditingJobId(job.id);
    setTitle(job.title); setCompanyName(job.companyName); setLocation(job.location);
    setSalaryFrom(String(job.salaryFrom)); setSalaryTo(String(job.salaryTo));
    setLevel(job.level); setTags(job.tags); setDescription(job.description);
    setJobStatus(job.status);
    setLogoFile(null);
    const fileInput = document.getElementById('logoInput') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    
    setTimeout(() => {
      document.getElementById('job-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  return {
    data: { jobs, total: dashboard.total, isLoading, error, retry, dashboardStats },
    list: { searchQuery, setSearchQuery, currentJobs, currentPage, setCurrentPage, totalPages, handleDelete, fillForm },
    form: { title, setTitle, companyName, setCompanyName, location, setLocation, salaryFrom, setSalaryFrom, salaryTo, setSalaryTo, level, setLevel, tags, setTags, description, setDescription, status, setJobStatus, setLogoFile, editingJobId, handleSubmit, resetForm, isSubmitting, submitError, fieldErrors }
  };
}
