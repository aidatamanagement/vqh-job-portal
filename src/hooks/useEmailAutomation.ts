
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
    }
  ) => {
    // First, get the tracking token for this application
    const { data: applicationData, error } = await supabase
      .from('job_applications')
      .select('tracking_token')
      .eq('email', application.email)
      .eq('applied_position', application.appliedPosition)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Failed to get tracking token:', error);
      // Continue without tracking link if we can't fetch it
    }

    const trackingUrl = applicationData?.tracking_token 
      ? `${window.location.origin}/track/${applicationData.tracking_token}`
      : undefined;

    const variables: EmailVariables = {
      firstName: application.firstName,
      lastName: application.lastName,
      position: application.appliedPosition,
      location: job.location,
      email: application.email,
      phone: application.phone || '',
      earliestStartDate: application.earliestStartDate || '',
      applicationDate: new Date().toLocaleDateString(),
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
    const variables: EmailVariables = {
      firstName: application.firstName,
      lastName: application.lastName,
      position: application.appliedPosition
    };

    const templateSlug = application.status === 'approved' ? 'application_approved' : 'application_rejected';
    
    return sendEmail(templateSlug, application.email, variables);
  };

  return {
    sendEmail,
    sendApplicationSubmittedEmail,
    sendApplicationStatusEmail
  };
};
