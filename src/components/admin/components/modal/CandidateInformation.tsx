
import React from 'react';
import { JobApplication } from '@/types';
import { formatDate } from '../../utils/submissionsUtils';

interface CandidateInformationProps {
  application: JobApplication;
}

const CandidateInformation: React.FC<CandidateInformationProps> = ({ application }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Candidate Information</h3>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-gray-700">Name:</span>
          <span className="ml-2">{application.firstName} {application.lastName}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Email:</span>
          <span className="ml-2 break-all">{application.email}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Phone:</span>
          <span className="ml-2">{application.phone}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Location:</span>
          <span className="ml-2">{application.cityState}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Earliest Start Date:</span>
          <span className="ml-2">{application.earliestStartDate ? formatDate(application.earliestStartDate) : 'Not specified'}</span>
        </div>
      </div>
    </div>
  );
};

export default CandidateInformation;
