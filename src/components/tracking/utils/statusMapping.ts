
// Utility functions for mapping between old and new status formats

export const mapTrackingStatusToDb = (trackingStatus: 'waiting' | 'approved' | 'rejected'): 'application_submitted' | 'under_review' | 'hired' | 'rejected' => {
  switch (trackingStatus) {
    case 'waiting':
      return 'under_review';
    case 'approved':
      return 'hired';
    case 'rejected':
      return 'rejected';
    default:
      return 'application_submitted';
  }
};

export const mapDbStatusToTracking = (dbStatus: string): 'waiting' | 'approved' | 'rejected' => {
  switch (dbStatus) {
    case 'application_submitted':
    case 'under_review':
    case 'shortlisted':
    case 'interview_scheduled':
    case 'decisioning':
      return 'waiting';
    case 'hired':
      return 'approved';
    case 'rejected':
      return 'rejected';
    default:
      return 'waiting';
  }
};

export const getDisplayStatus = (dbStatus: string): string => {
  switch (dbStatus) {
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
      return 'Unknown Status';
  }
};
