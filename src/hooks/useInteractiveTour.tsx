
import { useState, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, Step, EVENTS, ACTIONS } from 'react-joyride';

export interface TourStep extends Step {
  target: string;
  content: string;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  disableBeacon?: boolean;
}

export const useInteractiveTour = (steps: TourStep[]) => {
  const [tourState, setTourState] = useState({
    run: false,
    stepIndex: 0,
    steps: steps
  });

  const startTour = useCallback(() => {
    setTourState(prev => ({ ...prev, run: true, stepIndex: 0 }));
  }, []);

  const stopTour = useCallback(() => {
    setTourState(prev => ({ ...prev, run: false }));
  }, []);

  const resetTour = useCallback(() => {
    setTourState(prev => ({ ...prev, stepIndex: 0, run: false }));
  }, []);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type, index, action } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setTourState(prev => ({ ...prev, run: false }));
    } else if (type === EVENTS.STEP_AFTER) {
      setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
    }
  }, []);

  const TourComponent = () => (
    <Joyride
      callback={handleJoyrideCallback}
      continuous={true}
      run={tourState.run}
      stepIndex={tourState.stepIndex}
      steps={tourState.steps}
      showProgress={true}
      showSkipButton={true}
      styles={{
        options: {
          arrowColor: '#fff',
          backgroundColor: '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          primaryColor: '#005586',
          textColor: '#333',
          width: 350,
          zIndex: 1000,
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 14,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: 16,
          fontWeight: 600,
          marginBottom: 8,
        },
        buttonNext: {
          backgroundColor: '#005586',
          borderRadius: 6,
          color: '#fff',
          fontSize: 14,
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#666',
          fontSize: 14,
          padding: '8px 16px',
        },
        buttonSkip: {
          color: '#999',
          fontSize: 14,
        },
      }}
    />
  );

  return {
    startTour,
    stopTour,
    resetTour,
    isRunning: tourState.run,
    TourComponent
  };
};

// Predefined tour steps for different admin sections
export const adminTourSteps: TourStep[] = [
  {
    target: '.admin-logo',
    content: 'Welcome to the HospiceCare Admin Dashboard! This tour will guide you through the key features.',
    title: 'Welcome to Admin Dashboard',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.sidebar-post-job',
    content: 'Click here to create and publish new job postings. You can set job details, requirements, and deadlines.',
    title: 'Post New Jobs',
    placement: 'right',
  },
  {
    target: '.sidebar-manage-jobs',
    content: 'Manage all your job postings here. Edit, activate/deactivate, or delete existing jobs.',
    title: 'Manage Jobs',
    placement: 'right',
  },
  {
    target: '.sidebar-submissions',
    content: 'Review all job applications here. You can approve, schedule interviews, or reject candidates.',
    title: 'Review Applications',
    placement: 'right',
  },
  {
    target: '.sidebar-settings',
    content: 'Configure system settings, manage supervisors, and customize email templates.',
    title: 'System Settings',
    placement: 'right',
  },
];

export const jobPostingTourSteps: TourStep[] = [
  {
    target: '.job-title-input',
    content: 'Start by entering a clear, descriptive job title that candidates will see first.',
    title: 'Job Title',
    placement: 'bottom',
  },
  {
    target: '.job-position-select',
    content: 'Select the position type from the dropdown. This helps categorize your job posting.',
    title: 'Position Type',
    placement: 'bottom',
  },
  {
    target: '.job-location-select',
    content: 'Choose the job location. This helps candidates filter jobs by their preferred location.',
    title: 'Job Location',
    placement: 'bottom',
  },
  {
    target: '.job-description-editor',
    content: 'Write a detailed job description including responsibilities, requirements, and benefits.',
    title: 'Job Description',
    placement: 'top',
  },
  {
    target: '.job-facilities-section',
    content: 'Select applicable facilities or departments for this position.',
    title: 'Facilities',
    placement: 'top',
  },
  {
    target: '.urgent-toggle',
    content: 'Mark as urgent if this position needs to be filled quickly. Urgent jobs get priority display.',
    title: 'Urgent Priority',
    placement: 'bottom',
  },
  {
    target: '.deadline-input',
    content: 'Set an application deadline if needed. After this date, applications will be automatically closed.',
    title: 'Application Deadline',
    placement: 'bottom',
  },
];

export const submissionsTourSteps: TourStep[] = [
  {
    target: '.submissions-tabs',
    content: 'Use these tabs to filter applications by status: All, Pending, Approved, or Rejected.',
    title: 'Status Filters',
    placement: 'bottom',
  },
  {
    target: '.submissions-search',
    content: 'Search for specific applications by candidate name, email, or position.',
    title: 'Search Applications',
    placement: 'bottom',
  },
  {
    target: '.application-row:first-child',
    content: 'Click on any application row to view detailed candidate information and take actions.',
    title: 'Application Details',
    placement: 'left',
  },
  {
    target: '.status-dropdown',
    content: 'Update application status here. Each status change triggers appropriate email notifications.',
    title: 'Update Status',
    placement: 'bottom',
  },
];
