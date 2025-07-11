
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getValidNextStatuses } from './utils/submissionsUtils';

interface StatusTransitionValidatorProps {
  currentStatus: string;
  newStatus: string;
  isValid: boolean;
}

const StatusTransitionValidator: React.FC<StatusTransitionValidatorProps> = ({
  currentStatus,
  newStatus,
  isValid
}) => {
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'application_submitted':
        return 'Application Submitted';
      case 'under_review':
        return 'Under Review';
      case 'shortlisted':
        return 'Shortlisted';
      case 'interviewed':
        return 'Interviewed';
      case 'hired':
        return 'Hired';
      case 'rejected':
        return 'Rejected';
      case 'waiting_list':
        return 'Waiting List';
      default:
        return status;
    }
  };



  if (currentStatus === newStatus) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="w-4 h-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          No status change detected. Current status is already{' '}
          <Badge variant="outline">{getStatusDisplay(currentStatus)}</Badge>
        </AlertDescription>
      </Alert>
    );
  }

  const validTransitions = getValidNextStatuses(currentStatus);

  if (isValid) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Valid transition from{' '}
          <Badge variant="outline">{getStatusDisplay(currentStatus)}</Badge>
          {' '}to{' '}
          <Badge variant="outline">{getStatusDisplay(newStatus)}</Badge>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-red-200 bg-red-50">
      <XCircle className="w-4 h-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="space-y-2">
          <p>
            Invalid transition from{' '}
            <Badge variant="outline">{getStatusDisplay(currentStatus)}</Badge>
            {' '}to{' '}
            <Badge variant="outline">{getStatusDisplay(newStatus)}</Badge>
          </p>
          <p className="text-sm">
            Valid transitions from <strong>{getStatusDisplay(currentStatus)}</strong>:{' '}
            {validTransitions.length > 0 ? (
              validTransitions.map((transition, index) => (
                <span key={transition}>
                  <Badge variant="secondary" className="text-xs">
                    {getStatusDisplay(transition)}
                  </Badge>
                  {index < validTransitions.length - 1 && ', '}
                </span>
              ))
            ) : (
              <span className="text-gray-600">No further transitions allowed</span>
            )}
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default StatusTransitionValidator;
