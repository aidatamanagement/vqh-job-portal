
import { CheckCircle, XCircle, Eye, UserCheck, Users, FileCheck, Calendar } from 'lucide-react';

export interface TimelineStepData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'current';
  date: string;
}

export interface ApplicationData {
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

export const getTimelineSteps = (application: ApplicationData): TimelineStepData[] => {
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
  const steps: TimelineStepData[] = [];

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

export const getStatusIcon = (status: string) => {
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

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
