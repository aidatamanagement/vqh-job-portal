import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useJobsQuery = () => {
  const queryClient = useQueryClient();

  // Main query for jobs
  const {
    data: jobs = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['jobs'],
    queryFn: async (): Promise<Job[]> => {
      console.log('🔄 Fetching jobs from Supabase...');
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          hr_manager:profiles!hr_manager_id (
            id,
            email,
            admin_name,
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching jobs:', error);
        throw new Error(`Failed to fetch jobs: ${error.message}`);
      }

      console.log('✅ Fetched jobs:', data?.length, 'entries');
      
      // Transform data to match Job interface
      const transformedJobs = data?.map((job: any) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        position: job.position,
        officeLocation: job.office_location || job.location,
        workLocation: job.work_location || job.location,
        facilities: job.facilities || [],
        isActive: job.is_active,
        isUrgent: job.is_urgent || false,
        applicationDeadline: job.application_deadline,
        hrManagerId: job.hr_manager_id,
        hrManagerName: job.hr_manager ? (job.hr_manager.admin_name || job.hr_manager.display_name || job.hr_manager.email) : undefined,
        hrManagerEmail: job.hr_manager?.email,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
      })) || [];

      return transformedJobs;
    },
    // Enable automatic background updates
    refetchInterval: 45000, // Refetch every 45 seconds (less frequent for jobs)
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 30000, // Consider data stale after 30 seconds
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Mutation for creating jobs
  const createJobMutation = useMutation({
    mutationFn: async (jobData: Partial<Job>) => {
      console.log('🆕 Creating new job:', jobData);
      
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          title: jobData.title,
          description: jobData.description,
          position: jobData.position,
          office_location: jobData.officeLocation,
          work_location: jobData.workLocation,
          facilities: jobData.facilities,
          is_active: jobData.isActive ?? true,
          is_urgent: jobData.isUrgent ?? false,
          application_deadline: jobData.applicationDeadline,
          hr_manager_id: jobData.hrManagerId,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating job:', error);
        throw new Error(`Failed to create job: ${error.message}`);
      }

      console.log('✅ Job created successfully');
      return data;
    },
    onSuccess: (newJob) => {
      console.log('✅ Job created, invalidating queries');
      
      // Invalidate and refetch jobs
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      toast({
        title: "Job Created",
        description: "The job posting has been created successfully.",
      });
    },
    onError: (error) => {
      console.error('❌ Create job mutation error:', error);
      toast({
        title: "Job Creation Failed",
        description: `Failed to create job: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Mutation for updating jobs
  const updateJobMutation = useMutation({
    mutationFn: async ({ id, ...jobData }: { id: string } & Partial<Job>) => {
      console.log('🔄 Updating job:', id, jobData);
      
      const { data, error } = await supabase
        .from('jobs')
        .update({
          title: jobData.title,
          description: jobData.description,
          position: jobData.position,
          office_location: jobData.officeLocation,
          work_location: jobData.workLocation,
          facilities: jobData.facilities,
          is_active: jobData.isActive,
          is_urgent: jobData.isUrgent,
          application_deadline: jobData.applicationDeadline,
          hr_manager_id: jobData.hrManagerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating job:', error);
        throw new Error(`Failed to update job: ${error.message}`);
      }

      console.log('✅ Job updated successfully');
      return data;
    },
    onSuccess: (updatedJob) => {
      console.log('✅ Job updated, invalidating queries');
      
      // Invalidate and refetch jobs
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      toast({
        title: "Job Updated",
        description: "The job posting has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('❌ Update job mutation error:', error);
      toast({
        title: "Job Update Failed",
        description: `Failed to update job: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  return {
    // Query data
    jobs,
    isLoading,
    error,
    refetch,
    
    // Mutations
    createJob: createJobMutation.mutate,
    updateJob: updateJobMutation.mutate,
    isCreating: createJobMutation.isPending,
    isUpdating: updateJobMutation.isPending,
    
    // Mutation states
    createError: createJobMutation.error,
    updateError: updateJobMutation.error,
  };
}; 