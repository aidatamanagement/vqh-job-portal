
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

interface CalendlyInvitee {
  uri: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
  updated_at: string;
  canceled: boolean;
  payment: any;
  no_show: any;
}

export const useCalendlyApi = () => {
  const testConnection = async (): Promise<{ success: boolean; user?: CalendlyUser; error?: string }> => {
    try {
      console.log("Testing Calendly connection...");
      
      const { data, error } = await supabase.functions.invoke('calendly-api', {
        body: { action: 'testConnection' }
      });

      console.log("Supabase function response:", { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        return { 
          success: false, 
          error: `Connection failed: ${error.message || 'Unknown error'}` 
        };
      }

      if (!data) {
        console.error('No data returned from function');
        return { 
          success: false, 
          error: 'No response from Calendly API function' 
        };
      }

      if (!data.success) {
        console.error('Function returned error:', data.error);
        return { 
          success: false, 
          error: data.error || 'Calendly API connection failed' 
        };
      }

      if (!data.data || !data.data.resource) {
        console.error('Invalid response structure:', data);
        return { 
          success: false, 
          error: 'Invalid response from Calendly API' 
        };
      }

      console.log("Connection successful:", data.data.resource);
      return { success: true, user: data.data.resource };
    } catch (error) {
      console.error('Error in testConnection:', error);
      return { 
        success: false, 
        error: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  };

  const getUser = async (): Promise<{ success: boolean; user?: CalendlyUser; error?: string }> => {
    try {
      console.log("Getting Calendly user...");
      
      const { data, error } = await supabase.functions.invoke('calendly-api', {
        body: { action: 'getUser' }
      });

      console.log("Get user response:", { data, error });

      if (error) {
        console.error('Error getting Calendly user:', error);
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Failed to get user' };
      }

      return { success: true, user: data.data.resource };
    } catch (error) {
      console.error('Error in getUser:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const getEventTypes = async (organizationUri: string): Promise<{ success: boolean; eventTypes?: CalendlyEventType[]; error?: string }> => {
    try {
      console.log("Getting event types for organization:", organizationUri);
      
      const { data, error } = await supabase.functions.invoke('calendly-api', {
        body: { 
          action: 'getEventTypes',
          organizationUri 
        }
      });

      console.log("Get event types response:", { data, error });

      if (error) {
        console.error('Error getting Calendly event types:', error);
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Failed to get event types' };
      }

      return { success: true, eventTypes: data.data.collection };
    } catch (error) {
      console.error('Error in getEventTypes:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const getEvents = async (organizationUri: string): Promise<{ success: boolean; events?: CalendlyEvent[]; error?: string }> => {
    try {
      console.log("Getting events for organization:", organizationUri);
      
      const { data, error } = await supabase.functions.invoke('calendly-api', {
        body: { 
          action: 'getEvents',
          organizationUri 
        }
      });

      console.log("Get events response:", { data, error });

      if (error) {
        console.error('Error getting Calendly events:', error);
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Failed to get events' };
      }

      return { success: true, events: data.data.collection };
    } catch (error) {
      console.error('Error in getEvents:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const getInvitees = async (eventUri: string): Promise<{ success: boolean; invitees?: CalendlyInvitee[]; error?: string }> => {
    try {
      console.log("Getting invitees for event:", eventUri);
      
      const { data, error } = await supabase.functions.invoke('calendly-api', {
        body: { 
          action: 'getInvitees',
          eventUri 
        }
      });

      console.log("Get invitees response:", { data, error });

      if (error) {
        console.error('Error getting Calendly invitees:', error);
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Failed to get invitees' };
      }

      return { success: true, invitees: data.data.collection };
    } catch (error) {
      console.error('Error in getInvitees:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  return {
    testConnection,
    getUser,
    getEventTypes,
    getEvents,
    getInvitees,
  };
};
