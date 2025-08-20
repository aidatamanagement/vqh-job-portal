
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
    notes: string,
    skipImmediateEmail: boolean = false
  ) => {
    setIsUpdating(true);
    try {
      console.log(`Updating application ${applicationId} to status: ${newStatus} with notes: ${notes}, skipImmediateEmail: ${skipImmediateEmail}`);
      
      // Validate notes are provided
      if (!notes || notes.trim().length === 0) {
        throw new Error('Notes are mandatory for status updates');
      }

      // Use the proper database function to update status with notes
      console.log('Calling database function update_application_status_with_notes with:', {
        application_id: applicationId,
        new_status: newStatus,
        notes_text: notes.trim()
      });

      const { data: result, error } = await supabase.rpc('update_application_status_with_notes', {
        application_id: applicationId,
        new_status: newStatus,
        notes_text: notes.trim()
      });

      if (error) {
        console.error('Error calling status update function:', error);
        throw new Error(`Failed to update status: ${error.message}`);
      }

      if (!result) {
        throw new Error('No data returned from status update function');
      }

      console.log('Status update function result:', result);

      // Parse the application data from the function result
      const updatedApplication = result as any;
      const currentStatus = updatedApplication.status;

      // If status changed to 'hired', deactivate the job posting
      if (newStatus === 'hired' && currentStatus !== 'hired') {
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

      // Send email notification for the status change (unless skipped for delayed scheduling)
      if (!skipImmediateEmail) {
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
              cityState: '',
              coverLetter: '',
              earliestStartDate: '',
              additionalDocsUrls: [],
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
      } else {
        console.log('Skipping immediate email notification (delayed scheduling enabled)');
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
