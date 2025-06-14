
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Job, JobApplication, JobPosition, JobLocation, JobFacility, User, FilterState } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

interface AppContextType {
  // Auth state
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
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
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [locations, setLocations] = useState<JobLocation[]>([]);
  const [facilities, setFacilities] = useState<JobFacility[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!session && !!user;

  // Initialize auth state and set up listener
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          await updateAuthState(initialSession);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (mounted) {
          await updateAuthState(session);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const updateAuthState = async (session: Session | null) => {
    try {
      setSession(session);
      
      if (session?.user) {
        // Fetch user profile from database
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile && !error) {
          setUser({
            id: profile.id,
            email: profile.email,
            role: profile.role,
            displayName: profile.display_name,
            createdAt: profile.created_at,
          });
        } else {
          console.error('Error fetching profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error updating auth state:', error);
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load master data on mount
  useEffect(() => {
    loadMasterData();
  }, []);

  // Load jobs and applications when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadJobs();
      loadApplications();
    }
  }, [isAuthenticated]);

  const loadMasterData = async () => {
    try {
      // Load positions
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

      // Load locations
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

      // Load facilities
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
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (jobsData) {
        setJobs(jobsData.map(j => ({
          id: j.id,
          title: j.title,
          description: j.description,
          position: j.position,
          location: j.location,
          facilities: j.facilities || [],
          isActive: j.is_active,
          isUrgent: j.is_urgent,
          applicationDeadline: j.application_deadline,
          createdAt: j.created_at,
          updatedAt: j.updated_at,
        })));
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadApplications = async () => {
    try {
      const { data: applicationsData } = await supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (applicationsData) {
        setApplications(applicationsData.map(a => ({
          id: a.id,
          jobId: a.job_id,
          firstName: a.first_name,
          lastName: a.last_name,
          email: a.email,
          phone: a.phone,
          appliedPosition: a.applied_position,
          earliestStartDate: a.earliest_start_date,
          cityState: a.city_state,
          coverLetter: a.cover_letter,
          resumeUrl: a.resume_url,
          additionalDocsUrls: a.additional_docs_urls || [],
          status: a.status,
          notes: a.notes,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
        })));
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Logout Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Clear all state
        setUser(null);
        setSession(null);
        setJobs([]);
        setApplications([]);
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out",
        });
      }
    } catch (error) {
      console.error('Unexpected logout error:', error);
    }
  };

  const updateUserDisplayName = async (displayName: string) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ display_name: displayName })
          .eq('id', user.id);

        if (!error) {
          setUser({ ...user, displayName });
          toast({
            title: "Profile Updated",
            description: "Display name updated successfully",
          });
        } else {
          console.error('Error updating display name:', error);
          toast({
            title: "Update Failed",
            description: "Failed to update display name",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error updating display name:', error);
        toast({
          title: "Update Failed",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  const value = {
    user,
    session,
    isAuthenticated,
    isLoading,
    login,
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
    setIsLoading,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
