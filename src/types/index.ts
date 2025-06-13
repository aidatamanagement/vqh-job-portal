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
  status: 'waiting' | 'approved' | 'declined';
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
