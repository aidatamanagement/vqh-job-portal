
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true to prevent flickering
  const isMounted = useRef(true);

  const isAuthenticated = !!user;

  // Fetch user profile with better error handling
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        // If profile doesn't exist, try to create a basic one for the admin
        if (error.code === 'PGRST116') {
          console.log('Profile not found, attempting to create one...');
          
          // Try to create a profile for the user
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              role: 'admin', // Default to admin for now
              email: user?.email || '',
              display_name: user?.email || 'Admin User'
            })
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating profile:', createError);
            setUserProfile(null);
          } else {
            console.log('Profile created successfully:', newProfile);
            setUserProfile(newProfile);
          }
        } else {
          setUserProfile(null);
        }
        return;
      }
      
      console.log('User profile fetched successfully:', data);
      if (isMounted.current) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (isMounted.current) {
        setUserProfile(null);
      }
    }
  }, [user?.email]);

  // Initialize auth state
  useEffect(() => {
    let isInitialized = false;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (isMounted.current) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user && event !== 'TOKEN_REFRESHED') {
            // Only fetch profile on login/signup, not on token refresh
            setIsLoading(true);
            await fetchUserProfile(session.user.id);
            setIsLoading(false);
          } else if (!session?.user) {
            setUserProfile(null);
            setIsLoading(false);
          }
          
          // Mark as initialized after first auth state change
          if (!isInitialized) {
            isInitialized = true;
            if (!session?.user) {
              setIsLoading(false);
            }
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (isMounted.current && !isInitialized) {
        console.log('Checking existing session:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setIsLoading(true);
          await fetchUserProfile(session.user.id);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
        isInitialized = true;
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  // Cleanup function to prevent state updates after unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return false;
      }

      console.log('Login successful for:', data.user?.email);
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
    setIsLoading(false);
  };

  const updateUserDisplayName = async (displayName: string): Promise<void> => {
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

  return {
    user,
    session,
    isAuthenticated,
    userProfile,
    isLoading,
    login,
    signup,
    logout,
    updateUserDisplayName,
  };
};
