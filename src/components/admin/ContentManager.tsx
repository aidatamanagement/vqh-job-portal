
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout, Clock, Settings } from 'lucide-react';

const ContentManager: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Layout className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Manager</h1>
          <p className="text-gray-600">Manage your website content and resources</p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 text-lg">
            We are working on the Content Manager feature.
          </p>
          <p className="text-gray-500">
            This powerful tool will allow you to manage your website content, 
            create and edit pages, manage media files, and customize your site's 
            appearance. Stay tuned for updates!
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 pt-4">
            <Settings className="w-4 h-4" />
            <span>Feature in development</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentManager;
