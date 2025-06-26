
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { useInterviews } from './hooks/useInterviews';
import { InterviewCard } from './components/InterviewCard';
import { InterviewFilters } from './components/InterviewFilters';
import { AutoSyncStatus, HeaderSyncStatus } from './components/AutoSyncStatus';
import { CalendlyConfigAlert } from './components/CalendlyConfigAlert';

const Interviews: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const {
    interviews,
    isLoading,
    isCalendlyConfigured,
    isCheckingConfig,
    isSyncing,
    isAutoSyncing,
    lastAutoSync,
    syncWithCalendly,
  } = useInterviews();

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = 
      interview.candidate_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${interview.first_name} ${interview.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.applied_position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isCheckingConfig) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900" style={{ fontSize: '1.3rem' }}>Interviews</h1>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex justify-center items-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Checking Calendly configuration...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isCalendlyConfigured) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900" style={{ fontSize: '1.3rem' }}>Interviews</h1>
          </div>
        </div>

        <CalendlyConfigAlert />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900" style={{ fontSize: '1.3rem' }}>Interviews</h1>
            <HeaderSyncStatus isAutoSyncing={isAutoSyncing} lastAutoSync={lastAutoSync} />
          </div>
        </div>
        
        <Button
          onClick={syncWithCalendly}
          disabled={isSyncing || isAutoSyncing}
          className="flex items-center gap-2"
        >
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Manual Sync
        </Button>
      </div>

      {/* Auto-sync Status Alert */}
      <AutoSyncStatus isAutoSyncing={isAutoSyncing} lastAutoSync={lastAutoSync} />

      {/* Filters */}
      <InterviewFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Interviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex justify-center items-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Loading interviews...</span>
            </CardContent>
          </Card>
        ) : filteredInterviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Interviews Found</h3>
              <p className="text-gray-500 mb-4">
                {interviews.length === 0 
                  ? "No interviews have been scheduled yet." 
                  : "No interviews match your current filters."}
              </p>
              {interviews.length === 0 && (
                <div className="text-sm text-gray-400 space-y-2">
                  <p>Interviews are automatically created when candidates book through Calendly links or via the webhook.</p>
                  <p>Auto-sync is active and will detect new interviews automatically.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredInterviews.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))
        )}
      </div>
    </div>
  );
};

export default Interviews;
