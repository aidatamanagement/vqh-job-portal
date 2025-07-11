
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Settings } from 'lucide-react';
import EmailTemplates from './EmailTemplates';
import EmailSettings from './EmailSettings';

const EmailManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
          <p className="text-sm text-gray-600">Manage email templates and configuration settings</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings & Config</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <EmailTemplates />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <EmailSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailManagement;
