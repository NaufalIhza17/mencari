export type Status = "Applied" | "Interview" | "Offer" | "Rejected";
export type WorkType = "Remote" | "Hybrid" | "On-site";
export type EmploymentType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship";
export type Priority = "Low" | "Medium" | "High";
export type SalaryMode = "Exact" | "Range" | "Negotiable";
export type Source = "LinkedIn" | "JobStreet" | "Glassdoor" | "Referral" | "Company website" | "Other";

export interface Salary {
  mode: SalaryMode;
  amount?: number;
  min?: number;
  max?: number;
  currency?: string;
}

export interface Application {
  id: string;
  user_id: string;
  company: string;
  role: string;
  status: Status;
  date_submitted: string;
  job_url?: string;
  salary?: Salary;
  work_type: WorkType;
  employment_type: EmploymentType;
  location?: string;
  priority: Priority;
  source?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
