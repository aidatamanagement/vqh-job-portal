
// Utility functions for mapping between old and new status formats

export const mapTrackingStatusToDb = (trackingStatus: 'waiting' | 'approved' | 'rejected'): 'application_submitted' | 'shortlisted_for_hr' | 'hired' | 'rejected' => {
  switch (trackingStatus) {
    case 'waiting':
      return 'shortlisted_for_hr';
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
    case 'shortlisted_for_hr':
    case 'hr_interviewed':
    case 'shortlisted_for_manager':
    case 'manager_interviewed':
    case 'waiting_list':
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
    case 'shortlisted_for_hr':
      return 'Shortlisted for HR Round';
    case 'hr_interviewed':
      return 'HR Interviewed';
    case 'shortlisted_for_manager':
      return 'Shortlisted for Manager Interview';
    case 'manager_interviewed':
      return 'Manager Interviewed';
    case 'hired':
      return 'Hired';
    case 'rejected':
      return 'Not Selected';
    case 'waiting_list':
      return 'Waiting List';
    default:
      return 'Unknown Status';
  }
};
