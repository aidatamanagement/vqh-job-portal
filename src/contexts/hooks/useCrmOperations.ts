
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Salesperson, VisitLog, TrainingVideo } from '@/types';

export const useCrmOperations = (
  fetchSalespeople: () => Promise<void>,
  fetchVisitLogs: () => Promise<void>,
  fetchTrainingVideos: () => Promise<void>
) => {
  // Salespeople operations
  const createSalesperson = useCallback(async (data: Omit<Salesperson, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('salespeople')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          region: data.region,
          role: data.role,
          status: data.status,
          visits_this_month: data.visits_this_month || 0,
        });

      if (error) {
        console.error('Error creating salesperson:', error);
        return false;
      }

      await fetchSalespeople();
      return true;
    } catch (error) {
      console.error('Error creating salesperson:', error);
      return false;
    }
  }, [fetchSalespeople]);

  const updateSalesperson = useCallback(async (id: string, data: Partial<Salesperson>): Promise<boolean> => {
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.region !== undefined) updateData.region = data.region;
      if (data.role !== undefined) updateData.role = data.role;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.visits_this_month !== undefined) updateData.visits_this_month = data.visits_this_month;

      const { error } = await supabase
        .from('salespeople')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating salesperson:', error);
        return false;
      }

      await fetchSalespeople();
      return true;
    } catch (error) {
      console.error('Error updating salesperson:', error);
      return false;
    }
  }, [fetchSalespeople]);

  const deleteSalesperson = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('salespeople')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting salesperson:', error);
        return false;
      }

      await fetchSalespeople();
      return true;
    } catch (error) {
      console.error('Error deleting salesperson:', error);
      return false;
    }
  }, [fetchSalespeople]);

  // Visit logs operations
  const createVisitLog = useCallback(async (data: Omit<VisitLog, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('visit_logs')
        .insert({
          salesperson_id: data.salesperson_id,
          salesperson_name: data.salesperson_name,
          location_name: data.location_name,
          visit_date: data.visit_date,
          visit_time: data.visit_time,
          notes: data.notes,
          status: data.status,
          strength: data.strength,
        });

      if (error) {
        console.error('Error creating visit log:', error);
        return false;
      }

      await fetchVisitLogs();
      return true;
    } catch (error) {
      console.error('Error creating visit log:', error);
      return false;
    }
  }, [fetchVisitLogs]);

  const updateVisitLog = useCallback(async (id: string, data: Partial<VisitLog>): Promise<boolean> => {
    try {
      const updateData: any = {};
      if (data.salesperson_name !== undefined) updateData.salesperson_name = data.salesperson_name;
      if (data.location_name !== undefined) updateData.location_name = data.location_name;
      if (data.visit_date !== undefined) updateData.visit_date = data.visit_date;
      if (data.visit_time !== undefined) updateData.visit_time = data.visit_time;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.strength !== undefined) updateData.strength = data.strength;

      const { error } = await supabase
        .from('visit_logs')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating visit log:', error);
        return false;
      }

      await fetchVisitLogs();
      return true;
    } catch (error) {
      console.error('Error updating visit log:', error);
      return false;
    }
  }, [fetchVisitLogs]);

  const deleteVisitLog = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('visit_logs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting visit log:', error);
        return false;
      }

      await fetchVisitLogs();
      return true;
    } catch (error) {
      console.error('Error deleting visit log:', error);
      return false;
    }
  }, [fetchVisitLogs]);

  // Training videos operations
  const createTrainingVideo = useCallback(async (data: Omit<TrainingVideo, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('training_videos')
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          role: data.role,
          tag: data.tag,
          type: data.type,
          url: data.url,
          duration: data.duration,
          view_count: data.view_count || 0,
        });

      if (error) {
        console.error('Error creating training video:', error);
        return false;
      }

      await fetchTrainingVideos();
      return true;
    } catch (error) {
      console.error('Error creating training video:', error);
      return false;
    }
  }, [fetchTrainingVideos]);

  const updateTrainingVideo = useCallback(async (id: string, data: Partial<TrainingVideo>): Promise<boolean> => {
    try {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.role !== undefined) updateData.role = data.role;
      if (data.tag !== undefined) updateData.tag = data.tag;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.url !== undefined) updateData.url = data.url;
      if (data.duration !== undefined) updateData.duration = data.duration;
      if (data.view_count !== undefined) updateData.view_count = data.view_count;

      const { error } = await supabase
        .from('training_videos')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating training video:', error);
        return false;
      }

      await fetchTrainingVideos();
      return true;
    } catch (error) {
      console.error('Error updating training video:', error);
      return false;
    }
  }, [fetchTrainingVideos]);

  const deleteTrainingVideo = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('training_videos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting training video:', error);
        return false;
      }

      await fetchTrainingVideos();
      return true;
    } catch (error) {
      console.error('Error deleting training video:', error);
      return false;
    }
  }, [fetchTrainingVideos]);

  return {
    createSalesperson,
    updateSalesperson,
    deleteSalesperson,
    createVisitLog,
    updateVisitLog,
    deleteVisitLog,
    createTrainingVideo,
    updateTrainingVideo,
    deleteTrainingVideo,
  };
};
