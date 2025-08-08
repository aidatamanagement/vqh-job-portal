import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StatusHistoryEntry {
  id: string;
  application_id: string;
  previous_status: string;
  new_status: string;
  notes: string;
  changed_by: string | null;
  changed_at: string;
  transition_valid: boolean;
  changed_by_name?: string | null;
  changed_by_email?: string | null;
}

export const useStatusHistoryQuery = (applicationId: string) => {
  const {
    data: history = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['status-history', applicationId],
    queryFn: async (): Promise<StatusHistoryEntry[]> => {
      console.log('🔄 Fetching status history for application:', applicationId);
      
      // First try to get status history with explicit join to profiles table
      const { data, error } = await supabase
        .from('status_history')
        .select(`
          *,
          profiles:changed_by (
            id,
            admin_name,
            display_name,
            first_name,
            last_name,
            email
          )
        `)
        .eq('application_id', applicationId)
        .order('changed_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching status history with profiles join:', error);
        
        // Fallback: get status history and then fetch profiles separately
        const { data: historyData, error: historyError } = await supabase
          .from('status_history')
          .select('*')
          .eq('application_id', applicationId)
          .order('changed_at', { ascending: false });

        if (historyError) {
          console.error('❌ Error fetching status history:', historyError);
          throw new Error(`Failed to fetch status history: ${historyError.message}`);
        }

        // Fetch profiles for all unique changed_by IDs
        const userIds = [...new Set(historyData?.filter(entry => entry.changed_by).map(entry => entry.changed_by) || [])];
        
        let profilesData: any[] = [];
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, admin_name, display_name, first_name, last_name, email')
            .in('id', userIds);

          if (profilesError) {
            console.error('❌ Error fetching profiles:', profilesError);
          } else {
            profilesData = profiles || [];
          }
        }

        // Transform the data with manually fetched profiles
        const transformedData = (historyData || []).map((entry: any) => {
          const profile = profilesData.find(p => p.id === entry.changed_by);
          let changedByName = null;
          
          if (profile) {
            changedByName = profile.admin_name || 
                           profile.display_name || 
                           (profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : null) ||
                           profile.email;
          }

          return {
            ...entry,
            changed_by_name: changedByName,
            changed_by_email: profile?.email || null,
            profiles: profile
          };
        });

        console.log('✅ Status history loaded (fallback method):', transformedData.length, 'entries');
        return transformedData;
      }

      // Transform the data to include user names (normal path with successful join)
      const transformedData = (data || []).map((entry: any) => {
        const profile = entry.profiles;
        let changedByName = null;
        
        if (profile) {
          // Use admin_name first, then display_name, then first_name + last_name, then email
          changedByName = profile.admin_name || 
                         profile.display_name || 
                         (profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : null) ||
                         profile.email;
        }

        return {
          ...entry,
          changed_by_name: changedByName,
          changed_by_email: profile?.email || null
        };
      });

      console.log('✅ Status history loaded:', transformedData.length, 'entries');
      return transformedData;
    },
    // Enable automatic background updates
    refetchInterval: 15000, // Refetch every 15 seconds (more frequent for status history)
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 5000, // Consider data stale after 5 seconds
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
    enabled: !!applicationId, // Only run query if applicationId is provided
  });

  return {
    history,
    isLoading,
    error,
    refetch,
  };
}; 