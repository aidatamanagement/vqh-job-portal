
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Settings } from 'lucide-react';

export const CalendlyConfigAlert: React.FC = () => {
  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <p className="font-medium text-yellow-800">Calendly Not Configured</p>
            <p className="text-yellow-700 text-sm">
              To manage interviews, you need to configure your Calendly integration first.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-yellow-800">Setup Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
              <li>Go to Settings → Calendly tab</li>
              <li>Enter your Calendly Organization URI</li>
              <li>Save settings and test the connection</li>
              <li>Select a default event type for interviews</li>
            </ol>
          </div>
          
          <Button 
            onClick={() => window.location.href = '/admin?tab=settings'}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure Calendly
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
