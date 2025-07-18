
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
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      console.log('Fetching submissions from Supabase...');

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs!inner(
            id,
            position,
            location,
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
        toast({
          title: "Error",
          description: "Failed to load submissions. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Fetched submissions:', data);

      // Transform data to match the expected format
      const transformedSubmissions: JobApplication[] = data.map(item => ({
        id: item.id,
        jobId: item.job_id,
        firstName: item.first_name,
        lastName: item.last_name,
        email: item.email,
        phone: item.phone || '',
        appliedPosition: item.jobs?.position || item.applied_position || 'Unknown Position',
        jobLocation: item.jobs?.location || 'Unknown Location',
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

  // Update application status in Supabase (simplified - no email automation)
  const updateApplicationStatus = async (id: string, newStatus: 'application_submitted' | 'under_review' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected' | 'waiting_list') => {
    try {
      console.log('Updating application status:', { id, newStatus });

      // Update status in database
      await updateApplicationStatusInDatabase(id, newStatus);

      // Update local state
      setSubmissions(prev => prev.map(app => 
        app.id === id 
          ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
          : app
      ));

      toast({
        title: "Status Updated",
        description: `Application status has been updated to ${newStatus.replace('_', ' ')}`,
      });

    } catch (error) {
      console.error('Error in updateApplicationStatus:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update application status. Please try again.",
        variant: "destructive",
      });
    }
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
