import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { JobApplication } from '@/types';
import { toast } from '@/hooks/use-toast';

// Fetch submissions with automatic background updates
export const useSubmissionsQuery = () => {
  const queryClient = useQueryClient();

  // Main query for submissions
  const {
    data: submissions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['submissions'],
    queryFn: async (): Promise<JobApplication[]> => {
      console.log('🔄 Fetching submissions from Supabase...');
      
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
        console.error('❌ Error fetching submissions:', error);
        throw new Error(`Failed to fetch submissions: ${error.message}`);
      }

      console.log('✅ Fetched submissions:', data?.length, 'entries');
      
      // Transform data to match JobApplication interface
      const transformedData = data?.map((item: any) => ({
        id: item.id,
        jobId: item.job_id,
        candidateName: item.candidate_name,
        candidateEmail: item.candidate_email,
        candidatePhone: item.candidate_phone,
        resumeUrl: item.resume_url,
        coverLetterUrl: item.cover_letter_url,
        status: item.status,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        job: {
          id: item.jobs.id,
          position: item.jobs.position,
          officeLocation: item.jobs.office_location,
          hrManagerName: item.jobs.hr_manager?.admin_name || 
                        item.jobs.hr_manager?.display_name || 
                        item.jobs.hr_manager?.email
        }
      })) || [];

      return transformedData;
    },
    // Enable automatic background updates
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: true, // Continue refetching when tab is not active
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    staleTime: 10000, // Consider data stale after 10 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Mutation for deleting submissions
  const deleteMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      console.log('🗑️ Deleting application:', applicationId);
      
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', applicationId);

      if (error) {
        console.error('❌ Error deleting application:', error);
        throw new Error(`Failed to delete application: ${error.message}`);
      }

      console.log('✅ Application deleted successfully');
      return applicationId;
    },
    onSuccess: (deletedId) => {
      console.log('✅ Delete successful, invalidating queries');
      
      // Invalidate and refetch submissions
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      
      toast({
        title: "Application Deleted",
        description: "The application has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error('❌ Delete mutation error:', error);
      toast({
        title: "Deletion Failed",
        description: `Failed to delete application: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Mutation for updating application status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      applicationId, 
      newStatus, 
      notes 
    }: { 
      applicationId: string; 
      newStatus: string; 
      notes: string; 
    }) => {
      console.log('🔄 Updating application status:', { applicationId, newStatus, notes });
      
      // First, update the application status
      const { error: updateError } = await supabase
        .from('job_applications')
        .update({ 
          status: newStatus,
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) {
        console.error('❌ Error updating application status:', updateError);
        throw new Error(`Failed to update status: ${updateError.message}`);
      }

      // Then, add to status history
      const { error: historyError } = await supabase
        .from('status_history')
        .insert({
          application_id: applicationId,
          previous_status: 'application_submitted', // You might want to get the actual previous status
          new_status: newStatus,
          notes: notes,
          changed_by: (await supabase.auth.getUser()).data.user?.id,
          changed_at: new Date().toISOString()
        });

      if (historyError) {
        console.error('❌ Error adding to status history:', historyError);
        // Don't throw here, as the main update was successful
      }

      console.log('✅ Status update successful');
      return { applicationId, newStatus, notes };
    },
    onSuccess: (data) => {
      console.log('✅ Status update successful, invalidating queries');
      
      // Invalidate and refetch submissions
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      
      // Also invalidate status history for this application
      queryClient.invalidateQueries({ 
        queryKey: ['status-history', data.applicationId] 
      });
      
      toast({
        title: "Status Updated",
        description: `Application status has been updated to ${data.newStatus}.`,
      });
    },
    onError: (error) => {
      console.error('❌ Status update mutation error:', error);
      toast({
        title: "Status Update Failed",
        description: `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  return {
    // Query data
    submissions,
    isLoading,
    error,
    refetch,
    
    // Mutations
    deleteSubmission: deleteMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    isDeleting: deleteMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    
    // Mutation states
    deleteError: deleteMutation.error,
    updateStatusError: updateStatusMutation.error,
  };
}; 