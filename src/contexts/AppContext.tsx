import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Job, JobApplication, JobPosition, JobLocation, JobFacility, FilterState } from '@/types';

interface AppContextType {
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
  
  // Granular loading states
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  jobsLoading: boolean;
  masterDataLoading: boolean;
  applicationsLoading: boolean;
  
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [locations, setLocations] = useState<JobLocation[]>([]);
  const [facilities, setFacilities] = useState<JobFacility[]>([]);
  
  // Granular loading states
  const [isLoading, setIsLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [masterDataLoading, setMasterDataLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  const isAuthenticated = !!user;

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile when user logs in
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Fetch jobs from database
  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        return;
      }

      // Transform data to match existing Job interface
      const transformedJobs = data.map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        position: job.position,
        location: job.location,
        facilities: job.facilities || [],
        isActive: job.is_active,
        isUrgent: job.is_urgent || false,
        applicationDeadline: job.application_deadline,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
      }));

      console.log('Fetched jobs:', transformedJobs);
      setJobs(transformedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  // Fetch applications from database
  const fetchApplications = async () => {
    if (!user) return;
    
    setApplicationsLoading(true);
    try {
      let query = supabase.from('job_applications').select('*');
      
      // If user is admin, fetch all applications, otherwise only their own
      if (userProfile?.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        return;
      }

      // Transform data to match existing JobApplication interface
      const transformedApplications = data.map(app => ({
        id: app.id,
        jobId: app.job_id,
        firstName: app.first_name,
        lastName: app.last_name,
        email: app.email,
        phone: app.phone,
        appliedPosition: app.applied_position,
        earliestStartDate: app.earliest_start_date,
        cityState: app.city_state,
        coverLetter: app.cover_letter,
        status: app.status as 'waiting' | 'approved' | 'rejected',
        additionalDocsUrls: app.additional_docs_urls || [],
        createdAt: app.created_at,
        updatedAt: app.updated_at,
      }));

      setApplications(transformedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Fetch master data - Modified to work for all users including anonymous
  const fetchMasterData = async () => {
    setMasterDataLoading(true);
    try {
      console.log('Fetching master data...');
      
      // Try to fetch positions with authentication if available, otherwise try without
      let positionsQuery = supabase.from('job_positions').select('*').order('name');
      
      // For non-authenticated users, we might get RLS errors, so we'll handle them gracefully
      const { data: positionsData, error: positionsError } = await positionsQuery;

      if (positionsData && !positionsError) {
        setPositions(positionsData.map(p => ({
          id: p.id,
          name: p.name,
          createdAt: p.created_at,
        })));
        console.log('Fetched positions:', positionsData);
      } else {
        console.log('Could not fetch positions from database, will extract from jobs');
        setPositions([]);
      }

      // Try to fetch locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('job_locations')
        .select('*')
        .order('name');

      if (locationsData && !locationsError) {
        setLocations(locationsData.map(l => ({
          id: l.id,
          name: l.name,
          createdAt: l.created_at,
        })));
        console.log('Fetched locations:', locationsData);
      } else {
        console.log('Could not fetch locations from database, will extract from jobs');
        setLocations([]);
      }

      // Try to fetch facilities
      const { data: facilitiesData, error: facilitiesError } = await supabase
        .from('job_facilities')
        .select('*')
        .order('name');

      if (facilitiesData && !facilitiesError) {
        setFacilities(facilitiesData.map(f => ({
          id: f.id,
          name: f.name,
          createdAt: f.created_at,
        })));
        console.log('Fetched facilities:', facilitiesData);
      } else {
        console.log('Could not fetch facilities from database');
        setFacilities([]);
      }
    } catch (error) {
      console.error('Error fetching master data:', error);
      // Set empty arrays so the fallback logic in JobFilters can work
      setPositions([]);
      setLocations([]);
      setFacilities([]);
    } finally {
      setMasterDataLoading(false);
    }
  };

  // Initialize data on mount - fetch jobs and master data for all users
  useEffect(() => {
    fetchJobs();
    fetchMasterData();
  }, []);

  // Fetch applications when user changes
  useEffect(() => {
    if (user && userProfile) {
      fetchApplications();
    }
  }, [user, userProfile]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return false;
      }

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (email: string, password: string, displayName?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName || email,
          }
        }
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserProfile(null);
    setApplications([]);
    setIsLoading(false);
  };

  const updateUserDisplayName = async (displayName: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);

      if (!error) {
        setUserProfile(prev => prev ? { ...prev, display_name: displayName } : null);
      }
    } catch (error) {
      console.error('Error updating display name:', error);
    }
  };

  // Admin database operations
  const createJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
          title: jobData.title,
          description: jobData.description,
          position: jobData.position,
          location: jobData.location,
          facilities: jobData.facilities,
          is_active: jobData.isActive,
          is_urgent: jobData.isUrgent || false,
          application_deadline: jobData.applicationDeadline,
        });

      if (error) {
        console.error('Error creating job:', error);
        return false;
      }

      await fetchJobs(); // Refresh jobs list
      return true;
    } catch (error) {
      console.error('Error creating job:', error);
      return false;
    }
  };

  const updateJob = async (jobId: string, jobData: Partial<Job>): Promise<boolean> => {
    try {
      const updateData: any = {};
      if (jobData.title !== undefined) updateData.title = jobData.title;
      if (jobData.description !== undefined) updateData.description = jobData.description;
      if (jobData.position !== undefined) updateData.position = jobData.position;
      if (jobData.location !== undefined) updateData.location = jobData.location;
      if (jobData.facilities !== undefined) updateData.facilities = jobData.facilities;
      if (jobData.isActive !== undefined) updateData.is_active = jobData.isActive;
      if (jobData.isUrgent !== undefined) updateData.is_urgent = jobData.isUrgent;
      if (jobData.applicationDeadline !== undefined) updateData.application_deadline = jobData.applicationDeadline;

      const { error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', jobId);

      if (error) {
        console.error('Error updating job:', error);
        return false;
      }

      await fetchJobs(); // Refresh jobs list
      return true;
    } catch (error) {
      console.error('Error updating job:', error);
      return false;
    }
  };

  const deleteJob = async (jobId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('Error deleting job:', error);
        return false;
      }

      await fetchJobs(); // Refresh jobs list
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      return false;
    }
  };

  const createPosition = async (name: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('job_positions')
        .insert({ name });

      if (error) {
        console.error('Error creating position:', error);
        return false;
      }

      await fetchMasterData(); // Refresh master data
      return true;
    } catch (error) {
      console.error('Error creating position:', error);
      return false;
    }
  };

  const deletePosition = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('job_positions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting position:', error);
        return false;
      }

      await fetchMasterData(); // Refresh master data
      return true;
    } catch (error) {
      console.error('Error deleting position:', error);
      return false;
    }
  };

  const createLocation = async (name: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('job_locations')
        .insert({ name });

      if (error) {
        console.error('Error creating location:', error);
        return false;
      }

      await fetchMasterData(); // Refresh master data
      return true;
    } catch (error) {
      console.error('Error creating location:', error);
      return false;
    }
  };

  const deleteLocation = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('job_locations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting location:', error);
        return false;
      }

      await fetchMasterData(); // Refresh master data
      return true;
    } catch (error) {
      console.error('Error deleting location:', error);
      return false;
    }
  };

  const createFacility = async (name: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('job_facilities')
        .insert({ name });

      if (error) {
        console.error('Error creating facility:', error);
        return false;
      }

      await fetchMasterData(); // Refresh master data
      return true;
    } catch (error) {
      console.error('Error creating facility:', error);
      return false;
    }
  };

  const deleteFacility = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('job_facilities')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting facility:', error);
        return false;
      }

      await fetchMasterData(); // Refresh master data
      return true;
    } catch (error) {
      console.error('Error deleting facility:', error);
      return false;
    }
  };

  const value = {
    user,
    session,
    isAuthenticated,
    userProfile,
    login,
    signup,
    logout,
    updateUserDisplayName,
    jobs,
    setJobs,
    applications,
    setApplications,
    positions,
    setPositions,
    locations,
    setLocations,
    facilities,
    setFacilities,
    isLoading,
    setIsLoading,
    jobsLoading,
    masterDataLoading,
    applicationsLoading,
    fetchJobs,
    fetchApplications,
    fetchMasterData,
    createJob,
    updateJob,
    deleteJob,
    createPosition,
    deletePosition,
    createLocation,
    deleteLocation,
    createFacility,
    deleteFacility,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
