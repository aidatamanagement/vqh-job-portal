
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  ExternalLink,
  User,
  Clock,
  Link as LinkIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCalendlyApi } from '@/hooks/useCalendlyApi';

interface CalendlySettingsData {
  id?: string;
  api_token: string;
  organization_uri: string;
  default_event_type_uri?: string;
  webhook_url?: string;
}

const CalendlySettings: React.FC = () => {
  const [settings, setSettings] = useState<CalendlySettingsData>({
    api_token: '',
    organization_uri: '',
    default_event_type_uri: '',
    webhook_url: '',
  });
  const [user, setUser] = useState<any>(null);
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const { toast } = useToast();
  const { testConnection, getUser, getEventTypes } = useCalendlyApi();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('calendly_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading Calendly settings:', error);
        toast({
          title: "Error",
          description: "Failed to load Calendly settings",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setSettings({
          id: data.id,
          api_token: data.api_token || '',
          organization_uri: data.organization_uri || '',
          default_event_type_uri: data.default_event_type_uri || '',
          webhook_url: data.webhook_url || '',
        });

        // Auto-test connection if settings exist
        if (data.api_token && data.organization_uri) {
          await testCalendlyConnection();
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const testCalendlyConnection = async () => {
    setIsTesting(true);
    setConnectionStatus('unknown');

    try {
      const userResult = await getUser();
      
      if (userResult.success && userResult.user) {
        setUser(userResult.user);
        setConnectionStatus('success');
        
        // Load event types
        if (settings.organization_uri || userResult.user.current_organization) {
          const orgUri = settings.organization_uri || userResult.user.current_organization;
          const eventTypesResult = await getEventTypes(orgUri);
          
          if (eventTypesResult.success) {
            setEventTypes(eventTypesResult.eventTypes || []);
          }
        }

        toast({
          title: "Connection Successful",
          description: "Successfully connected to Calendly API",
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Connection Failed",
          description: userResult.error || "Failed to connect to Calendly",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('Error testing connection:', error);
      toast({
        title: "Connection Error",
        description: "An unexpected error occurred while testing the connection",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);

    try {
      const settingsData = {
        api_token: settings.api_token,
        organization_uri: settings.organization_uri,
        default_event_type_uri: settings.default_event_type_uri,
        webhook_url: settings.webhook_url || `${window.location.origin}/functions/v1/calendly-webhook`,
      };

      let result;
      if (settings.id) {
        result = await supabase
          .from('calendly_settings')
          .update(settingsData)
          .eq('id', settings.id);
      } else {
        result = await supabase
          .from('calendly_settings')
          .insert(settingsData)
          .select()
          .single();
          
        if (result.data) {
          setSettings(prev => ({ ...prev, id: result.data.id }));
        }
      }

      if (result.error) {
        toast({
          title: "Error",
          description: "Failed to save Calendly settings",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Settings Saved",
        description: "Calendly settings have been saved successfully",
      });

      // Test connection after saving
      await testCalendlyConnection();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CalendlySettingsData, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (isLoadingSettings) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Loading Calendly settings...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendly Integration Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <LinkIcon className="h-4 w-4" />
            <AlertDescription>
              The Calendly API token is securely stored as a Supabase secret. Only enter your organization URI and configure settings below.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organizationUri">Organization URI *</Label>
              <Input
                id="organizationUri"
                value={settings.organization_uri}
                onChange={(e) => handleInputChange('organization_uri', e.target.value)}
                placeholder="https://api.calendly.com/organizations/AAAA..."
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Found in your Calendly account settings or from the API
              </p>
            </div>

            <div>
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={settings.webhook_url || `${window.location.origin}/functions/v1/calendly-webhook`}
                onChange={(e) => handleInputChange('webhook_url', e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Configure this URL in your Calendly webhook settings
              </p>
            </div>
          </div>

          {eventTypes.length > 0 && (
            <div>
              <Label htmlFor="defaultEventType">Default Event Type for Interviews</Label>
              <Select
                value={settings.default_event_type_uri}
                onValueChange={(value) => handleInputChange('default_event_type_uri', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((eventType) => (
                    <SelectItem key={eventType.uri} value={eventType.uri}>
                      <div className="flex items-center justify-between w-full">
                        <span>{eventType.name}</span>
                        <div className="flex items-center gap-2 ml-2">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{eventType.duration}min</span>
                          {eventType.active && <Badge variant="secondary" className="text-xs">Active</Badge>}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={saveSettings}
              disabled={isLoading || !settings.organization_uri}
              className="flex items-center gap-2"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Save Settings
            </Button>
            
            <Button
              onClick={testCalendlyConnection}
              variant="outline"
              disabled={isTesting || !settings.organization_uri}
              className="flex items-center gap-2"
            >
              {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Test Connection
            </Button>
          </div>

          {/* Connection Status */}
          {connectionStatus !== 'unknown' && (
            <Alert className={connectionStatus === 'success' ? 'border-green-200' : 'border-red-200'}>
              {connectionStatus === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {connectionStatus === 'success' ? (
                  <div>
                    <strong>Connection successful!</strong>
                    {user && (
                      <div className="mt-2 space-y-1">
                        <p className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          <span>{user.name} ({user.email})</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <ExternalLink className="w-3 h-3" />
                          <a 
                            href={user.scheduling_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View Scheduling Page
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <strong>Connection failed. Please check your settings and try again.</strong>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Event Types Display */}
          {eventTypes.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Available Event Types ({eventTypes.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {eventTypes.map((eventType) => (
                  <div 
                    key={eventType.uri} 
                    className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">{eventType.name}</h5>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span className="text-sm">{eventType.duration}min</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {eventType.active ? (
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">Inactive</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">{eventType.kind}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendlySettings;
