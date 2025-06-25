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
  Link as LinkIcon,
  AlertTriangle,
  Info
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
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');

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
        } else {
          setShowSetupGuide(true);
        }
      } else {
        setShowSetupGuide(true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const testCalendlyConnection = async () => {
    console.log("Starting Calendly connection test...");
    setIsTesting(true);
    setConnectionStatus('unknown');
    setErrorDetails('');

    try {
      console.log("Calling testConnection...");
      const userResult = await testConnection();
      console.log("Test connection result:", userResult);
      
      if (userResult.success && userResult.user) {
        setUser(userResult.user);
        setConnectionStatus('success');
        setShowSetupGuide(false);
        setErrorDetails('');
        
        // Auto-populate organization URI if not set
        if (!settings.organization_uri && userResult.user.current_organization) {
          console.log("Auto-populating organization URI:", userResult.user.current_organization);
          setSettings(prev => ({
            ...prev,
            organization_uri: userResult.user.current_organization
          }));
        }
        
        // Load event types
        const orgUri = settings.organization_uri || userResult.user.current_organization;
        if (orgUri) {
          console.log("Loading event types for organization:", orgUri);
          const eventTypesResult = await getEventTypes(orgUri);
          console.log("Event types result:", eventTypesResult);
          
          if (eventTypesResult.success) {
            setEventTypes(eventTypesResult.eventTypes || []);
          } else {
            console.warn("Failed to load event types:", eventTypesResult.error);
          }
        }

        toast({
          title: "Connection Successful",
          description: "Successfully connected to Calendly API",
        });
      } else {
        console.error("Connection failed:", userResult.error);
        setConnectionStatus('error');
        setShowSetupGuide(true);
        setErrorDetails(userResult.error || 'Unknown connection error');
        
        toast({
          title: "Connection Failed",
          description: userResult.error || "Failed to connect to Calendly",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in testCalendlyConnection:', error);
      setConnectionStatus('error');
      setShowSetupGuide(true);
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrorDetails(errorMsg);
      
      toast({
        title: "Connection Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const autoDetectOrganization = async () => {
    console.log("Starting auto-detect organization...");
    setIsLoading(true);
    setErrorDetails('');
    
    try {
      console.log("Calling getUser for auto-detect...");
      const userResult = await getUser();
      console.log("Auto-detect user result:", userResult);
      
      if (userResult.success && userResult.user?.current_organization) {
        console.log("Organization detected:", userResult.user.current_organization);
        setSettings(prev => ({
          ...prev,
          organization_uri: userResult.user.current_organization
        }));
        
        toast({
          title: "Organization Detected",
          description: "Organization URI has been automatically detected",
        });
      } else {
        console.warn("Auto-detect failed:", userResult.error);
        setErrorDetails(userResult.error || 'Could not auto-detect organization URI');
        
        toast({
          title: "Detection Failed",
          description: userResult.error || "Could not auto-detect organization URI. Please enter it manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in autoDetectOrganization:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to detect organization URI';
      setErrorDetails(errorMsg);
      
      toast({
        title: "Detection Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          {/* Setup Guide Alert */}
          {showSetupGuide && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-blue-800">Quick Setup Guide:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                    <li>Your Calendly API token has been configured ✓</li>
                    <li>Click "Auto-Detect Organization" or manually enter your Organization URI</li>
                    <li>Save settings and test the connection</li>
                    <li>Select a default event type for interviews</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Details */}
          {errorDetails && connectionStatus === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-red-800">Connection Error Details:</p>
                  <p className="text-sm text-red-700">{errorDetails}</p>
                  <div className="text-xs text-red-600 mt-2">
                    <p>Troubleshooting steps:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Check if your Calendly API token is valid</li>
                      <li>Verify the token has the required permissions</li>
                      <li>Ensure your Calendly account is active</li>
                      <li>Check the browser console for more details</li>
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <LinkIcon className="h-4 w-4" />
            <AlertDescription>
              The Calendly API token is securely stored as a Supabase secret. Configure your organization settings below.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organizationUri">Organization URI *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="organizationUri"
                  value={settings.organization_uri}
                  onChange={(e) => handleInputChange('organization_uri', e.target.value)}
                  placeholder="https://api.calendly.com/organizations/AAAA..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={autoDetectOrganization}
                  variant="outline"
                  disabled={isLoading}
                  className="whitespace-nowrap"
                >
                  Auto-Detect
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Found in your Calendly account settings or detected automatically
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
