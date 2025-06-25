
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEmailNotifications } from './useEmailNotifications';
import { JobApplication } from '@/types';

export const useApplicationSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendApplicationConfirmation } = useEmailNotifications();

  const submitApplication = async (
    applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt' | 'trackingToken'>,
    jobData: { location: string }
  ) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting application...');
      
      // Submit the application to the database
      const { data: application, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: applicationData.jobId,
          first_name: applicationData.firstName,
          last_name: applicationData.lastName,
          email: applicationData.email,
          phone: applicationData.phone,
          applied_position: applicationData.appliedPosition,
          city_state: applicationData.cityState,
          earliest_start_date: applicationData.earliestStartDate,
          cover_letter: applicationData.coverLetter,
          additional_docs_urls: applicationData.additionalDocsUrls,
          status: 'application_submitted',
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting application:', error);
        throw error;
      }

      console.log('Application submitted successfully:', application);

      // Send confirmation email
      try {
        const emailResult = await sendApplicationConfirmation(
          {
            id: application.id,
            jobId: application.job_id,
            firstName: application.first_name,
            lastName: application.last_name,
            email: application.email,
            phone: application.phone || '',
            appliedPosition: application.applied_position,
            cityState: application.city_state || '',
            earliestStartDate: application.earliest_start_date || '',
            coverLetter: application.cover_letter || '',
            additionalDocsUrls: application.additional_docs_urls || [],
            status: application.status as any,
            notes: '',
            trackingToken: application.tracking_token,
            createdAt: application.created_at || '',
            updatedAt: application.updated_at || '',
          },
          jobData
        );
        
        console.log('Email result:', emailResult);
      } catch (emailError) {
        console.error('Email sending failed but application was saved:', emailError);
        // Don't throw here - application was saved successfully
      }

      return { success: true, application, trackingToken: application.tracking_token };
    } catch (error) {
      console.error('Application submission failed:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitApplication,
    isSubmitting,
  };
};
