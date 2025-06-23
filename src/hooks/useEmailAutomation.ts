
import { supabase } from '@/integrations/supabase/client';

interface EmailVariables {
  firstName: string;
  lastName: string;
  position: string;
  location?: string;
  email?: string;
  phone?: string;
  earliestStartDate?: string;
  applicationDate?: string;
  trackingToken?: string;
  trackingUrl?: string;
}

export const useEmailAutomation = () => {
  const sendEmail = async (
    templateSlug: string,
    recipientEmail: string,
    variables: EmailVariables,
    adminEmails?: string[]
  ) => {
    try {
      console.log('Sending email:', { templateSlug, recipientEmail, variables });
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          templateSlug,
          recipientEmail,
          variables,
          adminEmails
        }
      });

      if (error) {
        console.error('Email sending error:', error);
        throw error;
      }

      console.log('Email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  };

  const sendApplicationSubmittedEmail = async (
    application: {
      email: string;
      firstName: string;
      lastName: string;
      appliedPosition: string;
      earliestStartDate?: string;
      phone?: string;
    },
    job: {
      location: string;
    },
    trackingToken?: string
  ) => {
    const trackingUrl = trackingToken ? `${window.location.origin}/track/${trackingToken}` : '';
    
    const variables: EmailVariables = {
      firstName: application.firstName,
      lastName: application.lastName,
      position: application.appliedPosition,
      location: job.location,
      email: application.email,
      phone: application.phone || '',
      earliestStartDate: application.earliestStartDate || '',
      applicationDate: new Date().toLocaleDateString(),
      trackingToken: trackingToken || '',
      trackingUrl: trackingUrl
    };

    // Get admin emails for notifications
    const adminEmails = ['admin@hospicecare.com']; // You can make this configurable

    return sendEmail('application_submitted', application.email, variables, adminEmails);
  };

  const sendApplicationStatusEmail = async (
    application: {
      email: string;
      firstName: string;
      lastName: string;
      appliedPosition: string;
      status: string;
    }
  ) => {
    try {
      console.log('Preparing status update email for:', {
        email: application.email,
        status: application.status,
        position: application.appliedPosition
      });

      const variables: EmailVariables = {
        firstName: application.firstName,
        lastName: application.lastName,
        position: application.appliedPosition
      };

      const templateSlug = application.status === 'approved' ? 'application_approved' : 'application_rejected';
      
      console.log('Using template:', templateSlug);
      return await sendEmail(templateSlug, application.email, variables);
    } catch (error) {
      console.error('Error in sendApplicationStatusEmail:', error);
      throw new Error(`Failed to send ${application.status} email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return {
    sendEmail,
    sendApplicationSubmittedEmail,
    sendApplicationStatusEmail
  };
};
