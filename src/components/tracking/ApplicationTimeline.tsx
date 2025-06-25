
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface ApplicationData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  applied_position: string;
  earliest_start_date: string;
  city_state: string;
  status: 'waiting' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  job_id: string;
}

interface ApplicationTimelineProps {
  application: ApplicationData;
}

const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ application }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default' as const;
      case 'rejected':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Not Selected';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {getStatusIcon(application.status)}
          Application Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Badge variant={getStatusBadgeVariant(application.status)} className="text-sm px-3 py-1">
              {getStatusText(application.status)}
            </Badge>
            <div className="text-sm text-gray-500">
              Last updated: {formatDate(application.updated_at)}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Application Submitted</p>
                <p className="text-sm text-gray-500">{formatDate(application.created_at)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                application.status !== 'waiting' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <CheckCircle className={`w-4 h-4 ${
                  application.status !== 'waiting' ? 'text-blue-600' : 'text-gray-400'
                }`} />
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${
                  application.status !== 'waiting' ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  Application Reviewed
                </p>
                <p className="text-sm text-gray-500">
                  {application.status !== 'waiting' 
                    ? formatDate(application.updated_at)
                    : 'Pending review'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                application.status === 'approved' ? 'bg-green-100' : 
                application.status === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                {application.status === 'approved' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : application.status === 'rejected' ? (
                  <XCircle className="w-4 h-4 text-red-600" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${
                  application.status !== 'waiting' ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  Final Decision
                </p>
                <p className="text-sm text-gray-500">
                  {application.status === 'approved' ? 'Application approved' :
                   application.status === 'rejected' ? 'Application not selected' :
                   'Decision pending'}
                </p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {application.status === 'waiting' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-blue-800">
                Your application is currently under review. We'll update the status as soon as possible.
              </p>
            </div>
          )}

          {application.status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <p className="text-green-800">
                Congratulations! Your application has been approved. We'll contact you soon with next steps.
              </p>
            </div>
          )}

          {application.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
              <p className="text-red-800">
                Thank you for your interest. While we've decided not to move forward with your application at this time, we encourage you to apply for future opportunities.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationTimeline;
