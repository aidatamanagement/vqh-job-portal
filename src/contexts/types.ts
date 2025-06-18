
import { User, Session } from '@supabase/supabase-js';
import { Job, JobApplication, JobPosition, JobLocation, JobFacility } from '@/types';

export interface AppContextType {
  // Auth state
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  userProfile: any | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserDisplayName: (displayName: string) => void;
  
  // Jobs state
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  
  // Applications state
  applications: JobApplication[];
  setApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>;
  
  // Master data
  positions: JobPosition[];
  setPositions: React.Dispatch<React.SetStateAction<JobPosition[]>>;
  locations: JobLocation[];
  setLocations: React.Dispatch<React.SetStateAction<JobLocation[]>>;
  facilities: JobFacility[];
  setFacilities: React.Dispatch<React.SetStateAction<JobFacility[]>>;
  
  // UI state
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isDataLoading: boolean;
  
  // Data fetching functions
  fetchJobs: () => Promise<void>;
  fetchApplications: () => Promise<void>;
  fetchMasterData: () => Promise<void>;
  
  // Database operations for admin
  createJob: (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateJob: (jobId: string, jobData: Partial<Job>) => Promise<boolean>;
  deleteJob: (jobId: string) => Promise<boolean>;
  createPosition: (name: string) => Promise<boolean>;
  deletePosition: (id: string) => Promise<boolean>;
  createLocation: (name: string) => Promise<boolean>;
  deleteLocation: (id: string) => Promise<boolean>;
  createFacility: (name: string) => Promise<boolean>;
  deleteFacility: (id: string) => Promise<boolean>;
}
