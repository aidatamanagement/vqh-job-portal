
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types';

export const useAdminOperations = (
  fetchJobs: () => Promise<void>,
  fetchMasterData: () => Promise<void>
) => {
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
