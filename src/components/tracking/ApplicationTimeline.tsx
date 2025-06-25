
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Clock, Eye, UserCheck } from 'lucide-react';

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

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'current';
  date: string;
}

const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ application }) => {
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

  // Only show steps up to current status
  const getTimelineSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        id: 'submitted',
        title: 'Application Submitted',
        description: 'Your application has been received',
        icon: <CheckCircle className="w-4 h-4" />,
        status: 'completed',
        date: application.created_at
      }
    ];

    // Add review step if not waiting
    if (application.status !== 'waiting') {
      steps.push({
        id: 'review',
        title: 'Initial Review',
        description: 'Our team reviewed your application',
        icon: <Eye className="w-4 h-4" />,
        status: 'completed',
        date: application.updated_at
      });
    } else {
      // If still waiting, show current review step
      steps.push({
        id: 'review',
        title: 'Initial Review',
        description: 'Our team is reviewing your application',
        icon: <Eye className="w-4 h-4" />,
        status: 'current',
        date: application.updated_at
      });
    }

    // Add final step only if decision has been made
    if (application.status === 'approved') {
      steps.push({
        id: 'approved',
        title: 'Application Approved',
        description: 'Congratulations! Your application has been approved',
        icon: <UserCheck className="w-4 h-4" />,
        status: 'current',
        date: application.updated_at
      });
    } else if (application.status === 'rejected') {
      steps.push({
        id: 'rejected',
        title: 'Application Not Selected',
        description: 'Thank you for your interest. We encourage you to apply for future opportunities',
        icon: <XCircle className="w-4 h-4" />,
        status: 'current',
        date: application.updated_at
      });
    }

    return steps;
  };

  const timelineSteps = getTimelineSteps();

  const getStepStyles = (step: TimelineStep) => {
    switch (step.status) {
      case 'completed':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          titleColor: 'text-gray-900',
          descColor: 'text-gray-600'
        };
      case 'current':
        return {
          iconBg: application.status === 'approved' ? 'bg-green-100' : application.status === 'rejected' ? 'bg-red-100' : 'bg-blue-100',
          iconColor: application.status === 'approved' ? 'text-green-600' : application.status === 'rejected' ? 'text-red-600' : 'text-blue-600',
          titleColor: 'text-gray-900',
          descColor: 'text-gray-600'
        };
      default:
        return {
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-400',
          titleColor: 'text-gray-500',
          descColor: 'text-gray-400'
        };
    }
  };

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
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-6">
            <Badge variant={getStatusBadgeVariant(application.status)} className="text-sm px-3 py-1">
              {getStatusText(application.status)}
            </Badge>
            <div className="text-sm text-gray-500">
              Last updated: {formatDate(application.updated_at)}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            {timelineSteps.map((step, index) => {
              const styles = getStepStyles(step);
              const isLast = index === timelineSteps.length - 1;
              
              return (
                <div key={step.id} className="relative">
                  <div className="flex items-start gap-4">
                    {/* Timeline dot */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${styles.iconBg} relative z-10`}>
                      <div className={styles.iconColor}>
                        {step.icon}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${styles.titleColor}`}>
                        {step.title}
                      </p>
                      <p className={`text-sm ${styles.descColor} mt-1`}>
                        {step.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(step.date)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-4 top-8 w-px h-6 bg-gray-200"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Status-specific message */}
          {application.status === 'waiting' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <p className="text-blue-800 font-medium">Application Under Review</p>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Your application is currently being reviewed by our team. We'll update the status as soon as possible.
              </p>
            </div>
          )}

          {application.status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-green-800 font-medium">Application Approved</p>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Congratulations! Your application has been approved. We'll contact you soon with next steps.
              </p>
            </div>
          )}

          {application.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <p className="text-red-800 font-medium">Application Not Selected</p>
              </div>
              <p className="text-red-700 text-sm mt-1">
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
