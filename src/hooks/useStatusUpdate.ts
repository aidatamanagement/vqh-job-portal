
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEmailNotifications } from './useEmailNotifications';

type ApplicationStatus = 'application_submitted' | 'shortlisted_for_hr' | 'hr_interviewed' | 'shortlisted_for_manager' | 'manager_interviewed' | 'hired' | 'rejected' | 'waiting_list';

export const useStatusUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { sendStatusUpdateEmail } = useEmailNotifications();

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: ApplicationStatus,
    notes: string
  ) => {
    setIsUpdating(true);
    try {
      console.log(`Updating application ${applicationId} to status: ${newStatus} with notes: ${notes}`);
      
      // Validate notes are provided
      if (!notes || notes.trim().length === 0) {
        throw new Error('Notes are mandatory for status updates');
      }
      
      // First get the current application data
      const { data: currentApplication, error: fetchError } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs (office_location, position)
        `)
        .eq('id', applicationId)
        .single();

      if (fetchError) {
        console.error('Error fetching current application:', fetchError);
        throw new Error(`Failed to fetch application: ${fetchError.message}`);
      }

      if (!currentApplication) {
        throw new Error('Application not found');
      }

      console.log('Current application data:', currentApplication);

      // Update the application status
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Ensure applied_position is set if it's missing
      if (!currentApplication.applied_position && currentApplication.jobs) {
        updateData.applied_position = currentApplication.jobs.position || 'Unknown Position';
      }

      // Update the application status using the custom function with notes
      console.log('Calling database function with:', {
        application_id: applicationId,
        new_status: newStatus,
        notes_text: notes.trim()
      });
      
      // First, manually insert into status_history
      console.log('About to insert into status_history with:', {
        application_id: applicationId,
        previous_status: currentApplication.status,
        new_status: newStatus,
        notes: notes.trim(),
        notes_length: notes.trim().length,
        changed_by: (await supabase.auth.getUser()).data.user?.id || null
      });

      const { data: historyData, error: historyError } = await supabase
        .from('status_history')
        .insert({
          application_id: applicationId,
          previous_status: currentApplication.status,
          new_status: newStatus,
          notes: notes.trim(),
          changed_by: (await supabase.auth.getUser()).data.user?.id || null,
          transition_valid: true
        })
        .select();

      console.log('Status history insert result:', { historyData, historyError });

      if (historyError) {
        console.error('Error inserting status history:', historyError);
        throw new Error(`Failed to log status change: ${historyError.message}`);
      }

      // Then update the application status
      const { data: updatedApplicationData, error } = await supabase
        .from('job_applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select(`
          *,
          jobs (office_location, position)
        `)
        .single();

      if (error) {
        console.error('Error updating application status:', error);
        throw new Error(`Failed to update status: ${error.message}`);
      }

      if (!updatedApplicationData) {
        throw new Error('Failed to retrieve updated application data');
      }

      console.log('Application status updated successfully:', updatedApplicationData);

      // Parse the returned JSON data
      const updatedApplication = updatedApplicationData as any;

      // If status changed to 'hired', deactivate the job posting
      if (newStatus === 'hired' && currentApplication.status !== 'hired') {
        console.log('Application marked as hired, deactivating job posting...');
        try {
          const { error: jobUpdateError } = await supabase
            .from('jobs')
            .update({ 
              is_active: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', updatedApplication.job_id);

          if (jobUpdateError) {
            console.error('Error deactivating job:', jobUpdateError);
            // Don't throw error - application status update succeeded
          } else {
            console.log('Job posting deactivated successfully');
            // Set a flag to indicate job was deactivated for success message
            (updatedApplication as any).jobDeactivated = true;
          }
        } catch (jobError) {
          console.error('Failed to deactivate job:', jobError);
          // Don't throw error - application status update succeeded
        }
      }

      // Send email notification for the status change
      if (updatedApplication && currentApplication.status !== newStatus) {
        console.log('Sending status update email notification...');
        try {
          const emailResult = await sendStatusUpdateEmail(
            {
              id: updatedApplication.id,
              email: updatedApplication.email,
              firstName: updatedApplication.first_name,
              lastName: updatedApplication.last_name,
              appliedPosition: updatedApplication.applied_position,
              status: updatedApplication.status as ApplicationStatus,
              jobId: updatedApplication.job_id,
              phone: updatedApplication.phone || '',
              cityState: updatedApplication.city_state || '',
              coverLetter: updatedApplication.cover_letter || '',
              earliestStartDate: updatedApplication.earliest_start_date || '',
              additionalDocsUrls: updatedApplication.additional_docs_urls || [],
              trackingToken: updatedApplication.tracking_token,
              createdAt: updatedApplication.created_at,
              updatedAt: updatedApplication.updated_at,
            },
            updatedApplication.jobs ? { 
              location: updatedApplication.jobs.office_location 
            } : undefined
          );
          
          console.log('Email notification result:', emailResult);
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Don't throw the error - status update succeeded, email failed
        }
      }

      return { success: true, application: updatedApplication };
    } catch (error) {
      console.error('Status update failed:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateApplicationStatus,
    isUpdating,
  };
};
