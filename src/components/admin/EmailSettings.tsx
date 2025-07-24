
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEmailSettings } from '@/hooks/useEmailSettings';
import { Mail, Send, Settings, CheckCircle, AlertCircle, Plus, X, Save, RefreshCw } from 'lucide-react';

const EmailSettings: React.FC = () => {
  const { settings, saveSettings, loadSettings } = useEmailSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [lastTestResult, setLastTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Update local settings when database settings change
  useEffect(() => {
    console.log('Database settings updated, syncing to local state:', settings);
    setLocalSettings(settings);
  }, [settings]);

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

  const addStaffEmail = () => {
    if (!newStaffEmail || !newStaffEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (localSettings.staffEmails.includes(newStaffEmail)) {
      toast({
        title: "Email Already Added",
        description: "This email is already in the staff list",
        variant: "destructive",
      });
      return;
    }

    setLocalSettings(prev => ({
      ...prev,
      staffEmails: [...prev.staffEmails, newStaffEmail]
    }));
    setNewStaffEmail('');
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

  const removeStaffEmail = (emailToRemove: string) => {
    setLocalSettings(prev => ({
      ...prev,
      staffEmails: prev.staffEmails.filter(email => email !== emailToRemove)
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      console.log('Saving settings to database:', localSettings);
      const success = await saveSettings(localSettings);
      if (success) {
        toast({
          title: "Settings Saved",
          description: "Email settings have been saved successfully",
        });
        console.log('Settings saved successfully, database should be updated');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshSettings = async () => {
    setIsRefreshing(true);
    try {
      console.log('Refreshing settings from database...');
      await loadSettings();
      toast({
        title: "Settings Refreshed",
        description: "Email settings have been reloaded from database",
      });
    } catch (error) {
      console.error('Error refreshing settings:', error);
      toast({
        title: "Error",
        description: "Failed to refresh settings",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
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
        <p className="text-gray-600">Configure email notification preferences and delivery settings</p>
      </div>

      {/* Email Notification Settings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Email Notification Settings</h3>
            <p className="text-sm text-gray-600">Configure email notification preferences</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefreshSettings} disabled={isRefreshing} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Sync Status Indicator */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {JSON.stringify(localSettings) === JSON.stringify(settings) ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm font-medium">
                {JSON.stringify(localSettings) === JSON.stringify(settings) 
                  ? "Settings are in sync with database" 
                  : "Settings have unsaved changes"}
              </span>
            </div>
          </div>

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
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">Enable Staff Notifications</h4>
                  <p className="text-sm text-blue-700">Send notifications to staff members</p>
                </div>
                <Switch
                  checked={localSettings.enableStaffNotifications}
                  onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, enableStaffNotifications: checked }))}
                />
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{email}</span>
                    {settings.adminEmails.includes(email) ? (
                      <CheckCircle className="w-3 h-3 text-green-500" title="Synced with database" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-yellow-500" title="Not synced with database" />
                    )}
                  </div>
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

          {/* Staff Email Configuration */}
          <div>
            <Label>Staff Email Addresses</Label>
            <p className="text-sm text-gray-500 mb-3">
              These emails will receive staff-level notifications about new applications
            </p>
            
            {/* Current Staff Emails */}
            <div className="space-y-2 mb-3">
              {localSettings.staffEmails.map((email, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{email}</span>
                    {settings.staffEmails.includes(email) ? (
                      <CheckCircle className="w-3 h-3 text-green-500" title="Synced with database" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-yellow-500" title="Not synced with database" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStaffEmail(email)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add New Staff Email */}
            <div className="flex space-x-2">
              <Input
                type="email"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                placeholder="staff@viaquesthospice.com"
                onKeyPress={(e) => e.key === 'Enter' && addStaffEmail()}
              />
              <Button onClick={addStaffEmail} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
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
