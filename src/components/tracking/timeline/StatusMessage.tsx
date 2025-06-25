
import React from 'react';
import { Clock, Users, CheckCircle, XCircle } from 'lucide-react';

interface StatusMessageProps {
  status: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ status }) => {
  if (status === 'application_submitted' || status === 'under_review') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <p className="text-blue-800 font-medium">Application Under Review</p>
        </div>
        <p className="text-blue-700 text-sm mt-1">
          Your application is currently being reviewed by our team. We'll update the status as soon as possible.
        </p>
      </div>
    );
  }

  if (status === 'shortlisted' || status === 'interview_scheduled' || status === 'decisioning') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <p className="text-blue-800 font-medium">Application in Progress</p>
        </div>
        <p className="text-blue-700 text-sm mt-1">
          Great news! Your application is progressing through our selection process. We'll keep you updated on next steps.
        </p>
      </div>
    );
  }

  if (status === 'hired') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-green-800 font-medium">Congratulations!</p>
        </div>
        <p className="text-green-700 text-sm mt-1">
          You have been hired! We'll contact you soon with next steps and onboarding information.
        </p>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-600" />
          <p className="text-red-800 font-medium">Application Not Selected</p>
        </div>
        <p className="text-red-700 text-sm mt-1">
          Thank you for your interest. While we've decided not to move forward with your application at this time, we encourage you to apply for future opportunities.
        </p>
      </div>
    );
  }

  return null;
};

export default StatusMessage;
