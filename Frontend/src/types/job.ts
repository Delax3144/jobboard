
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
    phone?: string | null;
    lastActive?: string;
  };
  status: "new" | "reviewed" | "invited" | "rejected";
  candidateId: string;
  createdAt: string;
  coverLetter?: string | null;
  cvUrl?: string | null;
  job: Job & { owner?: { lastActive: string } };
  messages: Message[];
  hasUpdate?: boolean;
  statusUpdatedAt?: string | null;
  lastViewedByCandidate: string;
  lastViewedByOwner: string;
}

export interface Message {
  id: string; applicationId: string; senderId: string; text: string; createdAt: string;
}
