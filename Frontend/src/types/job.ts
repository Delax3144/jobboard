// src/types/job.ts

export type JobStatus = "published" | "draft" | "archived";

export interface Job {
  id: string; 
  title: string; 
  companyName: string; 
  companyLogo?: string;
  location: string; 
  salaryFrom: number; 
  salaryTo: number;
  level: string; 
  tags: string; 
  description: string;
  status: JobStatus; 
  ownerId: string; 
  createdAt: string;
}

export interface Application {
  id: string; 
  jobId: string;
  candidate: { 
    id: string; 
    email: string; 
    avatarUrl?: string; 
    firstName?: string; 
    lastName?: string; 
  };
  status: "new" | "reviewed" | "invited" | "rejected";
}