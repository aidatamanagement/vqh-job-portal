
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
  status: 'application_submitted' | 'under_review' | 'shortlisted' | 'interview_scheduled' | 'decisioning' | 'hired' | 'rejected';
  notes?: string;
  trackingToken: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'recruiter' | 'hr' | 'trainer' | 'content_manager';

export interface User {
  id: string;
  email: string;
  role: UserRole;
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

// New CRM and Training types
export interface Salesperson {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  role: 'manager' | 'sales_rep';
  status: 'active' | 'inactive';
  visits_this_month: number;
  created_at: string;
  updated_at: string;
}

export interface VisitLog {
  id: string;
  salesperson_id?: string;
  salesperson_name: string;
  location_name: string;
  visit_date: string;
  visit_time: string;
  notes?: string;
  status: 'initial' | 'follow_up' | 'closed';
  strength: 'strong' | 'medium' | 'weak';
  created_at: string;
  updated_at: string;
}

export interface TrainingVideo {
  id: string;
  title: string;
  description?: string;
  category: string;
  role: string;
  tag: 'mandatory' | 'optional';
  type: 'youtube' | 'vimeo' | 'direct';
  url: string;
  duration?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}
