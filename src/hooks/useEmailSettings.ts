
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailSettings {
  adminEmails: string[];
  enableNotifications: boolean;
  enableAutoResponses: boolean;
}

export const useEmailSettings = () => {
  const [settings, setSettings] = useState<EmailSettings>({
    adminEmails: ['careers@viaquesthospice.com'],
    enableNotifications: true,
    enableAutoResponses: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    try {
      console.log('Loading email settings from database...');
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading email settings:', error);
        // Use default settings if database fetch fails
        return;
      }

      if (data) {
        console.log('Loaded email settings:', data);
        setSettings({
          adminEmails: data.admin_emails || ['careers@viaquesthospice.com'],
          enableNotifications: data.enable_notifications ?? true,
          enableAutoResponses: data.enable_auto_responses ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading email settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: EmailSettings) => {
    try {
      console.log('Saving email settings to database:', newSettings);
      
      // First check if any settings exist
      const { data: existing } = await supabase
        .from('email_settings')
        .select('id')
        .limit(1)
        .single();

      let result;
      if (existing) {
        // Update existing settings
        result = await supabase
          .from('email_settings')
          .update({
            admin_emails: newSettings.adminEmails,
            enable_notifications: newSettings.enableNotifications,
            enable_auto_responses: newSettings.enableAutoResponses,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Insert new settings
        result = await supabase
          .from('email_settings')
          .insert({
            admin_emails: newSettings.adminEmails,
            enable_notifications: newSettings.enableNotifications,
            enable_auto_responses: newSettings.enableAutoResponses,
          });
      }

      if (result.error) {
        console.error('Error saving email settings:', result.error);
        return false;
      }

      setSettings(newSettings);
      console.log('Email settings saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving email settings:', error);
      return false;
    }
  };

  const getAdminEmails = () => settings.adminEmails;

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    isLoading,
    saveSettings,
    getAdminEmails,
  };
};
