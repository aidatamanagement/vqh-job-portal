import { JobApplication } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const getResumeUrl = (applicationId: string) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL environment variable is not configured');
  }
  const extensions = ['pdf', 'doc', 'docx'];
  return `${supabaseUrl}/storage/v1/object/public/job-applications/${applicationId}/resume.pdf`;
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'hired':
      return 'default';
    case 'rejected':
      return 'destructive';
    case 'shortlisted':
    case 'interviewed':
      return 'default';
    case 'under_review':
    case 'waiting_list':
      return 'secondary';
    default:
      return 'secondary';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'application_submitted':
      return 'Submitted';
    case 'under_review':
      return 'Under Review';
    case 'shortlisted':
      return 'Shortlisted';
    case 'interviewed':
      return 'Interviewed';
    case 'hired':
      return 'Hired';
    case 'rejected':
      return 'Rejected';
    case 'waiting_list':
      return 'Waiting List';
    default:
      return status;
  }
};

// Centralized status transition validation
export const getValidNextStatuses = (currentStatus: string): string[] => {
  const validTransitions: Record<string, string[]> = {
    'application_submitted': ['under_review', 'rejected'],
    'under_review': ['shortlisted', 'rejected', 'waiting_list'],
    'shortlisted': ['interviewed', 'rejected', 'waiting_list'],
    'interviewed': ['hired', 'rejected', 'waiting_list'],
    'hired': [],
    'rejected': [],
    'waiting_list': ['under_review', 'shortlisted', 'interviewed', 'hired', 'rejected']
  };

  return validTransitions[currentStatus] || [];
};

export const validateStatusTransition = (currentStatus: string, newStatus: string): boolean => {
  if (currentStatus === newStatus) return false;
  const validNextStatuses = getValidNextStatuses(currentStatus);
  return validNextStatuses.includes(newStatus);
};

export const getUniquePositions = (submissions: JobApplication[]) => {
  const positions = [...new Set(submissions.map(s => s.appliedPosition))];
  return positions;
};

export const getUniqueHrManagers = (submissions: JobApplication[]) => {
  const hrManagers = submissions
    .map(submission => submission.hrManagerName)
    .filter(name => name && name !== 'Unassigned');
  return [...new Set(hrManagers)].sort();
};

export const filterSubmissions = (
  submissions: JobApplication[],
  searchTerm: string,
  statusFilter: string,
  positionFilter: string,
  locationFilter: string,
  hrManagerFilter: string
) => {
  return submissions.filter(submission => {
    const matchesSearch = searchTerm === '' || 
      submission.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.appliedPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.cityState.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (submission.jobLocation && submission.jobLocation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (submission.hrManagerName && submission.hrManagerName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesPosition = positionFilter === 'all' || submission.appliedPosition === positionFilter;
    const matchesLocation = locationFilter === 'all' || submission.jobLocation === locationFilter;
    const matchesHrManager = hrManagerFilter === 'all' || submission.hrManagerName === hrManagerFilter;
    
    return matchesSearch && matchesStatus && matchesPosition && matchesLocation && matchesHrManager;
  });
};

export const sortSubmissions = (
  submissions: JobApplication[],
  sortBy: 'date' | 'name' | 'position' | 'hrManager',
  sortOrder: 'asc' | 'desc'
) => {
  const sorted = [...submissions].sort((a, b) => {
    let aValue: string;
    let bValue: string;
    
    switch (sortBy) {
      case 'date':
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
      case 'name':
        aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
        bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
        break;
      case 'position':
        aValue = a.appliedPosition.toLowerCase();
        bValue = b.appliedPosition.toLowerCase();
        break;
      case 'hrManager':
        aValue = (a.hrManagerName || 'Unassigned').toLowerCase();
        bValue = (b.hrManagerName || 'Unassigned').toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (sortBy === 'date') {
      const dateA = new Date(aValue).getTime();
      const dateB = new Date(bValue).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
};

export const getSubmissionsByStatus = (submissions: JobApplication[], status: string) => {
  if (status === 'all') return submissions;
  return submissions.filter(submission => submission.status === status);
};

export const getStatusCount = (submissions: JobApplication[], status: string) => {
  if (status === 'all') return submissions.length;
  return submissions.filter(submission => submission.status === status).length;
};

export const deleteApplicationFiles = async (applicationId: string) => {
  try {
    console.log('Attempting to delete files from storage for application:', applicationId);
    
    const { data: files, error: listError } = await supabase.storage
      .from('job-applications')
      .list(applicationId);

    if (listError) {
      console.error('Error listing files:', listError);
      return false;
    } 
    
    if (files && files.length > 0) {
      const filePaths = files.map(file => `${applicationId}/${file.name}`);
      console.log('Deleting files:', filePaths);
      
      const { error: deleteFilesError } = await supabase.storage
        .from('job-applications')
        .remove(filePaths);

      if (deleteFilesError) {
        console.error('Error deleting files from storage:', deleteFilesError);
        return false;
      } else {
        console.log('Successfully deleted files from storage');
        return true;
      }
    }
    return true;
  } catch (storageError) {
    console.error('Storage deletion error:', storageError);
    return false;
  }
};

export const deleteApplicationFromDatabase = async (applicationId: string) => {
  try {
    console.log('Deleting application record from database:', applicationId);
    
    const { error: deleteError } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', applicationId);

    if (deleteError) {
      console.error('Database deletion error:', deleteError);
      throw new Error(`Failed to delete application: ${deleteError.message}`);
    }

    console.log('Successfully deleted application from database');
    return true;
  } catch (error) {
    console.error('Error in deleteApplicationFromDatabase:', error);
    throw error;
  }
};

export const updateApplicationStatusInDatabase = async (
  id: string, 
  newStatus: 'application_submitted' | 'under_review' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected' | 'waiting_list'
) => {
  console.log('Updating application status:', { id, newStatus });

  const { error } = await supabase
    .from('job_applications')
    .update({ 
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating status:', error);
    throw new Error('Failed to update application status. Please try again.');
  }
};
