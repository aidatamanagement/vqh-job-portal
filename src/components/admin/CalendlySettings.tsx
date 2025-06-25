
import React, { useState, useEffect } from 'react';
import { Calendar, Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

const CalendlySettings: React.FC = () => {
  const [settings, setSettings] = useState({
    api_token: '',
    organization_uri: '',
    default_event_type_uri: '',
    webhook_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('calendly_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching Calendly settings:', error);
        return;
      }

      if (data) {
        setSettings({
          api_token: data.api_token || '',
          organization_uri: data.organization_uri || '',
          default_event_type_uri: data.default_event_type_uri || '',
          webhook_url: data.webhook_url || '',
        });
      }
    } catch (error) {
      console.error('Error fetching Calendly settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings.api_token || !settings.organization_uri) {
      toast({
        title: "Validation Error",
        description: "API Token and Organization URI are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Generate webhook URL
      const webhookUrl = `${window.location.origin}/functions/v1/calendly-webhook`;
      const updatedSettings = { ...settings, webhook_url: webhookUrl };

      const { error } = await supabase
        .from('calendly_settings')
        .upsert(updatedSettings);

      if (error) {
        throw error;
      }

      setSettings(updatedSettings);
      
      toast({
        title: "Success",
        description: "Calendly settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving Calendly settings:', error);
      toast({
        title: "Error",
        description: "Failed to save Calendly settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Calendly Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="spinner" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Calendly Integration</span>
        </CardTitle>
        <CardDescription>
          Configure Calendly API settings for interview scheduling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You'll need a Calendly Premium account and API access to use this feature.
            Get your API token from your Calendly integrations page.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="api_token">API Token *</Label>
            <Input
              id="api_token"
              type="password"
              value={settings.api_token}
              onChange={(e) => setSettings({ ...settings, api_token: e.target.value })}
              placeholder="Enter your Calendly API token"
            />
          </div>

          <div>
            <Label htmlFor="organization_uri">Organization URI *</Label>
            <Input
              id="organization_uri"
              value={settings.organization_uri}
              onChange={(e) => setSettings({ ...settings, organization_uri: e.target.value })}
              placeholder="https://api.calendly.com/organizations/YOUR_ORG_ID"
            />
          </div>

          <div>
            <Label htmlFor="default_event_type_uri">Default Event Type URI</Label>
            <Input
              id="default_event_type_uri"
              value={settings.default_event_type_uri}
              onChange={(e) => setSettings({ ...settings, default_event_type_uri: e.target.value })}
              placeholder="https://calendly.com/your-username/interview"
            />
            <p className="text-sm text-gray-500 mt-1">
              This link will be included in shortlisted candidate emails
            </p>
          </div>

          <div>
            <Label htmlFor="webhook_url">Webhook URL (Auto-generated)</Label>
            <Input
              id="webhook_url"
              value={settings.webhook_url}
              readOnly
              className="bg-gray-50"
            />
            <p className="text-sm text-gray-500 mt-1">
              Add this URL to your Calendly webhook settings
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <div className="spinner mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CalendlySettings;
