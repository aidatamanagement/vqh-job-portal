
export interface Job {
  id: string;
  title: string;
  description: string;
  position: string;
  location: string;
  facilities: string[];
  isActive: boolean;
  isUrgent?: boolean;
  applicationDeadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobPosition {
  id: string;
  name: string;
  createdAt: string;
}

export interface JobLocation {
  id: string;
  name: string;
  createdAt: string;
}

export interface JobFacility {
  id: string;
  name: string;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  appliedPosition: string;
  earliestStartDate: string;
  cityState: string;
  coverLetter: string;
  resumeUrl?: string;
  additionalDocsUrls: string[];
  status: 'waiting' | 'approved' | 'rejected'; // Changed from 'declined' to 'rejected' to match database
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin';
  displayName?: string;
  createdAt: string;
}

export interface FilterState {
  search: string;
  positions: string[];
  location: string;
  sortBy: 'newest' | 'oldest';
}

export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  subject: string;
  html_body: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  template_slug: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  brevo_message_id?: string;
  error_message?: string;
  variables_used: Record<string, any>;
  sent_at?: string;
  created_at: string;
}
