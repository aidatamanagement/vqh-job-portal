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
  trackingURL?: string;
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

      const eventTypeUri = data.default_event_type_uri;
      console.log('Raw Calendly URI from database:', eventTypeUri);
      
      // If it's already a scheduling URL (contains calendly.com but not api.calendly.com), return as is
      if (eventTypeUri.includes('calendly.com') && !eventTypeUri.includes('api.calendly.com')) {
        console.log('Using direct scheduling URL:', eventTypeUri);
        return eventTypeUri;
      }
      
      // If it's an API URI, try to convert it to a scheduling URL
      if (eventTypeUri.includes('api.calendly.com/event_types/')) {
        try {
          // Use the Calendly API to get the event type details
          const { data: apiData, error: apiError } = await supabase.functions.invoke('calendly-api', {
            body: { 
              action: 'getEventType',
              eventTypeUri: eventTypeUri
            }
          });

          if (!apiError && apiData?.success && apiData.data?.resource?.scheduling_url) {
            console.log('Converted API URI to scheduling URL:', apiData.data.resource.scheduling_url);
            return apiData.data.resource.scheduling_url;
          } else {
            console.log('Failed to get scheduling URL from API, using fallback');
            // Extract the event type ID and create a generic scheduling URL
            const matches = eventTypeUri.match(/event_types\/([a-f0-9\-]+)/);
            if (matches && matches[1]) {
              const eventTypeId = matches[1];
              // This is a fallback - the admin should configure the proper scheduling URL
              return `https://calendly.com/your-company/interviews?event_type=${eventTypeId}`;
            }
          }
        } catch (apiError) {
          console.error('Error calling Calendly API:', apiError);
        }
      }
      
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
      const trackingURL = trackingToken ? `${window.location.origin}/track/${trackingToken}` : '';
      const adminUrl = `${window.location.origin}/admin`;
      
      // Get Calendly URL for all emails
      const calendlyUrl = await getCalendlyUrl() || '';
      
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
        trackingURL: trackingURL,
        adminUrl: adminUrl,
        calendlyUrl: calendlyUrl
      };

      console.log('Sending confirmation email to candidate:', application.email);
      console.log('Email variables for application submitted:', variables);
      
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

      const trackingURL = trackingToken ? `${window.location.origin}/track/${trackingToken}` : '';
      
      // Get Calendly URL for all status emails
      const calendlyUrl = await getCalendlyUrl() || '';
      console.log('Calendly URL fetched for status email:', calendlyUrl);
      
      const variables: EmailVariables = {
        firstName: application.firstName,
        lastName: application.lastName,
        position: application.appliedPosition,
        location: job?.location || '',
        trackingToken: trackingToken || '',
        trackingURL: trackingURL,
        calendlyUrl: calendlyUrl,
      };

      console.log('Using template:', templateSlug);
      console.log('Email variables for status update:', variables);
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
