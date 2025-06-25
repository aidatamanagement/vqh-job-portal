
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ExternalLink, RefreshCw, Settings, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
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
}

interface Application {
  id: string;
  first_name: string;
  last_name: string;
  applied_position: string;
  email: string;
}

const Interviews: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Record<string, Application>>({});
  const [calendlyEvents, setCalendlyEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingCalendly, setSyncingCalendly] = useState(false);
  const [calendlyConnected, setCalendlyConnected] = useState(false);
  const { toast } = useToast();
  const { getEvents, testConnection } = useCalendlyApi();

  const fetchInterviews = async () => {
    try {
      const { data: interviewsData, error: interviewsError } = await supabase
        .from('interviews')
        .select('*')
        .order('scheduled_time', { ascending: true });

      if (interviewsError) {
        console.error('Error fetching interviews:', interviewsError);
        toast({
          title: "Error",
          description: "Failed to fetch interviews",
          variant: "destructive",
        });
        return;
      }

      const applicationIds = interviewsData?.map(i => i.application_id).filter(Boolean) || [];
      
      if (applicationIds.length > 0) {
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('job_applications')
          .select('id, first_name, last_name, applied_position, email')
          .in('id', applicationIds);

        if (!applicationsError && applicationsData) {
          const applicationsMap = applicationsData.reduce((acc, app) => {
            acc[app.id] = app;
            return acc;
          }, {} as Record<string, Application>);
          setApplications(applicationsMap);
        }
      }

      setInterviews(interviewsData || []);
    } catch (error) {
      console.error('Error in fetchInterviews:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCalendlyConnection = async () => {
    try {
      const result = await testConnection();
      setCalendlyConnected(result.success);
      return result.success;
    } catch (error) {
      console.error('Error checking Calendly connection:', error);
      setCalendlyConnected(false);
      return false;
    }
  };

  const syncWithCalendly = async () => {
    setSyncingCalendly(true);
    
    try {
      // First check if Calendly is connected
      const isConnected = await checkCalendlyConnection();
      if (!isConnected) {
        toast({
          title: "Calendly Not Connected",
          description: "Please configure Calendly integration in Settings first",
          variant: "destructive",
        });
        return;
      }

      // Get Calendly settings to fetch organization URI
      const { data: settings, error: settingsError } = await supabase
        .from('calendly_settings')
        .select('organization_uri')
        .limit(1)
        .single();

      if (settingsError || !settings?.organization_uri) {
        toast({
          title: "Configuration Missing",
          description: "Calendly organization URI not configured",
          variant: "destructive",
        });
        return;
      }

      // Fetch events from Calendly
      const eventsResult = await getEvents(settings.organization_uri);
      
      if (eventsResult.success && eventsResult.events) {
        setCalendlyEvents(eventsResult.events);
        toast({
          title: "Sync Successful",
          description: `Synced ${eventsResult.events.length} events from Calendly`,
        });
      } else {
        toast({
          title: "Sync Failed",
          description: eventsResult.error || "Failed to sync with Calendly",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error syncing with Calendly:', error);
      toast({
        title: "Sync Error",
        description: "An unexpected error occurred while syncing",
        variant: "destructive",
      });
    } finally {
      setSyncingCalendly(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
    checkCalendlyConnection();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy - h:mm a');
  };

  // Find matching Calendly event for an interview
  const getCalendlyEventForInterview = (interview: Interview) => {
    return calendlyEvents.find(event => 
      event.uri === interview.calendly_event_uri || 
      event.uuid === interview.calendly_event_id
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interviews</h1>
            <p className="text-gray-600 mt-2">Manage scheduled interviews and meetings</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="spinner" />
          <span className="ml-2">Loading interviews...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interviews</h1>
          <p className="text-gray-600 mt-2">Manage scheduled interviews and meetings</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Calendly Connection Status */}
          <div className="flex items-center gap-2">
            {calendlyConnected ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Calendly Connected</span>
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-600">Calendly Not Configured</span>
              </>
            )}
          </div>

          {calendlyConnected && (
            <Button 
              onClick={syncWithCalendly} 
              variant="outline" 
              disabled={syncingCalendly}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncingCalendly ? 'animate-spin' : ''}`} />
              {syncingCalendly ? 'Syncing...' : 'Sync Calendly'}
            </Button>
          )}

          <Button onClick={fetchInterviews} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Calendly Events Summary */}
      {calendlyConnected && calendlyEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendly Events ({calendlyEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Last synced: {new Date().toLocaleString()} • {calendlyEvents.length} events found
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {interviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Interviews Scheduled</h3>
              <p className="text-gray-600 text-center">
                No interviews have been scheduled yet. When candidates book interviews through Calendly, they will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          interviews.map((interview) => {
            const application = applications[interview.application_id];
            const calendlyEvent = getCalendlyEventForInterview(interview);
            
            return (
              <Card key={interview.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {application ? `${application.first_name} ${application.last_name}` : 'Unknown Candidate'}
                        </CardTitle>
                        <p className="text-gray-600">
                          {application ? application.applied_position : 'Position unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(interview.status)}>
                        {interview.status}
                      </Badge>
                      {calendlyEvent && (
                        <Badge variant="outline" className="text-xs">
                          Calendly Synced
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDateTime(interview.scheduled_time)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{interview.candidate_email}</span>
                    </div>
                    
                    {interview.interviewer_email && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Interviewer: {interview.interviewer_email}</span>
                      </div>
                    )}

                    {calendlyEvent && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Duration: {calendlyEvent.event_type?.duration || 'N/A'} min</span>
                      </div>
                    )}
                  </div>

                  {/* Additional Calendly Event Information */}
                  {calendlyEvent && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Calendly Event Details</h4>
                      <div className="space-y-1 text-sm text-blue-800">
                        <p><strong>Event:</strong> {calendlyEvent.name}</p>
                        <p><strong>Status:</strong> {calendlyEvent.status}</p>
                        {calendlyEvent.location && (
                          <p><strong>Location:</strong> {calendlyEvent.location.type}</p>
                        )}
                        {calendlyEvent.invitees_counter && (
                          <p><strong>Attendees:</strong> {calendlyEvent.invitees_counter.active}/{calendlyEvent.invitees_counter.total}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {(interview.meeting_url || calendlyEvent?.location?.join_url) && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(interview.meeting_url || calendlyEvent?.location?.join_url, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Join Meeting
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Interviews;
