
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { JobApplication } from '@/types';
import { formatDate, getStatusBadgeVariant, getStatusText } from '../../utils/submissionsUtils';

interface ApplicationInformationProps {
  application: JobApplication;
}

const ApplicationInformation: React.FC<ApplicationInformationProps> = ({ application }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Application Details</h3>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-gray-700">Applied Position:</span>
          <span className="ml-2">{application.appliedPosition}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Applied Date:</span>
          <span className="ml-2">{formatDate(application.createdAt)}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Current Status:</span>
          <Badge 
            variant={getStatusBadgeVariant(application.status)}
            className="ml-2 text-xs font-medium px-3 py-1"
          >
            {getStatusText(application.status)}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ApplicationInformation;
