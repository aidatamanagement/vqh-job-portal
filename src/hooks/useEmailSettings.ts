
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailSettings {
  adminEmails: string[];
  staffEmails: string[];
  enableNotifications: boolean;
  enableAutoResponses: boolean;
  enableStaffNotifications: boolean;
}

export const useEmailSettings = () => {
  const [settings, setSettings] = useState<EmailSettings>({
    adminEmails: ['careers@viaquesthospice.com'],
    staffEmails: [],
    enableNotifications: true,
    enableAutoResponses: true,
    enableStaffNotifications: true,
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
          staffEmails: data.staff_emails || [],
          enableNotifications: data.enable_notifications ?? true,
          enableAutoResponses: data.enable_auto_responses ?? true,
          enableStaffNotifications: data.enable_staff_notifications ?? true,
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
      console.log('🔄 Starting saveSettings function...');
      console.log('📊 New settings to save:', newSettings);
      
      // First check if any settings exist
      console.log('🔍 Checking for existing settings...');
      const { data: existing, error: checkError } = await supabase
        .from('email_settings')
        .select('id')
        .limit(1)
        .single();

      if (checkError) {
        console.error('❌ Error checking existing settings:', checkError);
        console.log('📋 Check error details:', {
          message: checkError.message,
          details: checkError.details,
          hint: checkError.hint,
          code: checkError.code
        });
      }

      console.log('📋 Existing settings found:', existing);

      let result;
      if (existing) {
        // Update existing settings
        console.log('🔄 Updating existing settings with ID:', existing.id);
        result = await supabase
          .from('email_settings')
          .update({
            admin_emails: newSettings.adminEmails,
            staff_emails: newSettings.staffEmails,
            enable_notifications: newSettings.enableNotifications,
            enable_auto_responses: newSettings.enableAutoResponses,
            enable_staff_notifications: newSettings.enableStaffNotifications,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Insert new settings
        console.log('🆕 Inserting new settings...');
        result = await supabase
          .from('email_settings')
          .insert({
            admin_emails: newSettings.adminEmails,
            staff_emails: newSettings.staffEmails,
            enable_notifications: newSettings.enableNotifications,
            enable_auto_responses: newSettings.enableAutoResponses,
            enable_staff_notifications: newSettings.enableStaffNotifications,
          });
      }

      if (result.error) {
        console.error('❌ Error saving email settings:', result.error);
        console.log('📋 Save error details:', {
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint,
          code: result.error.code
        });
        return false;
      }

      console.log('✅ Email settings saved successfully');
      console.log('📊 Result:', result);
      
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error('❌ Exception in saveSettings:', error);
      return false;
    }
  };

  const getAdminEmails = () => settings.adminEmails;
  const getStaffEmails = () => settings.staffEmails;

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    isLoading,
    loadSettings,
    saveSettings,
    getAdminEmails,
    getStaffEmails,
  };
};
