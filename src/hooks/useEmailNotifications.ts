
import { useEmailAutomation } from './useEmailAutomation';
import { useEmailSettings } from './useEmailSettings';
import { JobApplication } from '@/types';

export const useEmailNotifications = () => {
  const { sendApplicationSubmittedEmail, sendStatusChangeNotification } = useEmailAutomation();
  const { settings } = useEmailSettings();

  const sendApplicationConfirmation = async (
    application: JobApplication & { appliedPosition: string },
    job: { location: string }
  ) => {
    try {
      if (!settings.enableAutoResponses) {
        console.log('Auto-response emails are disabled');
        return { success: false, message: 'Auto-response emails are disabled' };
      }

      console.log('Sending application confirmation email...');
      await sendApplicationSubmittedEmail(
        {
          email: application.email,
          firstName: application.firstName,
          lastName: application.lastName,
          appliedPosition: application.appliedPosition,
          earliestStartDate: application.earliestStartDate || '',
          phone: application.phone || '',
        },
        job,
        application.trackingToken
      );

      return { success: true, message: 'Confirmation email sent successfully' };
    } catch (error) {
      console.error('Failed to send application confirmation:', error);
      return { 
        success: false, 
        message: `Failed to send confirmation email: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  };

  const sendStatusUpdateEmail = async (
    application: JobApplication & { appliedPosition: string },
    job?: { location?: string }
  ) => {
    try {
      if (!settings.enableNotifications) {
        console.log('Email notifications are disabled');
        return { success: false, message: 'Email notifications are disabled' };
      }

      console.log('Sending status update email for:', application.status);
      await sendStatusChangeNotification(
        {
          email: application.email,
          firstName: application.firstName,
          lastName: application.lastName,
          appliedPosition: application.appliedPosition,
          status: application.status as any,
        },
        job,
        application.trackingToken
      );

      return { success: true, message: 'Status update email sent successfully' };
    } catch (error) {
      console.error('Failed to send status update email:', error);
      return { 
        success: false, 
        message: `Failed to send status update email: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  };

  return {
    sendApplicationConfirmation,
    sendStatusUpdateEmail,
    isEmailEnabled: settings.enableNotifications,
    isAutoResponseEnabled: settings.enableAutoResponses,
  };
};
