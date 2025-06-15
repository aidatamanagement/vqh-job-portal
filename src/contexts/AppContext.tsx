
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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
  
  // Data fetching functions
  fetchJobs: () => Promise<void>;
  fetchApplications: () => Promise<void>;
  fetchMasterData: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!user && !!session;

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          // Defer profile fetching to avoid blocking auth state change
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          setApplications([]);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile with better error handling
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      
      // Use a simpler query to avoid RLS recursion issues
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, role, admin_name, created_at')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        // Don't throw - just log and continue without profile
        return;
      }
      
      console.log('User profile fetched:', data);
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Fetch jobs from database
  const fetchJobs = async () => {
    try {
      console.log('Fetching jobs...');
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        return;
      }

      console.log('Jobs fetched:', data?.length);
      // Transform data to match existing Job interface
      const transformedJobs = data.map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        position: job.position,
        location: job.location,
        facilities: job.facilities || [],
        isActive: job.is_active,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
      }));

      setJobs(transformedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  // Fetch applications from database
  const fetchApplications = async () => {
    if (!user || !session) {
      console.log('No user or session for fetching applications');
      return;
    }
    
    try {
      console.log('Fetching applications for user:', user.id);
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

      console.log('Applications fetched:', data?.length);
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
    }
  };

  // Fetch master data
  const fetchMasterData = async () => {
    try {
      console.log('Fetching master data...');
      
      // Fetch positions
      const { data: positionsData } = await supabase
        .from('job_positions')
        .select('*')
        .order('name');

      if (positionsData) {
        setPositions(positionsData.map(p => ({
          id: p.id,
          name: p.name,
          createdAt: p.created_at,
        })));
      }

      // Fetch locations
      const { data: locationsData } = await supabase
        .from('job_locations')
        .select('*')
        .order('name');

      if (locationsData) {
        setLocations(locationsData.map(l => ({
          id: l.id,
          name: l.name,
          createdAt: l.created_at,
        })));
      }

      // Fetch facilities
      const { data: facilitiesData } = await supabase
        .from('job_facilities')
        .select('*')
        .order('name');

      if (facilitiesData) {
        setFacilities(facilitiesData.map(f => ({
          id: f.id,
          name: f.name,
          createdAt: f.created_at,
        })));
      }
      
      console.log('Master data fetched successfully');
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchJobs();
    fetchMasterData();
  }, []);

  // Fetch applications when user changes and profile is loaded
  useEffect(() => {
    if (user && session && userProfile !== null) {
      fetchApplications();
    }
  }, [user, session, userProfile]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      console.log('Login successful for:', email);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Login exception:', error);
      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signup = async (email: string, password: string, displayName?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting signup for:', email);
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
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
        console.error('Signup error:', error);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      console.log('Signup successful for:', email);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Signup exception:', error);
      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    console.log('Logging out...');
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
    fetchJobs,
    fetchApplications,
    fetchMasterData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
