
export interface Job {
  id: string;
  title?: string;
  description: string;
  position: string;
  officeLocation: string;
  workLocation: string;
  facilities: string[];
  isActive: boolean;
  isUrgent?: boolean;
  applicationDeadline?: string;
  hrManagerId?: string;
  hrManagerName?: string;
  hrManagerEmail?: string;
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
  jobLocation?: string;
  earliestStartDate: string;
  cityState: string;
  coverLetter: string;
  coverLetterUrl?: string;
  resumeUrl?: string;
  additionalDocsUrls: string[];
  hrManagerName?: string;
  hrManagerEmail?: string;
  status: 'application_submitted' | 'shortlisted_for_hr' | 'hr_interviewed' | 'shortlisted_for_manager' | 'manager_interviewed' | 'hired' | 'rejected' | 'waiting_list';
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
  location?: string;
  createdAt: string;
}

export interface HRManager {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  location?: string;
  profile_image_url?: string;
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

// CRM and Training types
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

// Calendly and Interview types
export interface Interview {
  id: string;
  application_id: string;
  calendly_event_id: string;
  calendly_event_uri: string;
  candidate_email: string;
  interviewer_email?: string;
  scheduled_time: string;
  meeting_url?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  created_at: string;
  updated_at: string;
}

export interface CalendlySettings {
  id: string;
  api_token: string;
  organization_uri: string;
  default_event_type_uri?: string;
  webhook_url?: string;
  created_at: string;
  updated_at: string;
}
