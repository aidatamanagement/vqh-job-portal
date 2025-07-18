
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Job, HRManager } from '@/types';

export const useAdminOperations = (
  fetchJobs: () => Promise<void>,
  fetchMasterData: () => Promise<void>
) => {
  // Fetch Managers for job assignment
  const fetchHRManagers = useCallback(async (selectedLocation?: string): Promise<HRManager[]> => {
    try {
      let data;
      let error;
      
      if (selectedLocation) {
        // If location is provided, fetch all admins and HR managers from that location
        const { data: adminsData, error: adminsError } = await supabase
          .from('profiles')
          .select('id, email, admin_name, display_name, role, location, profile_image_url')
          .eq('role', 'admin')
          .order('admin_name');
          
        const { data: hrData, error: hrError } = await supabase
          .from('profiles')
          .select('id, email, admin_name, display_name, role, location, profile_image_url')
          .eq('role', 'hr')
          .eq('location', selectedLocation)
          .order('admin_name');
          
        if (adminsError || hrError) {
          console.error('Error fetching managers:', adminsError || hrError);
          return [];
        }
        
        data = [...(adminsData || []), ...(hrData || [])];
      } else {
        // If no location provided, show all admins and HR managers
        const result = await supabase
          .from('profiles')
          .select('id, email, admin_name, display_name, role, location, profile_image_url')
          .in('role', ['admin', 'hr'])
          .order('admin_name');
          
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error fetching Managers:', error);
        return [];
      }

      const managers = (data || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        name: profile.admin_name || profile.display_name || profile.email,
        role: profile.role as 'admin' | 'hr',
        location: profile.location,
        profile_image_url: profile.profile_image_url
      }));
      
      console.log('Fetched managers:', managers);
      console.log('Selected location:', selectedLocation);
      
      return managers;
    } catch (error) {
      console.error('Error fetching Managers:', error);
      return [];
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
          location: jobData.location,
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
      if (jobData.location !== undefined) updateData.location = jobData.location;
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
