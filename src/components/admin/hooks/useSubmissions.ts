
import { useState, useEffect } from 'react';
import { JobApplication } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  getResumeUrl,
  deleteApplicationFiles,
  deleteApplicationFromDatabase,
  updateApplicationStatusInDatabase
} from '../utils/submissionsUtils';

export const useSubmissions = () => {
  const [submissions, setSubmissions] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingApplication, setDeletingApplication] = useState<string | null>(null);

  // Fetch submissions from Supabase
  const fetchSubmissions = async (retryCount = 0) => {
    try {
      setLoading(true);
      console.log(`Fetching submissions from Supabase... (attempt ${retryCount + 1})`);

      // Query using office_location column (which exists in your database)
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs!inner(
            id,
            position,
            office_location,
            hr_manager:profiles!hr_manager_id (
              admin_name,
              display_name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // More specific error messages
        let errorDescription = "Failed to load submissions. Please try again.";
        if (error.message?.includes('permission denied')) {
          errorDescription = "Permission denied. Please check your admin access.";
        } else if (error.message?.includes('column') && error.message?.includes('does not exist')) {
          errorDescription = "Database schema issue. Please run the database migration.";
        } else if (error.message?.includes('function') && error.message?.includes('does not exist')) {
          errorDescription = "Database function missing. Please run the database migration.";
        }
        
        toast({
          title: "Error",
          description: errorDescription,
          variant: "destructive",
        });
        // Retry once if it's the first attempt
        if (retryCount === 0) {
          console.log('Retrying with simplified query...');
          return fetchSubmissions(1);
        }
        return;
      }

      console.log('Fetched submissions successfully:', {
        count: data?.length || 0,
        sample: data?.slice(0, 2)
      });

      // Transform data to match the expected format
      const transformedSubmissions: JobApplication[] = data.map(item => ({
        id: item.id,
        jobId: item.job_id,
        firstName: item.first_name,
        lastName: item.last_name,
        email: item.email,
        phone: item.phone || '',
        appliedPosition: item.jobs?.position || item.applied_position || 'Unknown Position',
        jobLocation: item.jobs?.office_location || 'Unknown Location',
        earliestStartDate: item.earliest_start_date || '',
        cityState: item.city_state || '',
        coverLetter: item.cover_letter || '',
        coverLetterUrl: item.cover_letter_url,
        resumeUrl: getResumeUrl(item.id),
        additionalDocsUrls: item.additional_docs_urls || [],
        hrManagerName: item.jobs?.hr_manager ? (item.jobs.hr_manager.admin_name || item.jobs.hr_manager.display_name || 'Unknown') : 'Unassigned',
        hrManagerEmail: item.jobs?.hr_manager?.email || undefined,
        status: item.status as 'application_submitted' | 'under_review' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected' | 'waiting_list',
        notes: '',
        trackingToken: item.tracking_token,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      setSubmissions(transformedSubmissions);
    } catch (error) {
      console.error('Error in fetchSubmissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete application and associated files
  const deleteApplication = async (applicationId: string) => {
    if (!applicationId) {
      toast({
        title: "Error",
        description: "Invalid application ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      setDeletingApplication(applicationId);
      console.log('Starting deletion process for application:', applicationId);

      // Step 1: Delete the application record from the database
      console.log('Step 1: Deleting record from database...');
      await deleteApplicationFromDatabase(applicationId);
      console.log('Successfully deleted application from database');

      // Step 2: Delete files from storage (non-blocking)
      console.log('Step 2: Deleting files from storage...');
      try {
        await deleteApplicationFiles(applicationId);
        console.log('Files deleted from storage successfully');
      } catch (storageError) {
        console.warn('Storage deletion failed, but continuing since database deletion succeeded:', storageError);
      }

      // Step 3: Update local state after successful database deletion
      console.log('Step 3: Updating local state...');
      setSubmissions(prev => prev.filter(app => app.id !== applicationId));

      toast({
        title: "Success",
        description: "Application has been successfully deleted.",
      });

    } catch (error) {
      console.error('Error deleting application:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Deletion Failed",
        description: `Failed to delete application: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setDeletingApplication(null);
    }
  };

  // Update application status in Supabase (deprecated - redirects to proper notes-based update)
  const updateApplicationStatus = async (id: string, newStatus: 'application_submitted' | 'shortlisted_for_hr' | 'hr_interviewed' | 'shortlisted_for_manager' | 'manager_interviewed' | 'hired' | 'rejected' | 'waiting_list') => {
    console.log('WARNING: Direct status updates are deprecated. Use the status update modal with notes.');
    toast({
      title: "Status Update Required",
      description: "Please use the application details modal to update status with mandatory notes.",
      variant: "destructive",
    });
    throw new Error('Status updates must include notes. Please use the application details modal.');
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return {
    submissions,
    loading,
    deletingApplication,
    deleteApplication,
    updateApplicationStatus,
    fetchSubmissions,
    refreshSubmissions: fetchSubmissions // Add alias for refreshSubmissions
  };
};
