
import { JobApplication } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const getResumeUrl = (applicationId: string) => {
  const extensions = ['pdf', 'doc', 'docx'];
  return `https://dtmwyzrleyevcgtfwrnr.supabase.co/storage/v1/object/public/job-applications/${applicationId}/resume.pdf`;
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
    case 'approved':
      return 'default';
    case 'rejected':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'waiting':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
};

export const getUniquePositions = (submissions: JobApplication[]) => {
  const positions = [...new Set(submissions.map(s => s.appliedPosition))];
  return positions;
};

export const filterSubmissions = (
  submissions: JobApplication[],
  searchTerm: string,
  statusFilter: string,
  positionFilter: string
) => {
  return submissions.filter(submission => {
    const matchesSearch = searchTerm === '' || 
      submission.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.appliedPosition.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesPosition = positionFilter === 'all' || submission.appliedPosition === positionFilter;
    
    return matchesSearch && matchesStatus && matchesPosition;
  });
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
    
    // First, let's check if the record exists
    const { data: existingRecord, error: checkError } = await supabase
      .from('job_applications')
      .select('id')
      .eq('id', applicationId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking if record exists:', checkError);
      throw new Error(`Failed to check application record: ${checkError.message}`);
    }

    if (!existingRecord) {
      console.log('Record not found in database, may have been already deleted');
      return;
    }

    console.log('Record exists, proceeding with deletion');

    const { error: deleteError } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', applicationId);

    if (deleteError) {
      console.error('Error deleting application from database:', deleteError);
      throw new Error(`Failed to delete application from database: ${deleteError.message}`);
    }

    console.log('Successfully deleted application from database');
  } catch (error) {
    console.error('Error in deleteApplicationFromDatabase:', error);
    throw error;
  }
};

export const updateApplicationStatusInDatabase = async (
  id: string, 
  newStatus: 'waiting' | 'approved' | 'rejected'
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
