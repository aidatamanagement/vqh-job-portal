import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Settings,
  Plus,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCalendlyApi } from '@/hooks/useCalendlyApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const Interviews: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCalendlyConfigured, setIsCalendlyConfigured] = useState(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [lastAutoSync, setLastAutoSync] = useState<Date | null>(null);
  const { toast } = useToast();
  const { getEvents, getInvitees } = useCalendlyApi();

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'no_show':
        return 'outline';
      default:
        return 'outline';
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

  if (isCheckingConfig) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900" style={{ fontSize: '1.3rem' }}>Interviews</h1>
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
            <h1 className="font-bold text-gray-900" style={{ fontSize: '1.3rem' }}>Interviews</h1>
          </div>
        </div>

        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-yellow-800">Calendly Not Configured</p>
                <p className="text-yellow-700 text-sm">
                  To manage interviews, you need to configure your Calendly integration first.
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
            <h1 className="font-bold text-gray-900" style={{ fontSize: '1.3rem' }}>Interviews</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Auto-sync enabled with real-time updates</span>
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
          Manual Sync
        </Button>
      </div>

      {/* Auto-sync Status Alert */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 text-sm">
                <strong>Auto-sync Active:</strong> New interviews will appear automatically when booked via Calendly. 
                Background sync runs every 10 minutes to catch any missed events.
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

      {/* Filters */}
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

      {/* Interviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex justify-center items-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Loading interviews...</span>
            </CardContent>
          </Card>
        ) : filteredInterviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Interviews Found</h3>
              <p className="text-gray-500 mb-4">
                {interviews.length === 0 
                  ? "No interviews have been scheduled yet." 
                  : "No interviews match your current filters."}
              </p>
              {interviews.length === 0 && (
                <div className="text-sm text-gray-400 space-y-2">
                  <p>Interviews are automatically created when candidates book through Calendly links or via the webhook.</p>
                  <p>Auto-sync is active and will detect new interviews automatically.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredInterviews.map((interview) => (
            <Card key={interview.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Candidate Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {interview.first_name} {interview.last_name}
                        </h3>
                        <p className="text-gray-600">{interview.applied_position}</p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(interview.status)}>
                        {interview.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{interview.candidate_email}</span>
                      </div>
                      
                      {interview.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{interview.phone}</span>
                        </div>
                      )}
                      
                      {interview.city_state && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{interview.city_state}</span>
                        </div>
                      )}
                      
                      {interview.interviewer_email && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>Interviewer: {interview.interviewer_email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Interview Details */}
                  <div className="lg:w-80 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>
                        {new Date(interview.scheduled_time).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>
                        {new Date(interview.scheduled_time).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      {interview.meeting_url && (
                        <Button
                          onClick={() => window.open(interview.meeting_url, '_blank')}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Join Meeting
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => window.open(interview.calendly_event_uri, '_blank')}
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Calendar className="w-3 h-3" />
                        View in Calendly
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <p>Scheduled: {new Date(interview.created_at).toLocaleDateString()}</p>
                      <p>Event ID: {interview.calendly_event_id}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Interviews;
