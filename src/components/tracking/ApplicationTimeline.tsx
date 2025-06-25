
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Clock, Eye, UserCheck, Users, FileCheck, Calendar } from 'lucide-react';

interface ApplicationData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  applied_position: string;
  earliest_start_date: string;
  city_state: string;
  status: 'application_submitted' | 'under_review' | 'shortlisted' | 'interview_scheduled' | 'decisioning' | 'hired' | 'rejected';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Map application status to timeline steps
  const getTimelineSteps = (): TimelineStep[] => {
    const statusOrder = [
      'application_submitted',
      'under_review',
      'shortlisted',
      'interview_scheduled',
      'decisioning',
      'hired',
      'rejected'
    ];

    const statusIndex = statusOrder.indexOf(application.status);
    const steps: TimelineStep[] = [];

    // Application Submitted (always shown as completed)
    steps.push({
      id: 'application_submitted',
      title: 'Application Submitted',
      description: 'Your application has been received',
      icon: <CheckCircle className="w-4 h-4" />,
      status: 'completed',
      date: application.created_at
    });

    // Under Review
    if (statusIndex >= 1) {
      steps.push({
        id: 'under_review',
        title: 'Under Review',
        description: 'Our team is reviewing your application',
        icon: <Eye className="w-4 h-4" />,
        status: statusIndex > 1 ? 'completed' : 'current',
        date: application.updated_at
      });
    }

    // Shortlisted
    if (statusIndex >= 2 && application.status !== 'rejected') {
      steps.push({
        id: 'shortlisted',
        title: 'Shortlisted',
        description: 'You have been shortlisted for further consideration',
        icon: <Users className="w-4 h-4" />,
        status: statusIndex > 2 ? 'completed' : 'current',
        date: application.updated_at
      });
    }

    // Interview Scheduled
    if (statusIndex >= 3 && application.status !== 'rejected') {
      steps.push({
        id: 'interview_scheduled',
        title: 'Interview Scheduled',
        description: 'Interview has been scheduled',
        icon: <Calendar className="w-4 h-4" />,
        status: statusIndex > 3 ? 'completed' : 'current',
        date: application.updated_at
      });
    }

    // Decisioning
    if (statusIndex >= 4 && application.status !== 'rejected') {
      steps.push({
        id: 'decisioning',
        title: 'Final Decision',
        description: 'Final decision is being made',
        icon: <FileCheck className="w-4 h-4" />,
        status: statusIndex > 4 ? 'completed' : 'current',
        date: application.updated_at
      });
    }

    // Final outcome
    if (application.status === 'hired') {
      steps.push({
        id: 'hired',
        title: 'Hired',
        description: 'Congratulations! You have been hired',
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
          iconBg: application.status === 'hired' ? 'bg-green-100' : application.status === 'rejected' ? 'bg-red-100' : 'bg-blue-100',
          iconColor: application.status === 'hired' ? 'text-green-600' : application.status === 'rejected' ? 'text-red-600' : 'text-blue-600',
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
      case 'hired':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'shortlisted':
      case 'interview_scheduled':
        return <Users className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
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
          {(application.status === 'application_submitted' || application.status === 'under_review') && (
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

          {(application.status === 'shortlisted' || application.status === 'interview_scheduled' || application.status === 'decisioning') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <p className="text-blue-800 font-medium">Application in Progress</p>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Great news! Your application is progressing through our selection process. We'll keep you updated on next steps.
              </p>
            </div>
          )}

          {application.status === 'hired' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-green-800 font-medium">Congratulations!</p>
              </div>
              <p className="text-green-700 text-sm mt-1">
                You have been hired! We'll contact you soon with next steps and onboarding information.
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
