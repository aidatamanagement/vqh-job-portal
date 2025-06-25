
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'hired':
        return 'default' as const;
      case 'rejected':
        return 'destructive' as const;
      case 'shortlisted':
      case 'interview_scheduled':
        return 'default' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'application_submitted':
        return 'Application Submitted';
      case 'under_review':
        return 'Under Review';
      case 'shortlisted':
        return 'Shortlisted';
      case 'interview_scheduled':
        return 'Interview Scheduled';
      case 'decisioning':
        return 'Final Decision';
      case 'hired':
        return 'Hired';
      case 'rejected':
        return 'Not Selected';
      default:
        return status;
    }
  };

  return (
    <Badge variant={getStatusBadgeVariant(status)} className="text-sm px-3 py-1">
      {getStatusText(status)}
    </Badge>
  );
};

export default StatusBadge;
