import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock, User } from 'lucide-react';
import { useStatusHistoryQuery } from '@/hooks/useStatusHistoryQuery';

interface StatusHistoryEntry {
  id: string;
  application_id: string;
  previous_status: string;
  new_status: string;
  notes: string;
  changed_by: string | null;
  changed_at: string;
  transition_valid: boolean;
  // Add profile fields for the user who made the change
  changed_by_name?: string | null;
  changed_by_email?: string | null;
}

interface StatusHistoryTimelineProps {
  applicationId: string;
}

const StatusHistoryTimeline: React.FC<StatusHistoryTimelineProps> = ({ applicationId }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Use TanStack Query for automatic background updates
  const { history, isLoading: loading, error } = useStatusHistoryQuery(applicationId);

  const handleExpandToggle = () => {
    console.log('Expand toggle clicked, current expanded state:', expanded);
    setExpanded(!expanded);
    console.log('New expanded state will be:', !expanded);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'hired':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'shortlisted_for_hr':
      case 'shortlisted_for_manager':
        return 'secondary';
      case 'hr_interviewed':
      case 'manager_interviewed':
        return 'outline';
      case 'waiting_list':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusDisplayName = (status: string) => {
    const statusMap: Record<string, string> = {
      'application_submitted': 'Application Submitted',
      'shortlisted_for_hr': 'Shortlisted for HR Round',
      'hr_interviewed': 'HR Interviewed',
      'shortlisted_for_manager': 'Shortlisted for Manager Interview',
      'manager_interviewed': 'Manager Interviewed',
      'hired': 'Hired',
      'rejected': 'Rejected',
      'waiting_list': 'Waiting List'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">Loading status history...</div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">No status history available</div>
        </CardContent>
      </Card>
    );
  }

  const displayedHistory = expanded ? history : history.slice(0, 1); // Show only 1 item when collapsed
  
  console.log('Current state - expanded:', expanded, 'history length:', history.length, 'displayed:', displayedHistory.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle 
          className="text-lg flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded transition-colors select-none"
          onClick={handleExpandToggle}
        >
          <span>Status History [{history.length}]</span>
          <div className="flex items-center gap-2">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedHistory.map((entry, index) => (
            <div key={entry.id} className="border-l-2 border-primary/20 pl-4 pb-4 relative">
              {/* Timeline dot */}
              <div className="absolute -left-2 top-2 w-3 h-3 bg-primary rounded-full border-2 border-white shadow-sm"></div>
              
              <div className="space-y-2">
                {/* Status change */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getStatusBadgeVariant(entry.previous_status)} className="text-xs">
                    {getStatusDisplayName(entry.previous_status)}
                  </Badge>
                  <span className="text-gray-400">→</span>
                  <Badge variant={getStatusBadgeVariant(entry.new_status)} className="text-xs">
                    {getStatusDisplayName(entry.new_status)}
                  </Badge>
                </div>

                {/* Notes */}
                <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry.notes}</p>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(entry.changed_at)}</span>
                  </div>
                  {entry.changed_by && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Updated by: {entry.changed_by_name || entry.changed_by_email || entry.changed_by}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Show a message when collapsed and there are more items */}
          {!expanded && history.length > 1 && (
            <div className="text-center py-2 text-gray-500 text-sm">
              ... and {history.length - 1} more entries
            </div>
          )}
        </div>

        {history.length > 1 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExpandToggle}
              className="flex items-center gap-2"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show {history.length - 1} More
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusHistoryTimeline; 