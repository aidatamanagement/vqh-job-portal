
import { supabase } from '@/integrations/supabase/client';

interface CalendlyUser {
  uri: string;
  name: string;
  slug: string;
  email: string;
  scheduling_url: string;
  timezone: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  current_organization: string;
}

interface CalendlyEventType {
  uri: string;
  name: string;
  active: boolean;
  slug: string;
  scheduling_url: string;
  duration: number;
  kind: string;
  color: string;
  created_at: string;
  updated_at: string;
}

interface CalendlyEvent {
  uri: string;
  name: string;
  status: string;
  start_time: string;
  end_time: string;
  event_type: string;
  location?: {
    type: string;
    location?: string;
    join_url?: string;
  };
  invitees_counter: {
    total: number;
    active: number;
    limit: number;
  };
  created_at: string;
  updated_at: string;
}

export const useCalendlyApi = () => {
  const testConnection = async (): Promise<{ success: boolean; user?: CalendlyUser; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('calendly-api', {
        body: { action: 'testConnection' }
      });

      if (error) {
        console.error('Error testing Calendly connection:', error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Unknown error' };
      }

      return { success: true, user: data.data.resource };
    } catch (error) {
      console.error('Error in testConnection:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const getUser = async (): Promise<{ success: boolean; user?: CalendlyUser; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('calendly-api', {
        body: { action: 'getUser' }
      });

      if (error) {
        console.error('Error getting Calendly user:', error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Unknown error' };
      }

      return { success: true, user: data.data.resource };
    } catch (error) {
      console.error('Error in getUser:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const getEventTypes = async (organizationUri: string): Promise<{ success: boolean; eventTypes?: CalendlyEventType[]; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('calendly-api', {
        body: { 
          action: 'getEventTypes',
          organizationUri 
        }
      });

      if (error) {
        console.error('Error getting Calendly event types:', error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Unknown error' };
      }

      return { success: true, eventTypes: data.data.collection };
    } catch (error) {
      console.error('Error in getEventTypes:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const getEvents = async (organizationUri: string): Promise<{ success: boolean; events?: CalendlyEvent[]; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('calendly-api', {
        body: { 
          action: 'getEvents',
          organizationUri 
        }
      });

      if (error) {
        console.error('Error getting Calendly events:', error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Unknown error' };
      }

      return { success: true, events: data.data.collection };
    } catch (error) {
      console.error('Error in getEvents:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  return {
    testConnection,
    getUser,
    getEventTypes,
    getEvents,
  };
};
