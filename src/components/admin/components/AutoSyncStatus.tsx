
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, RefreshCw, Zap } from 'lucide-react';

interface AutoSyncStatusProps {
  isAutoSyncing: boolean;
  lastAutoSync: Date | null;
}

export const AutoSyncStatus: React.FC<AutoSyncStatusProps> = ({
  isAutoSyncing,
  lastAutoSync,
}) => {
  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-800 text-sm">
              <strong>Auto-sync Active:</strong> New interviews will appear automatically when booked via Calendly. 
              Background sync runs every 10 minutes to catch any missed events.
            </p>
          </div>
          {isAutoSyncing && (
            <div className="flex items-center gap-2 text-green-700">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Syncing...</span>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export const HeaderSyncStatus: React.FC<AutoSyncStatusProps> = ({
  isAutoSyncing,
  lastAutoSync,
}) => {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span>Auto-sync enabled with real-time updates</span>
      {isAutoSyncing && (
        <div className="flex items-center gap-1 text-blue-600">
          <Zap className="w-3 h-3" />
          <span>Auto-syncing...</span>
        </div>
      )}
      {lastAutoSync && (
        <span className="text-xs text-gray-500">
          Last sync: {lastAutoSync.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};
