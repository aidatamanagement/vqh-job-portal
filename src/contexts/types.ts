
import { User, Session } from '@supabase/supabase-js';
import { 
  Job, 
  JobApplication, 
  JobPosition, 
  JobLocation, 
  JobFacility,
  HRManager,
  Salesperson,
  VisitLog,
  TrainingVideo
} from '@/types';

export interface AppContextType {
  // Auth state
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  userProfile: any | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserDisplayName: (displayName: string) => Promise<void>;
  
  // Jobs state
  jobs: Job[];
  setJobs: (jobs: Job[]) => void;
  
  // Applications state
  applications: JobApplication[];
  setApplications: (applications: JobApplication[] | ((prev: JobApplication[]) => JobApplication[])) => void;
  
  // Master data
  positions: JobPosition[];
  setPositions: (positions: JobPosition[]) => void;
  locations: JobLocation[];
  setLocations: (locations: JobLocation[]) => void;
  facilities: JobFacility[];
  setFacilities: (facilities: JobFacility[]) => void;

  // CRM and Training data
  salespeople: Salesperson[];
  setSalespeople: (salespeople: Salesperson[]) => void;
  visitLogs: VisitLog[];
  setVisitLogs: (visitLogs: VisitLog[]) => void;
  trainingVideos: TrainingVideo[];
  setTrainingVideos: (trainingVideos: TrainingVideo[]) => void;
  
  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isDataLoading: boolean;
  
  // Data fetching functions
  fetchJobs: () => Promise<void>;
  fetchApplications: () => Promise<void>;
  fetchMasterData: () => Promise<void>;
  fetchHRManagers: (selectedLocation?: string) => Promise<HRManager[]>;
  fetchSalespeople: () => Promise<void>;
  fetchVisitLogs: () => Promise<void>;
  fetchTrainingVideos: () => Promise<void>;
  
  // Admin operations
  createJob: (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateJob: (jobId: string, jobData: Partial<Job>) => Promise<boolean>;
  deleteJob: (jobId: string) => Promise<boolean>;
  createPosition: (name: string) => Promise<boolean>;
  deletePosition: (id: string) => Promise<boolean>;
  createLocation: (name: string) => Promise<boolean>;
  deleteLocation: (id: string) => Promise<boolean>;
  createFacility: (name: string) => Promise<boolean>;
  deleteFacility: (id: string) => Promise<boolean>;

  // CRM operations
  createSalesperson: (data: Omit<Salesperson, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateSalesperson: (id: string, data: Partial<Salesperson>) => Promise<boolean>;
  deleteSalesperson: (id: string) => Promise<boolean>;
  createVisitLog: (data: Omit<VisitLog, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateVisitLog: (id: string, data: Partial<VisitLog>) => Promise<boolean>;
  deleteVisitLog: (id: string) => Promise<boolean>;
  createTrainingVideo: (data: Omit<TrainingVideo, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateTrainingVideo: (id: string, data: Partial<TrainingVideo>) => Promise<boolean>;
  deleteTrainingVideo: (id: string) => Promise<boolean>;
}
