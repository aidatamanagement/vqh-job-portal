
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send, Settings, AlertCircle, CheckCircle } from 'lucide-react';

const EmailSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    adminEmail: 'admin@hospicecare.com',
    enableNotifications: true,
    enableAutoResponses: true,
    testEmail: ''
  });
  const [isTesting, setIsTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestEmail = async () => {
    if (!settings.testEmail) {
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
          recipientEmail: settings.testEmail,
          variables: {
            firstName: 'Test',
            lastName: 'User',
            position: 'Registered Nurse',
            location: 'Test Location',
            email: settings.testEmail,
            phone: '(555) 123-4567',
            earliestStartDate: 'January 15, 2024',
            applicationDate: new Date().toLocaleDateString()
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
        <h2 className="text-2xl font-bold text-gray-900">Email Settings</h2>
        <p className="text-gray-600">Configure email automation and delivery settings</p>
      </div>

      {/* Email Configuration */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Email Configuration</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="admin-email">Admin Email Address</Label>
            <Input
              id="admin-email"
              type="email"
              value={settings.adminEmail}
              onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
              placeholder="admin@hospicecare.com"
            />
            <p className="text-sm text-gray-500 mt-1">
              This email will receive notifications about new applications
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Admin Notifications</Label>
              <p className="text-sm text-gray-500">
                Send email alerts when new applications are submitted
              </p>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
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
              checked={settings.enableAutoResponses}
              onCheckedChange={(checked) => setSettings({ ...settings, enableAutoResponses: checked })}
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
              value={settings.testEmail}
              onChange={(e) => setSettings({ ...settings, testEmail: e.target.value })}
              placeholder="test@example.com"
            />
            <p className="text-sm text-gray-500 mt-1">
              Send a test email to verify your email configuration is working
            </p>
          </div>

          <Button 
            onClick={handleTestEmail} 
            disabled={isTesting || !settings.testEmail}
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

      {/* Email Templates Status */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Mail className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Email Templates Status</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Application Submitted</span>
            <Badge variant="default">Active</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Application Approved</span>
            <Badge variant="default">Active</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Application Rejected</span>
            <Badge variant="default">Active</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Admin Notification</span>
            <Badge variant="default">Active</Badge>
          </div>
        </div>
      </Card>

      {/* API Configuration Notice */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Brevo API Configuration</h4>
            <p className="text-sm text-blue-800 mb-3">
              To enable email delivery, make sure your Brevo API key is configured in the Supabase Edge Function secrets.
            </p>
            <div className="space-y-1 text-sm text-blue-700">
              <p>• Get your API key from <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noopener noreferrer" className="underline">Brevo Dashboard</a></p>
              <p>• Add it as BREVO_API_KEY in Supabase Edge Function secrets</p>
              <p>• Verify your sending domain in Brevo</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmailSettings;
