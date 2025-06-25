
import { supabase } from '@/integrations/supabase/client';
import { useEmailSettings } from './useEmailSettings';

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
  adminUrl?: string;
}

// Define which statuses should trigger email notifications
const EMAIL_ENABLED_STATUSES = {
  'application_submitted': true,
  'under_review': true,
  'shortlisted': true,
  'interview_scheduled': true,
  'decisioning': true,
  'hired': true,
  'rejected': true,
} as const;

// Map application statuses to email template slugs
const STATUS_TO_TEMPLATE_MAP = {
  'application_submitted': 'application_submitted',
  'under_review': 'under_review',
  'shortlisted': 'shortlisted',
  'interview_scheduled': 'interview_scheduled',
  'decisioning': 'decisioning',
  'hired': 'hired',
  'rejected': 'application_rejected',
} as const;

export const useEmailAutomation = () => {
  const { getAdminEmails } = useEmailSettings();

  const sendEmail = async (
    templateSlug: string,
    recipientEmail: string,
    variables: EmailVariables
  ) => {
    try {
      console.log('Sending email:', { templateSlug, recipientEmail, variables });
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          templateSlug,
          recipientEmail,
          variables
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
    try {
      const trackingUrl = trackingToken ? `${window.location.origin}/track/${trackingToken}` : '';
      const adminUrl = `${window.location.origin}/admin`;
      
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
        trackingUrl: trackingUrl,
        adminUrl: adminUrl
      };

      console.log('Sending confirmation email to candidate:', application.email);
      // Send confirmation email to the candidate
      await sendEmail('application_submitted', application.email, variables);

      console.log('Sending admin notification...');
      // Get admin emails from settings
      const adminEmails = getAdminEmails();
      
      // Send to each admin email individually to ensure delivery
      for (const adminEmail of adminEmails) {
        console.log('Sending admin notification to:', adminEmail);
        await sendEmail('admin_notification', adminEmail, variables);
      }

      console.log('All emails sent successfully');
    } catch (error) {
      console.error('Error in sendApplicationSubmittedEmail:', error);
      throw error;
    }
  };

  const sendApplicationStatusEmail = async (
    application: {
      email: string;
      firstName: string;
      lastName: string;
      appliedPosition: string;
      status: string;
    },
    job?: {
      location?: string;
    },
    trackingToken?: string
  ) => {
    try {
      console.log('Preparing status update email for:', {
        email: application.email,
        status: application.status,
        position: application.appliedPosition
      });

      // Check if this status should trigger an email
      const statusKey = application.status as keyof typeof EMAIL_ENABLED_STATUSES;
      if (!EMAIL_ENABLED_STATUSES[statusKey]) {
        console.log(`Email notifications disabled for status: ${application.status}`);
        return { success: true, message: 'Email notifications disabled for this status' };
      }

      // Get the appropriate template slug
      const templateSlug = STATUS_TO_TEMPLATE_MAP[statusKey];
      if (!templateSlug) {
        console.warn(`No email template found for status: ${application.status}`);
        return { success: false, message: `No email template configured for status: ${application.status}` };
      }

      const trackingUrl = trackingToken ? `${window.location.origin}/track/${trackingToken}` : '';
      
      const variables: EmailVariables = {
        firstName: application.firstName,
        lastName: application.lastName,
        position: application.appliedPosition,
        location: job?.location || '',
        trackingToken: trackingToken || '',
        trackingUrl: trackingUrl,
      };

      console.log('Using template:', templateSlug);
      const result = await sendEmail(templateSlug, application.email, variables);
      
      return { success: true, result };
    } catch (error) {
      console.error('Error in sendApplicationStatusEmail:', error);
      throw new Error(`Failed to send ${application.status} email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // New function to send status update emails for any status change
  const sendStatusChangeNotification = async (
    application: {
      email: string;
      firstName: string;
      lastName: string;
      appliedPosition: string;
      status: 'application_submitted' | 'under_review' | 'shortlisted' | 'interview_scheduled' | 'decisioning' | 'hired' | 'rejected';
    },
    job?: {
      location?: string;
    },
    trackingToken?: string
  ) => {
    return sendApplicationStatusEmail(application, job, trackingToken);
  };

  // Function to check if email should be sent for a status
  const shouldSendEmailForStatus = (status: string): boolean => {
    const statusKey = status as keyof typeof EMAIL_ENABLED_STATUSES;
    return EMAIL_ENABLED_STATUSES[statusKey] || false;
  };

  // Function to get template slug for a status
  const getTemplateSlugForStatus = (status: string): string | null => {
    const statusKey = status as keyof typeof STATUS_TO_TEMPLATE_MAP;
    return STATUS_TO_TEMPLATE_MAP[statusKey] || null;
  };

  return {
    sendEmail,
    sendApplicationSubmittedEmail,
    sendApplicationStatusEmail,
    sendStatusChangeNotification,
    shouldSendEmailForStatus,
    getTemplateSlugForStatus,
    EMAIL_ENABLED_STATUSES,
    STATUS_TO_TEMPLATE_MAP
  };
};
