
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCalendlyApi } from '@/hooks/useCalendlyApi';

interface Interview {
  id: string;
  application_id: string;
  calendly_event_id: string;
  calendly_event_uri: string;
  candidate_email: string;
  interviewer_email?: string;
  scheduled_time: string;
  meeting_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
  // From join with job_applications
  first_name?: string;
  last_name?: string;
  phone?: string;
  applied_position?: string;
  city_state?: string;
}

export const useInterviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendlyConfigured, setIsCalendlyConfigured] = useState(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [lastAutoSync, setLastAutoSync] = useState<Date | null>(null);
  const { toast } = useToast();
  const { getEvents, getInvitees } = useCalendlyApi();

  const checkCalendlyConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from('calendly_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking Calendly configuration:', error);
        setIsCalendlyConfigured(false);
      } else if (data && data.organization_uri) {
        setIsCalendlyConfigured(true);
      } else {
        setIsCalendlyConfigured(false);
      }
    } catch (error) {
      console.error('Error checking Calendly configuration:', error);
      setIsCalendlyConfigured(false);
    } finally {
      setIsCheckingConfig(false);
    }
  };

  const loadInterviews = async () => {
    try {
      console.log('Loading interviews from database...');

      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          job_applications!inner(
            first_name,
            last_name,
            phone,
            applied_position,
            city_state
          )
        `)
        .order('scheduled_time', { ascending: false });

      if (error) {
        console.error('Error loading interviews:', error);
        toast({
          title: "Error",
          description: "Failed to load interviews. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Flatten the joined data
      const flattenedInterviews = (data || []).map(interview => ({
        ...interview,
        first_name: interview.job_applications?.first_name,
        last_name: interview.job_applications?.last_name,
        phone: interview.job_applications?.phone,
        applied_position: interview.job_applications?.applied_position,
        city_state: interview.job_applications?.city_state,
      }));

      setInterviews(flattenedInterviews);
      console.log(`Loaded ${flattenedInterviews.length} interviews`);
    } catch (error) {
      console.error('Error loading interviews:', error);
      toast({
        title: "Error",
        description: "Failed to load interviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const performAutoSync = async () => {
    if (isAutoSyncing || isSyncing) {
      console.log('Sync already in progress, skipping auto-sync');
      return;
    }

    setIsAutoSyncing(true);
    try {
      console.log('Starting automatic sync...');
      await syncWithCalendlyInternal(true);
      setLastAutoSync(new Date());
    } catch (error) {
      console.error('Auto-sync failed:', error);
    } finally {
      setIsAutoSyncing(false);
    }
  };

  const syncWithCalendly = async () => {
    await syncWithCalendlyInternal(false);
  };

  const syncWithCalendlyInternal = async (isAutoSync: boolean = false) => {
    if (!isCalendlyConfigured) {
      if (!isAutoSync) {
        toast({
          title: "Configuration Required",
          description: "Please configure Calendly settings first",
          variant: "destructive",
        });
      }
      return;
    }

    if (!isAutoSync) {
      setIsSyncing(true);
    }

    try {
      // Get organization URI from settings
      const { data: settings } = await supabase
        .from('calendly_settings')
        .select('organization_uri')
        .single();

      if (!settings?.organization_uri) {
        if (!isAutoSync) {
          toast({
            title: "Configuration Error",
            description: "Organization URI not found in settings",
            variant: "destructive",
          });
        }
        return;
      }

      console.log(`${isAutoSync ? 'Auto-' : ''}Fetching Calendly events...`);
      const eventsResult = await getEvents(settings.organization_uri);
      
      if (!eventsResult.success || !eventsResult.events) {
        if (!isAutoSync) {
          toast({
            title: "Sync Failed",
            description: eventsResult.error || "Failed to fetch events from Calendly",
            variant: "destructive",
          });
        }
        return;
      }

      console.log(`Found ${eventsResult.events.length} Calendly events for ${isAutoSync ? 'auto-' : ''}sync`);
      let syncedCount = 0;
      let skippedCount = 0;

      for (const event of eventsResult.events) {
        try {
          // Extract event ID from URI
          const eventId = event.uri.split('/').pop();
          if (!eventId) {
            console.warn('Could not extract event ID from URI:', event.uri);
            skippedCount++;
            continue;
          }

          // Check if interview already exists
          const { data: existingInterview } = await supabase
            .from('interviews')
            .select('id')
            .eq('calendly_event_id', eventId)
            .single();

          if (existingInterview) {
            skippedCount++;
            continue;
          }

          // Get invitees for this event
          const inviteesResult = await getInvitees(event.uri);
          
          if (!inviteesResult.success || !inviteesResult.invitees || inviteesResult.invitees.length === 0) {
            skippedCount++;
            continue;
          }

          const invitee = inviteesResult.invitees[0]; // Get the first invitee

          // Try to find a matching job application by email
          const { data: applications, error: appError } = await supabase
            .from('job_applications')
            .select('id')
            .eq('email', invitee.email)
            .order('created_at', { ascending: false })
            .limit(1);

          if (appError || !applications || applications.length === 0) {
            skippedCount++;
            continue;
          }

          const application = applications[0];

          // Create interview record
          const { data: interview, error: interviewError } = await supabase
            .from('interviews')
            .insert({
              application_id: application.id,
              calendly_event_id: eventId,
              calendly_event_uri: event.uri,
              candidate_email: invitee.email,
              interviewer_email: null,
              scheduled_time: event.start_time,
              meeting_url: event.location?.join_url || null,
              status: event.status === 'active' ? 'scheduled' : event.status,
            })
            .select()
            .single();

          if (interviewError) {
            console.error(`Error creating interview for event ${eventId}:`, interviewError);
            skippedCount++;
            continue;
          }

          console.log(`Successfully synced interview for event ${eventId}`);
          syncedCount++;

        } catch (eventError) {
          console.error(`Error processing event ${event.uri}:`, eventError);
          skippedCount++;
        }
      }

      if (syncedCount > 0) {
        const message = `${isAutoSync ? 'Auto-synced' : 'Synced'} ${syncedCount} new interviews from Calendly${skippedCount > 0 ? `. ${skippedCount} events were skipped.` : '.'}`;
        
        if (!isAutoSync) {
          toast({
            title: "Sync Successful",
            description: message,
          });
        } else {
          console.log(message);
        }
        
        // Reload interviews to show new records
        await loadInterviews();
      } else if (!isAutoSync) {
        toast({
          title: "Sync Complete",
          description: skippedCount > 0 
            ? `Found ${eventsResult.events.length} Calendly events, but ${skippedCount} were skipped (already exist or missing data)`
            : `Found ${eventsResult.events.length} Calendly events, but none could be synced`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error(`Error during ${isAutoSync ? 'auto-' : ''}sync:`, error);
      if (!isAutoSync) {
        toast({
          title: "Sync Error",
          description: "An unexpected error occurred during sync",
          variant: "destructive",
        });
      }
    } finally {
      if (!isAutoSync) {
        setIsSyncing(false);
      }
    }
  };

  // Set up real-time subscription for interviews table
  useEffect(() => {
    if (!isCalendlyConfigured) return;

    console.log('Setting up real-time subscription for interviews...');
    
    const channel = supabase
      .channel('interviews-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interviews'
        },
        (payload) => {
          console.log('New interview created via real-time:', payload);
          // Reload interviews to get the complete data with joins
          loadInterviews();
          toast({
            title: "New Interview",
            description: "A new interview has been scheduled automatically",
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'interviews'
        },
        (payload) => {
          console.log('Interview updated via real-time:', payload);
          // Reload interviews to get the updated data
          loadInterviews();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [isCalendlyConfigured]);

  // Set up periodic auto-sync as fallback
  useEffect(() => {
    if (!isCalendlyConfigured) return;

    console.log('Setting up periodic auto-sync...');
    
    // Auto-sync every 10 minutes
    const autoSyncInterval = setInterval(() => {
      console.log('Running periodic auto-sync...');
      performAutoSync();
    }, 10 * 60 * 1000); // 10 minutes

    // Initial auto-sync after 30 seconds
    const initialSyncTimeout = setTimeout(() => {
      console.log('Running initial auto-sync...');
      performAutoSync();
    }, 30 * 1000); // 30 seconds

    return () => {
      clearInterval(autoSyncInterval);
      clearTimeout(initialSyncTimeout);
    };
  }, [isCalendlyConfigured]);

  useEffect(() => {
    checkCalendlyConfiguration();
    loadInterviews();
  }, []);

  return {
    interviews,
    isLoading,
    isCalendlyConfigured,
    isCheckingConfig,
    isSyncing,
    isAutoSyncing,
    lastAutoSync,
    syncWithCalendly,
    loadInterviews
  };
};
