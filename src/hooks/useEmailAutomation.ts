
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
  calendlyUrl?: string;
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

  const getCalendlyUrl = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('calendly_settings')
        .select('default_event_type_uri')
        .limit(1)
        .single();

      if (error || !data?.default_event_type_uri) {
        console.log('No Calendly settings found or no default event type URI');
        return null;
      }

      // Convert Calendly event type URI to a scheduling URL
      // The default_event_type_uri should be in format: https://api.calendly.com/event_types/AAAA...
      // We need to extract the event type ID and create a scheduling URL
      const eventTypeUri = data.default_event_type_uri;
      
      // If it's already a scheduling URL (starts with calendly.com), return as is
      if (eventTypeUri.includes('calendly.com') && !eventTypeUri.includes('api.calendly.com')) {
        return eventTypeUri;
      }
      
      // If it's an API URI, we'll return it as is and let the template handle the conversion
      // In a production environment, you might want to fetch the actual scheduling URL from Calendly API
      return eventTypeUri;
    } catch (error) {
      console.error('Error fetching Calendly settings:', error);
      return null;
    }
  };

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
      
      // Get Calendly URL for shortlisted status
      let calendlyUrl = '';
      if (application.status === 'shortlisted') {
        const fetchedCalendlyUrl = await getCalendlyUrl();
        if (fetchedCalendlyUrl) {
          // If it's an API URI, convert it to a user-friendly scheduling URL
          if (fetchedCalendlyUrl.includes('api.calendly.com/event_types/')) {
            // Extract the event type ID and create a generic scheduling URL
            // Note: In production, you'd want to get the actual scheduling URL from Calendly
            calendlyUrl = fetchedCalendlyUrl.replace('api.calendly.com/event_types/', 'calendly.com/your-username/');
          } else {
            calendlyUrl = fetchedCalendlyUrl;
          }
        }
        console.log('Calendly URL for shortlisted email:', calendlyUrl);
      }
      
      const variables: EmailVariables = {
        firstName: application.firstName,
        lastName: application.lastName,
        position: application.appliedPosition,
        location: job?.location || '',
        trackingToken: trackingToken || '',
        trackingUrl: trackingUrl,
        calendlyUrl: calendlyUrl,
      };

      console.log('Using template:', templateSlug);
      console.log('Email variables:', variables);
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
    STATUS_TO_TEMPLATE_MAP,
    getCalendlyUrl
  };
};
