
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmailTemplates from './EmailTemplates';
import EmailLogs from './EmailLogs';
import EmailSettings from './EmailSettings';

const EmailManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
        <p className="text-gray-600">Manage email templates, view logs, and configure settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
          <TabsTrigger value="settings">Email Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="mt-6">
          <EmailTemplates />
        </TabsContent>
        
        <TabsContent value="logs" className="mt-6">
          <EmailLogs />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <EmailSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailManagement;
