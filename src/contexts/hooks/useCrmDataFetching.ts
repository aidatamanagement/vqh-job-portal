
import { useState, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Salesperson, VisitLog, TrainingVideo } from '@/types';

export const useCrmDataFetching = (user: User | null, userProfile: any | null) => {
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [visitLogs, setVisitLogs] = useState<VisitLog[]>([]);
  const [trainingVideos, setTrainingVideos] = useState<TrainingVideo[]>([]);
  
  const isFetchingSalespeople = useRef(false);
  const isFetchingVisitLogs = useRef(false);
  const isFetchingTrainingVideos = useRef(false);
  const isMounted = useRef(true);

  // Fetch salespeople from database
  const fetchSalespeople = useCallback(async () => {
    if (!user || userProfile?.role !== 'admin' || isFetchingSalespeople.current) return;
    
    isFetchingSalespeople.current = true;
    try {
      const { data, error } = await supabase
        .from('salespeople')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching salespeople:', error);
        return;
      }

      const transformedSalespeople = data.map(person => ({
        id: person.id,
        name: person.name,
        email: person.email,
        phone: person.phone || '',
        region: person.region,
        role: person.role as 'manager' | 'sales_rep',
        status: person.status as 'active' | 'inactive',
        visits_this_month: person.visits_this_month || 0,
        created_at: person.created_at,
        updated_at: person.updated_at,
      }));

      if (isMounted.current) {
        setSalespeople(transformedSalespeople);
      }
    } catch (error) {
      console.error('Error fetching salespeople:', error);
    } finally {
      isFetchingSalespeople.current = false;
    }
  }, [user, userProfile?.role]);

  // Fetch visit logs from database
  const fetchVisitLogs = useCallback(async () => {
    if (!user || userProfile?.role !== 'admin' || isFetchingVisitLogs.current) return;
    
    isFetchingVisitLogs.current = true;
    try {
      const { data, error } = await supabase
        .from('visit_logs')
        .select('*')
        .order('visit_date', { ascending: false });

      if (error) {
        console.error('Error fetching visit logs:', error);
        return;
      }

      const transformedVisitLogs = data.map(log => ({
        id: log.id,
        salesperson_id: log.salesperson_id,
        salesperson_name: log.salesperson_name,
        location_name: log.location_name,
        visit_date: log.visit_date,
        visit_time: log.visit_time,
        notes: log.notes || '',
        status: log.status as 'initial' | 'follow_up' | 'closed',
        strength: log.strength as 'strong' | 'medium' | 'weak',
        created_at: log.created_at,
        updated_at: log.updated_at,
      }));

      if (isMounted.current) {
        setVisitLogs(transformedVisitLogs);
      }
    } catch (error) {
      console.error('Error fetching visit logs:', error);
    } finally {
      isFetchingVisitLogs.current = false;
    }
  }, [user, userProfile?.role]);

  // Fetch training videos from database
  const fetchTrainingVideos = useCallback(async () => {
    if (!user || isFetchingTrainingVideos.current) return;
    
    isFetchingTrainingVideos.current = true;
    try {
      const { data, error } = await supabase
        .from('training_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching training videos:', error);
        return;
      }

      const transformedTrainingVideos = data.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description || '',
        category: video.category,
        role: video.role,
        tag: video.tag as 'mandatory' | 'optional',
        type: video.type as 'youtube' | 'vimeo' | 'direct',
        url: video.url,
        duration: video.duration || '',
        view_count: video.view_count || 0,
        created_at: video.created_at,
        updated_at: video.updated_at,
      }));

      if (isMounted.current) {
        setTrainingVideos(transformedTrainingVideos);
      }
    } catch (error) {
      console.error('Error fetching training videos:', error);
    } finally {
      isFetchingTrainingVideos.current = false;
    }
  }, [user]);

  return {
    salespeople,
    setSalespeople,
    visitLogs,
    setVisitLogs,
    trainingVideos,
    setTrainingVideos,
    fetchSalespeople,
    fetchVisitLogs,
    fetchTrainingVideos,
  };
};
