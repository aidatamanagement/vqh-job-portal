
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Save, Mail, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useEmailAutomation } from '@/hooks/useEmailAutomation';
import { useEmailSettings } from '@/hooks/useEmailSettings';

const EmailStatusSettings: React.FC = () => {
  const { EMAIL_ENABLED_STATUSES, STATUS_TO_TEMPLATE_MAP } = useEmailAutomation();
  const { settings, saveSettings, isLoading } = useEmailSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  // Update local settings when database settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Updated status labels for new status flow
  const statusLabels = {
    'application_submitted': 'Application Submitted',
    'under_review': 'Under Review',
    'shortlisted': 'Shortlisted',
    'interviewed': 'Interviewed',
    'hired': 'Hired',
    'rejected': 'Rejected',
    'waiting_list': 'Waiting List',
  };

  // Updated status descriptions for new status flow
  const statusDescriptions = {
    'application_submitted': 'Confirmation email sent when application is first submitted',
    'under_review': 'Notification when application moves to review stage',
    'shortlisted': 'Congratulations email when candidate is shortlisted',
    'interviewed': 'Follow-up email after interview completion',
    'hired': 'Welcome email for successful candidates',
    'rejected': 'Professional rejection notification',
    'waiting_list': 'Notification when candidate is placed on waiting list',
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const success = await saveSettings(localSettings);
      if (success) {
        toast({
          title: "Settings Saved",
          description: "Email notification settings have been updated successfully.",
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast({
        title: "Error",
        description: "Failed to save email settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading email settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Email Notification Settings</h3>
          <p className="text-sm text-gray-600">Configure which application status changes trigger email notifications</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid gap-4">
        {/* Master switches */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Enable Email Notifications</h4>
                <p className="text-sm text-blue-700">Send status update emails to applicants</p>
              </div>
              <Switch
                checked={localSettings.enableNotifications}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, enableNotifications: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Enable Auto-Response Emails</h4>
                <p className="text-sm text-blue-700">Automatically send confirmation emails</p>
              </div>
              <Switch
                checked={localSettings.enableAutoResponses}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, enableAutoResponses: checked }))}
              />
            </div>
          </div>
        </Card>

        {Object.entries(statusLabels).map(([status, label]) => {
          const statusKey = status as keyof typeof EMAIL_ENABLED_STATUSES;
          const templateSlug = STATUS_TO_TEMPLATE_MAP[statusKey];
          const isEnabled = EMAIL_ENABLED_STATUSES[statusKey];
          
          return (
            <Card key={status} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <h4 className="font-medium text-gray-900">{label}</h4>
                    <Badge variant={isEnabled ? "default" : "secondary"}>
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    {templateSlug && (
                      <Badge variant="outline" className="text-xs">
                        Template: {templateSlug}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 ml-7">
                    {statusDescriptions[statusKey]}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Settings className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Email Template Management</h4>
            <p className="text-sm text-blue-700">
              All email templates can be customized in the Email Templates section. 
              Make sure templates exist for enabled statuses to ensure emails are sent successfully.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmailStatusSettings;
