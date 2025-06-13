
import { supabase } from '@/integrations/supabase/client';
import { JobApplication } from '@/types';

export const applicationService = {
  async submitApplication(applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        job_id: applicationData.jobId,
        first_name: applicationData.firstName,
        last_name: applicationData.lastName,
        email: applicationData.email,
        phone: applicationData.phone,
        applied_position: applicationData.appliedPosition,
        earliest_start_date: applicationData.earliestStartDate,
        city_state: applicationData.cityState,
        cover_letter: applicationData.coverLetter,
        resume_url: applicationData.resumeUrl,
        additional_docs_urls: applicationData.additionalDocsUrls,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateApplicationStatus(id: string, status: 'waiting' | 'approved' | 'declined', notes?: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .update({ 
        status, 
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteApplication(id: string) {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
