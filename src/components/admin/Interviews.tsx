import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Settings,
  Trash2,
  Zap,
  CalendarDays,
  Table
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCalendlyApi } from '@/hooks/useCalendlyApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InterviewsTable from './components/InterviewsTable';
import CalendarView, { CalendarInterview } from './components/CalendarView';
import { useAppContext } from '@/contexts/AppContext';

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
  // From join with jobs
  job_location?: string;
  job_position?: string;
}

const Interviews: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewType, setViewType] = useState<'calendar' | 'table'>('calendar');
  const [isCalendlyConfigured, setIsCalendlyConfigured] = useState(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [lastAutoSync, setLastAutoSync] = useState<Date | null>(null);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const { toast } = useToast();
  const { getEvents, getInvitees } = useCalendlyApi();
  const { userProfile } = useAppContext();

  useEffect(() => {
    checkCalendlyConfiguration();
    loadInterviews();
  }, []);

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
      
      // First, let's check if there are any interviews at all
      const basicQuery = supabase
        .from('interviews')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('scheduled_time', { ascending: false });

      const basicResult = await basicQuery;
      
      if (basicResult.error) {
        console.error('Basic query failed:', basicResult.error);
        toast({
          title: "Error",
          description: `Failed to load interviews: ${basicResult.error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Basic interviews found:', basicResult.data?.length || 0);

      if (!basicResult.data || basicResult.data.length === 0) {
        console.log('No interviews found in the last 30 days');
        setInterviews([]);
        return;
      }

      // Try a simple join first without specifying the foreign key name
      let query = supabase
        .from('interviews')
        .select(`
          *,
          job_applications(
            id,
            first_name,
            last_name,
            phone,
            applied_position,
            city_state,
            email,
            jobs(
              location,
              position
            )
          )
        `)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('scheduled_time', { ascending: false });

      let { data, error } = await query;

      if (error) {
        console.error('Joined query failed, trying manual lookup:', error);
        // If the joined query fails, try to manually fetch applicant data
        data = basicResult.data;
        
        // Try to fetch applicant data manually for each interview
        if (data && data.length > 0) {
          const applicationIds = data.map(interview => interview.application_id).filter(Boolean);
          
          if (applicationIds.length > 0) {
            const { data: applications, error: appError } = await supabase
              .from('job_applications')
              .select(`
                *,
                jobs(
                  location,
                  position
                )
              `)
              .in('id', applicationIds);
            
            if (!appError && applications) {
              console.log('Manually fetched applications:', applications.length);
              
              // Map applications by ID for quick lookup
              const appMap = new Map(applications.map(app => [app.id, app]));
              
              // Enhance interview data with application data
              data = data.map(interview => ({
                ...interview,
                job_applications: appMap.get(interview.application_id) || null
              }));
            } else {
              console.error('Failed to manually fetch applications:', appError);
            }
          }
        }
        
        console.log('Using enhanced interview data:', data);
      } else {
        console.log('Joined query successful, raw interview data:', data);
      }

      // Flatten the data with applicant names from related table
      let flattenedInterviews = (data || []).map(interview => {
        // The join should give us job_applications data
        const application = interview.job_applications;
        
        console.log('Interview data:', {
          id: interview.id,
          application_id: interview.application_id,
          candidate_email: interview.candidate_email,
          has_application: !!application,
          application_name: application ? `${application.first_name} ${application.last_name}` : 'No application data'
        });
        
        return {
          ...interview,
          first_name: application?.first_name || 'Unknown',
          last_name: application?.last_name || 'Candidate',
          phone: application?.phone || '',
          applied_position: application?.applied_position || 'Unknown Position',
          city_state: application?.city_state || '',
          job_location: application?.jobs?.location || 'Unknown Location',
          job_position: application?.jobs?.position || 'Unknown Position',
        };
      });

      // Apply role-based filtering
      if (userProfile?.role !== 'admin') {
        // For non-admin users, only show interviews where job location matches their working location
        const userLocation = userProfile?.location;
        if (userLocation) {
          flattenedInterviews = flattenedInterviews.filter(interview => 
            interview.job_location === userLocation
          );
        } else {
          // If user has no location set, show no interviews
          flattenedInterviews = [];
        }
      }

      setInterviews(flattenedInterviews);
      console.log(`Loaded ${flattenedInterviews.length} interviews`);
      console.log('Sample interview data:', flattenedInterviews[0]);
      
      if (userProfile?.role !== 'admin') {
        console.log(`Filtered to user location: ${userProfile?.location}`);
      }
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

  const deleteCancelledInterviews = async () => {
    try {
      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('status', 'cancelled');

      if (error) {
        console.error('Error deleting cancelled interviews:', error);
        toast({
          title: "Deletion Failed",
          description: "Failed to delete cancelled interviews.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Deletion Complete",
        description: "All cancelled interviews have been removed.",
      });

      // Reload interviews after deletion
      await loadInterviews();
    } catch (error) {
      console.error('Error during deletion:', error);
      toast({
        title: "Deletion Error",
        description: "An error occurred during deletion.",
        variant: "destructive",
      });
    }
  };

  const cleanupOldInterviews = async () => {
    setIsCleaningUp(true);
    try {
      // Calculate 12 hours ago from current time
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      
      console.log('Cleaning up old scheduled and cancelled interviews...');
      console.log('Cutoff time (12 hours ago):', twelveHoursAgo.toISOString());
      
      const { error } = await supabase
        .from('interviews')
        .delete()
        .or(`and(scheduled_time.lt.${twelveHoursAgo.toISOString()},status.eq.scheduled),and(scheduled_time.lt.${twelveHoursAgo.toISOString()},status.eq.cancelled)`);

      if (error) {
        console.error('Error cleaning up old interviews:', error);
        toast({
          title: "Cleanup Failed",
          description: "Failed to clean up old interviews.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Cleanup Complete",
        description: "Old scheduled and cancelled interviews have been removed.",
      });

      // Reload interviews after cleanup
      await loadInterviews();
    } catch (error) {
      console.error('Error during cleanup:', error);
      toast({
        title: "Cleanup Error",
        description: "An error occurred during cleanup.",
        variant: "destructive",
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  const updateInterviewStatus = async (interviewId: string, completed: boolean) => {
    try {
      const newStatus = completed ? 'completed' : 'scheduled';
      
      const { error } = await supabase
        .from('interviews')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', interviewId);

      if (error) {
        console.error('Error updating interview status:', error);
        toast({
          title: "Update Failed",
          description: "Failed to update interview status.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setInterviews(prev => prev.map(interview => 
        interview.id === interviewId 
          ? { ...interview, status: newStatus }
          : interview
      ));

      toast({
        title: "Status Updated",
        description: `Interview marked as ${completed ? 'completed' : 'scheduled'}.`,
      });
    } catch (error) {
      console.error('Error updating interview status:', error);
      toast({
        title: "Update Error",
        description: "An error occurred while updating the status.",
        variant: "destructive",
      });
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

      // Filter out events older than current time
      const currentTime = new Date();
      const futureEvents = eventsResult.events.filter(event => 
        new Date(event.start_time) >= currentTime
      );

      console.log(`Found ${eventsResult.events.length} total Calendly events, ${futureEvents.length} future events for ${isAutoSync ? 'auto-' : ''}sync`);
      let syncedCount = 0;
      let updatedCount = 0;

      for (const event of futureEvents) {
        try {
          // Extract event ID from URI
          const eventId = event.uri.split('/').pop();
          if (!eventId) {
            console.warn('Could not extract event ID from URI:', event.uri);
            continue;
          }

          // Get invitees for this event
          const inviteesResult = await getInvitees(event.uri);
          
          if (!inviteesResult.success || !inviteesResult.invitees || inviteesResult.invitees.length === 0) {
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
            continue;
          }

          const application = applications[0];

          // Check if interview already exists
          const { data: existingInterview } = await supabase
            .from('interviews')
            .select('id, status, scheduled_time')
            .eq('calendly_event_id', eventId)
            .single();

          if (existingInterview) {
            // Update existing interview with latest data from Calendly
            const { error: updateError } = await supabase
              .from('interviews')
              .update({
                scheduled_time: event.start_time,
                meeting_url: event.location?.join_url || null,
                status: event.status === 'active' ? 'scheduled' : event.status,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingInterview.id);

            if (!updateError) {
              updatedCount++;
              console.log(`Updated existing interview for event ${eventId}`);
            }
          } else {
            // Create new interview record
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

            if (!interviewError) {
              syncedCount++;
              console.log(`Successfully synced new interview for event ${eventId}`);
            }
          }

        } catch (eventError) {
          console.error(`Error processing event ${event.uri}:`, eventError);
        }
      }

      const totalProcessed = syncedCount + updatedCount;
      
      if (totalProcessed > 0) {
        const message = `${isAutoSync ? 'Auto-synced' : 'Synced'} ${totalProcessed} interviews from Calendly (${syncedCount} new, ${updatedCount} updated)`;
        
        if (!isAutoSync) {
          toast({
            title: "Sync Successful",
            description: message,
          });
        } else {
          console.log(message);
        }
        
        // Reload interviews to show updated records
        await loadInterviews();
      } else if (!isAutoSync) {
        toast({
          title: "Sync Complete",
          description: `Found ${futureEvents.length} future Calendly events, but none could be processed (missing job applications)`,
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

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = 
      interview.candidate_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${interview.first_name} ${interview.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.applied_position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getInterviewStats = () => {
    const scheduled = interviews.filter(i => i.status === 'scheduled').length;
    const completed = interviews.filter(i => i.status === 'completed').length;
    const total = interviews.length;
    return { scheduled, completed, total };
  };

  const stats = getInterviewStats();

  if (isCheckingConfig) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900" style={{ fontSize: '1.3rem' }}>Scheduled Interviews</h1>
            <p className="text-sm text-gray-600">Loading interview configuration...</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex justify-center items-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Checking Calendly configuration...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isCalendlyConfigured) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900" style={{ fontSize: '1.3rem' }}>Scheduled Interviews</h1>
            <p className="text-sm text-gray-600">Viewing existing interviews</p>
          </div>
        </div>

        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-yellow-800">Calendly Not Configured</p>
                <p className="text-yellow-700 text-sm">
                  You can view existing interviews, but automatic scheduling requires Calendly integration.
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-800">Setup Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
                  <li>Go to Settings → Calendly tab</li>
                  <li>Enter your Calendly Organization URI</li>
                  <li>Save settings and test the connection</li>
                  <li>Select a default event type for interviews</li>
                </ol>
              </div>
              
              <Button 
                onClick={() => window.location.href = '/admin?tab=settings'}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configure Calendly
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Show interviews even without Calendly configuration */}
        {isLoading ? (
          <Card>
            <CardContent className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                <p className="text-gray-600">Loading interviews...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Conditional View Based on viewType */}
            {viewType === 'calendar' ? (
              <CalendarView
                interviews={interviews.map(interview => ({
                  id: interview.id,
                  candidate_email: interview.candidate_email,
                  scheduled_time: interview.scheduled_time,
                  status: interview.status,
                  first_name: interview.first_name,
                  last_name: interview.last_name,
                  applied_position: interview.applied_position,
                  city_state: interview.city_state,
                  job_location: interview.job_location,
                  job_position: interview.job_position,
                  meeting_url: interview.meeting_url,
                  phone: interview.phone,
                }))}
                isLoading={isLoading}
                onUpdateStatus={updateInterviewStatus}
              />
            ) : (
              <>
                {/* Filters - only shown in table view */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search by candidate name, email, or position..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                          <div className="flex items-center">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Filter by status" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="no_show">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Interviews Table */}
                <InterviewsTable
                  interviews={filteredInterviews}
                  isLoading={isLoading}
                  onUpdateStatus={updateInterviewStatus}
                />
              </>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900" style={{ fontSize: '1.3rem' }}>Scheduled Interviews</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{interviews.length} total interviews</span>
              {isAutoSyncing && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Zap className="w-3 h-3" />
                  <span>Auto-syncing...</span>
                </div>
              )}
              {lastAutoSync && (
                <span className="text-xs text-gray-500">
                  Last sync: {lastAutoSync.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {/* View Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewType === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('calendar')}
              className="flex items-center gap-2 px-3"
            >
              <CalendarDays className="w-4 h-4" />
              Calendar
            </Button>
            <Button
              variant={viewType === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('table')}
              className="flex items-center gap-2 px-3"
            >
              <Table className="w-4 h-4" />
              Table
            </Button>
          </div>

          <Button
            onClick={cleanupOldInterviews}
            disabled={isCleaningUp}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isCleaningUp ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Cleanup
          </Button>
          
          <Button
            onClick={syncWithCalendly}
            disabled={isSyncing || isAutoSyncing}
            className="flex items-center gap-2"
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Manual Scan
          </Button>
        </div>
      </div>

      {/* Auto-sync Status Alert */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 text-sm">
                <strong>Auto-sync Active:</strong> New interviews appear automatically. Manual scan fetches only future events.
              </p>
            </div>
            {isAutoSyncing && (
              <div className="flex items-center gap-2 text-green-700">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Syncing...</span>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {/* Conditional View Based on viewType */}
      {viewType === 'calendar' ? (
        <CalendarView
          interviews={interviews.map(interview => ({
            id: interview.id,
            candidate_email: interview.candidate_email,
            scheduled_time: interview.scheduled_time,
            status: interview.status,
            first_name: interview.first_name,
            last_name: interview.last_name,
            applied_position: interview.applied_position,
            city_state: interview.city_state,
            job_location: interview.job_location,
            job_position: interview.job_position,
            meeting_url: interview.meeting_url,
            phone: interview.phone,
          }))}
          isLoading={isLoading}
          onUpdateStatus={updateInterviewStatus}
        />
      ) : (
        <>
          {/* Filters - only shown in table view */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by candidate name, email, or position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <div className="flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Interviews Table */}
          <InterviewsTable
            interviews={filteredInterviews}
            isLoading={isLoading}
            onUpdateStatus={updateInterviewStatus}
          />
        </>
      )}
    </div>
  );
};

export default Interviews;
