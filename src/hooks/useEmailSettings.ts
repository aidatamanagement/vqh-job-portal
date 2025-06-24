
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
      // For now, we'll use localStorage. In a real app, you'd save to a database
      const savedSettings = localStorage.getItem('emailSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading email settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: EmailSettings) => {
    try {
      localStorage.setItem('emailSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
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
