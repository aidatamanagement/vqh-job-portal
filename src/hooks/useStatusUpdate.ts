
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEmailNotifications } from './useEmailNotifications';
import { JobApplication } from '@/types';

export const useStatusUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { sendStatusUpdateEmail } = useEmailNotifications();

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string,
    notes?: string
  ) => {
    setIsUpdating(true);
    try {
      console.log(`Updating application ${applicationId} to status: ${newStatus}`);
      
      // Update the application status
      const { data: updatedApplication, error } = await supabase
        .from('job_applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select(`
          *,
          jobs (location)
        `)
        .single();

      if (error) {
        console.error('Error updating application status:', error);
        throw error;
      }

      console.log('Application status updated successfully:', updatedApplication);

      // Send status update email
      try {
        const emailResult = await sendStatusUpdateEmail(
          {
            ...updatedApplication,
            appliedPosition: updatedApplication.applied_position || '',
            firstName: updatedApplication.first_name,
            lastName: updatedApplication.last_name,
            trackingToken: updatedApplication.tracking_token,
          },
          { location: updatedApplication.jobs?.location || '' }
        );
        
        console.log('Status update email result:', emailResult);
      } catch (emailError) {
        console.error('Email sending failed but status was updated:', emailError);
        // Don't throw here - status was updated successfully
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
