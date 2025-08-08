import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DefaultBranchManager, HRManager } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useDefaultBranchManagers = () => {
  const [defaultManagers, setDefaultManagers] = useState<DefaultBranchManager[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [branchManagers, setBranchManagers] = useState<HRManager[]>([]);

  // Fetch all default branch manager assignments (accessible by admins, HR, and branch managers)
  const fetchDefaultManagers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('default_branch_managers')
        .select(`
          *,
          manager:profiles!manager_id (
            id,
            email,
            admin_name,
            display_name,
            role,
            location
          )
        `)
        .order('location_name');

      if (error) {
        console.error('Error fetching default managers:', error);
        toast({
          title: "Error",
          description: "Failed to fetch default managers",
          variant: "destructive",
        });
        return;
      }

      const transformedData = data?.map(item => ({
        id: item.id,
        location_name: item.location_name,
        manager_id: item.manager_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })) || [];

      setDefaultManagers(transformedData);
      console.log('Fetched default managers:', transformedData);
    } catch (error) {
      console.error('Error fetching default managers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch default managers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all branch managers for selection
  const fetchBranchManagers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, admin_name, display_name, role, location')
        .eq('role', 'branch_manager')
        .order('admin_name');

      if (error) {
        console.error('Error fetching branch managers:', error);
        return;
      }

      const managers = data?.map(profile => ({
        id: profile.id,
        email: profile.email,
        name: profile.admin_name || profile.display_name || profile.email,
        role: profile.role as 'branch_manager',
        location: profile.location,
      })) || [];

      setBranchManagers(managers);
      console.log('Fetched branch managers:', managers);
    } catch (error) {
      console.error('Error fetching branch managers:', error);
    }
  }, []);

  // Add or update default branch manager assignment
  const saveDefaultManager = useCallback(async (locationName: string, managerId: string) => {
    try {
      const { error } = await supabase
        .from('default_branch_managers')
        .upsert({
          location_name: locationName,
          manager_id: managerId,
        }, {
          onConflict: 'location_name'
        });

      if (error) {
        console.error('Error saving default manager:', error);
        toast({
          title: "Error",
          description: "Failed to save default manager assignment",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Default manager assignment saved successfully",
      });

      // Refresh the list
      await fetchDefaultManagers();
      return true;
    } catch (error) {
      console.error('Error saving default manager:', error);
      toast({
        title: "Error",
        description: "Failed to save default manager assignment",
        variant: "destructive",
      });
      return false;
    }
  }, [fetchDefaultManagers]);

  // Delete default branch manager assignment
  const deleteDefaultManager = useCallback(async (locationName: string) => {
    try {
      const { error } = await supabase
        .from('default_branch_managers')
        .delete()
        .eq('location_name', locationName);

      if (error) {
        console.error('Error deleting default manager:', error);
        toast({
          title: "Error",
          description: "Failed to delete default manager assignment",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Default manager assignment deleted successfully",
      });

      // Refresh the list
      await fetchDefaultManagers();
      return true;
    } catch (error) {
      console.error('Error deleting default manager:', error);
      toast({
        title: "Error",
        description: "Failed to delete default manager assignment",
        variant: "destructive",
      });
      return false;
    }
  }, [fetchDefaultManagers]);

  // Get default manager for a specific location
  const getDefaultManagerForLocation = useCallback(async (locationName: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('default_branch_managers')
        .select('manager_id')
        .eq('location_name', locationName)
        .single();

      if (error || !data) {
        console.log(`No default manager found for location: ${locationName}`);
        return null;
      }

      return data.manager_id;
    } catch (error) {
      console.error('Error getting default manager for location:', error);
      return null;
    }
  }, []);

  return {
    defaultManagers,
    branchManagers,
    isLoading,
    fetchDefaultManagers,
    fetchBranchManagers,
    saveDefaultManager,
    deleteDefaultManager,
    getDefaultManagerForLocation,
  };
}; 