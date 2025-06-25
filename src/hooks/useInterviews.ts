
import { useState, useEffect } from 'react';
import { Interview } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useInterviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      console.log('Fetching interviews...');

      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          job_applications!inner(
            first_name,
            last_name,
            applied_position,
            email
          )
        `)
        .order('scheduled_time', { ascending: true });

      if (error) {
        console.error('Error fetching interviews:', error);
        toast({
          title: "Error",
          description: "Failed to load interviews. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Fetched interviews:', data);

      // Transform data to match the expected format
      const transformedInterviews: Interview[] = data.map(item => ({
        id: item.id,
        application_id: item.application_id,
        calendly_event_uri: item.calendly_event_uri,
        calendly_event_id: item.calendly_event_id,
        scheduled_time: item.scheduled_time,
        candidate_email: item.candidate_email,
        interviewer_email: item.interviewer_email,
        meeting_url: item.meeting_url,
        status: item.status as 'scheduled' | 'completed' | 'cancelled' | 'rescheduled',
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setInterviews(transformedInterviews);
    } catch (error) {
      console.error('Error in fetchInterviews:', error);
      toast({
        title: "Error",
        description: "Failed to load interviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateInterviewStatus = async (id: string, status: Interview['status']) => {
    try {
      console.log('Updating interview status:', { id, status });

      const { error } = await supabase
        .from('interviews')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating interview status:', error);
        toast({
          title: "Error",
          description: "Failed to update interview status. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setInterviews(prev => prev.map(interview => 
        interview.id === id 
          ? { ...interview, status, updated_at: new Date().toISOString() }
          : interview
      ));

      toast({
        title: "Success",
        description: `Interview status updated to ${status}`,
      });

    } catch (error) {
      console.error('Error in updateInterviewStatus:', error);
      toast({
        title: "Error",
        description: "Failed to update interview status. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  return {
    interviews,
    loading,
    fetchInterviews,
    updateInterviewStatus
  };
};
