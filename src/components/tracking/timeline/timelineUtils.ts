
import React from 'react';
import { CheckCircle, XCircle, Eye, UserCheck, Users, FileCheck, Calendar, Clock } from 'lucide-react';

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
  status: 'application_submitted' | 'under_review' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected' | 'waiting_list';
  created_at: string;
  updated_at: string;
  job_id: string;
}

export const getTimelineSteps = (application: ApplicationData): TimelineStepData[] => {
  const statusOrder = [
    'application_submitted',
    'shortlisted_for_hr',
    'hr_interviewed',
    'shortlisted_for_manager',
    'manager_interviewed',
    'hired',
    'rejected',
    'waiting_list'
  ];

  const statusIndex = statusOrder.indexOf(application.status);
  const steps: TimelineStepData[] = [];

  // Application Submitted (always shown as completed)
  steps.push({
    id: 'application_submitted',
    title: 'Application Submitted',
    description: 'Your application has been received',
    icon: React.createElement(CheckCircle, { className: "w-4 h-4" }),
    status: 'completed',
    date: application.created_at
  });



  // Shortlisted for HR Round
  if (statusIndex >= 1 && application.status !== 'rejected' && application.status !== 'waiting_list') {
    steps.push({
      id: 'shortlisted_for_hr',
      title: 'Shortlisted for HR Round',
      description: 'You have been shortlisted for HR interview',
      icon: React.createElement(Users, { className: "w-4 h-4" }),
      status: statusIndex > 1 ? 'completed' : 'current',
      date: application.updated_at
    });
  }

  // HR Interviewed
  if (statusIndex >= 2 && application.status !== 'rejected' && application.status !== 'waiting_list') {
    steps.push({
      id: 'hr_interviewed',
      title: 'HR Interviewed',
      description: 'HR interview has been completed',
      icon: React.createElement(Calendar, { className: "w-4 h-4" }),
      status: statusIndex > 2 ? 'completed' : 'current',
      date: application.updated_at
    });
  }

  // Shortlisted for Manager Interview
  if (statusIndex >= 3 && application.status !== 'rejected' && application.status !== 'waiting_list') {
    steps.push({
      id: 'shortlisted_for_manager',
      title: 'Shortlisted for Manager Interview',
      description: 'You have been shortlisted for manager interview',
      icon: React.createElement(Users, { className: "w-4 h-4" }),
      status: statusIndex > 3 ? 'completed' : 'current',
      date: application.updated_at
    });
  }

  // Manager Interviewed
  if (statusIndex >= 4 && application.status !== 'rejected' && application.status !== 'waiting_list') {
    steps.push({
      id: 'manager_interviewed',
      title: 'Manager Interviewed',
      description: 'Manager interview has been completed',
      icon: React.createElement(Calendar, { className: "w-4 h-4" }),
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
      icon: React.createElement(UserCheck, { className: "w-4 h-4" }),
      status: 'current',
      date: application.updated_at
    });
  } else if (application.status === 'rejected') {
    steps.push({
      id: 'rejected',
      title: 'Application Not Selected',
      description: 'Thank you for your interest. We encourage you to apply for future opportunities',
      icon: React.createElement(XCircle, { className: "w-4 h-4" }),
      status: 'current',
      date: application.updated_at
    });
  } else if (application.status === 'waiting_list') {
    steps.push({
      id: 'waiting_list',
      title: 'On Waiting List',
      description: 'You have been placed on our waiting list for future consideration',
      icon: React.createElement(Clock, { className: "w-4 h-4" }),
      status: 'current',
      date: application.updated_at
    });
  }

  return steps;
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'hired':
      return React.createElement(CheckCircle, { className: "w-5 h-5 text-green-600" });
    case 'rejected':
      return React.createElement(XCircle, { className: "w-5 h-5 text-red-600" });
    case 'shortlisted':
    case 'interviewed':
      return React.createElement(Users, { className: "w-5 h-5 text-blue-600" });
    case 'waiting_list':
      return React.createElement(Clock, { className: "w-5 h-5 text-orange-600" });
    default:
      return React.createElement(Clock, { className: "w-5 h-5 text-yellow-600" });
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
