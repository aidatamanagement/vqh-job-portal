
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEmailSettings } from '@/hooks/useEmailSettings';
import { useEmailAutomation } from '@/hooks/useEmailAutomation';
import { Mail, Send, Settings, CheckCircle, AlertCircle, Plus, X, Save } from 'lucide-react';

const EmailSettings: React.FC = () => {
  const { settings, saveSettings } = useEmailSettings();
  const { EMAIL_ENABLED_STATUSES, STATUS_TO_TEMPLATE_MAP } = useEmailAutomation();
  const [localSettings, setLocalSettings] = useState(settings);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [lastTestResult, setLastTestResult] = useState<{ success: boolean; message: string } | null>(null);

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

  const addAdminEmail = () => {
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (localSettings.adminEmails.includes(newAdminEmail)) {
      toast({
        title: "Email Already Added",
        description: "This email is already in the admin list",
        variant: "destructive",
      });
      return;
    }

    setLocalSettings(prev => ({
      ...prev,
      adminEmails: [...prev.adminEmails, newAdminEmail]
    }));
    setNewAdminEmail('');
  };

  const removeAdminEmail = (emailToRemove: string) => {
    if (localSettings.adminEmails.length === 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one admin email is required",
        variant: "destructive",
      });
      return;
    }

    setLocalSettings(prev => ({
      ...prev,
      adminEmails: prev.adminEmails.filter(email => email !== emailToRemove)
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const success = await saveSettings(localSettings);
      if (success) {
        toast({
          title: "Settings Saved",
          description: "Email settings have been saved successfully",
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          templateSlug: 'application_submitted',
          recipientEmail: testEmail,
          variables: {
            firstName: 'Test',
            lastName: 'User',
            position: 'Registered Nurse',
            location: 'Test Location',
            email: testEmail,
            phone: '(555) 123-4567',
            earliestStartDate: 'January 15, 2024',
            applicationDate: new Date().toLocaleDateString(),
            trackingToken: 'TEST-123-456',
            trackingUrl: 'https://yourapp.com/track/TEST-123-456',
            adminUrl: window.location.origin + '/admin'
          }
        }
      });

      if (error) throw error;

      setLastTestResult({ success: true, message: 'Test email sent successfully!' });
      toast({
        title: "Success",
        description: "Test email sent successfully!",
      });
    } catch (error) {
      console.error('Test email failed:', error);
      setLastTestResult({ success: false, message: String(error) });
      toast({
        title: "Error",
        description: "Failed to send test email. Check your configuration.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Email Settings & Configuration</h2>
        <p className="text-gray-600">Configure email automation, delivery settings, and notification preferences</p>
      </div>

      {/* Email Notification Settings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Email Notification Settings</h3>
            <p className="text-sm text-gray-600">Configure which application status changes trigger email notifications</p>
          </div>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        <div className="space-y-6">
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

          {/* Status-specific email settings */}
          <div className="grid gap-4">
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
                  All email templates can be customized in the Templates section. 
                  Make sure templates exist for enabled statuses to ensure emails are sent successfully.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      {/* Email Configuration */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Email Configuration</h3>
        </div>

        <div className="space-y-6">
          <div>
            <Label>Admin Email Addresses</Label>
            <p className="text-sm text-gray-500 mb-3">
              These emails will receive notifications about new applications
            </p>
            
            {/* Current Admin Emails */}
            <div className="space-y-2 mb-3">
              {localSettings.adminEmails.map((email, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <span className="text-sm">{email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAdminEmail(email)}
                    className="text-red-600 hover:text-red-700"
                    disabled={localSettings.adminEmails.length === 1}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add New Admin Email */}
            <div className="flex space-x-2">
              <Input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin@viaquesthospice.com"
                onKeyPress={(e) => e.key === 'Enter' && addAdminEmail()}
              />
              <Button onClick={addAdminEmail} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Admin Notifications</Label>
              <p className="text-sm text-gray-500">
                Send email alerts when new applications are submitted
              </p>
            </div>
            <Switch
              checked={localSettings.enableNotifications}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, enableNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Auto-Response Emails</Label>
              <p className="text-sm text-gray-500">
                Automatically send confirmation emails to applicants
              </p>
            </div>
            <Switch
              checked={localSettings.enableAutoResponses}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, enableAutoResponses: checked })}
            />
          </div>
        </div>
      </Card>

      {/* Email Testing */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Send className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Test Email Delivery</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="test-email">Test Email Address</Label>
            <Input
              id="test-email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
            />
            <p className="text-sm text-gray-500 mt-1">
              Send a test email to verify your email configuration is working
            </p>
          </div>

          <Button 
            onClick={handleTestEmail} 
            disabled={isTesting || !testEmail}
            className="w-full sm:w-auto"
          >
            {isTesting ? (
              <>
                <div className="spinner mr-2" />
                Sending Test Email...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Test Email
              </>
            )}
          </Button>

          {lastTestResult && (
            <div className={`p-4 rounded-lg border ${
              lastTestResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {lastTestResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  lastTestResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {lastTestResult.success ? 'Test Successful' : 'Test Failed'}
                </span>
              </div>
              <p className={`text-sm ${
                lastTestResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {lastTestResult.message}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EmailSettings;
