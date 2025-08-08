
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Job, HRManager } from '@/types';

export const useAdminOperations = (
  fetchJobs: () => Promise<void>,
  fetchMasterData: () => Promise<void>
) => {
  // Fetch Branch Managers for job assignment based on location
  const fetchHRManagers = useCallback(async (selectedLocation?: string): Promise<HRManager[]> => {
    try {
      let data;
      let error;
      
      if (selectedLocation) {
        // If location is provided, fetch only branch managers from that specific location
        const result = await supabase
          .from('profiles')
          .select('id, email, admin_name, display_name, role, location, profile_image_url')
          .eq('role', 'branch_manager')
          .eq('location', selectedLocation)
          .order('admin_name');
          
        data = result.data;
        error = result.error;
      } else {
        // If no location provided, show all branch managers
        const result = await supabase
          .from('profiles')
          .select('id, email, admin_name, display_name, role, location, profile_image_url')
          .eq('role', 'branch_manager')
          .order('admin_name');
          
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error fetching branch managers:', error);
        return [];
      }

      const managers = (data || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        name: profile.admin_name || profile.display_name || profile.email,
        role: profile.role as 'branch_manager',
        location: profile.location,
        profile_image_url: profile.profile_image_url
      }));
      
      console.log('Fetched branch managers:', managers);
      console.log('Selected location:', selectedLocation);
      
      return managers;
    } catch (error) {
      console.error('Error fetching branch managers:', error);
      return [];
    }
  }, []);

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

  // Admin database operations
  const createJob = useCallback(async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
          title: jobData.title,
          description: jobData.description,
          position: jobData.position,
          office_location: jobData.officeLocation,
          work_location: jobData.workLocation,
          facilities: jobData.facilities,
          is_active: jobData.isActive,
          is_urgent: jobData.isUrgent || false,
          application_deadline: jobData.applicationDeadline,
          hr_manager_id: jobData.hrManagerId,
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
  }, [fetchJobs]);

  const updateJob = useCallback(async (jobId: string, jobData: Partial<Job>): Promise<boolean> => {
    try {
      const updateData: any = {};
      if (jobData.title !== undefined) updateData.title = jobData.title;
      if (jobData.description !== undefined) updateData.description = jobData.description;
      if (jobData.position !== undefined) updateData.position = jobData.position;
      if (jobData.officeLocation !== undefined) updateData.office_location = jobData.officeLocation;
      if (jobData.workLocation !== undefined) updateData.work_location = jobData.workLocation;
      if (jobData.facilities !== undefined) updateData.facilities = jobData.facilities;
      if (jobData.isActive !== undefined) updateData.is_active = jobData.isActive;
      if (jobData.isUrgent !== undefined) updateData.is_urgent = jobData.isUrgent;
      if (jobData.applicationDeadline !== undefined) updateData.application_deadline = jobData.applicationDeadline;
      if (jobData.hrManagerId !== undefined) updateData.hr_manager_id = jobData.hrManagerId;

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
  }, [fetchJobs]);

  const deleteJob = useCallback(async (jobId: string): Promise<boolean> => {
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
  }, [fetchJobs]);

  const createPosition = useCallback(async (name: string): Promise<boolean> => {
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
  }, [fetchMasterData]);

  const deletePosition = useCallback(async (id: string): Promise<boolean> => {
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
  }, [fetchMasterData]);

  const createLocation = useCallback(async (name: string): Promise<boolean> => {
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
  }, [fetchMasterData]);

  const deleteLocation = useCallback(async (id: string): Promise<boolean> => {
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
  }, [fetchMasterData]);

  const createFacility = useCallback(async (name: string): Promise<boolean> => {
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
  }, [fetchMasterData]);

  const deleteFacility = useCallback(async (id: string): Promise<boolean> => {
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
  }, [fetchMasterData]);

  return {
    fetchHRManagers,
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
};
