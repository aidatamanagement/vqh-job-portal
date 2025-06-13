
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types';

export const jobService = {
  async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        title: jobData.title,
        description: jobData.description,
        position: jobData.position,
        location: jobData.location,
        facilities: jobData.facilities,
        is_active: jobData.isActive,
        is_urgent: jobData.isUrgent,
        application_deadline: jobData.applicationDeadline,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateJob(id: string, jobData: Partial<Job>) {
    const updateData: any = {};
    
    if (jobData.title !== undefined) updateData.title = jobData.title;
    if (jobData.description !== undefined) updateData.description = jobData.description;
    if (jobData.position !== undefined) updateData.position = jobData.position;
    if (jobData.location !== undefined) updateData.location = jobData.location;
    if (jobData.facilities !== undefined) updateData.facilities = jobData.facilities;
    if (jobData.isActive !== undefined) updateData.is_active = jobData.isActive;
    if (jobData.isUrgent !== undefined) updateData.is_urgent = jobData.isUrgent;
    if (jobData.applicationDeadline !== undefined) updateData.application_deadline = jobData.applicationDeadline;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteJob(id: string) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getActiveJobs() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getJobById(id: string) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
};
