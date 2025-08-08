
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout, BarChart3 } from 'lucide-react';

const ContentManager: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Layout className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Content Manager</h1>
          <p className="text-gray-600">Social media analytics and content management</p>
        </div>
      </div>

      {/* Coming Soon Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>Coming Soon</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Social Media Analytics</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We're working on integrating comprehensive social media analytics and content management features. 
              This will include platform performance tracking, engagement metrics, and content scheduling tools.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
              <h4 className="font-medium mb-2">Planned Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Multi-platform social media analytics</li>
                <li>• Engagement and reach tracking</li>
                <li>• Content performance insights</li>
                <li>• Automated reporting</li>
                <li>• Content scheduling tools</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentManager;
