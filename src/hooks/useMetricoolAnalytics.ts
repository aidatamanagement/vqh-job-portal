import { useState, useEffect } from 'react';
import { metricoolApi, MetricoolWebAnalytics } from '@/utils/metricoolApi';

export function useMetricoolAnalytics() {
  const [webAnalytics, setWebAnalytics] = useState<MetricoolWebAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWebAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await metricoolApi.getWebAnalytics();
      setWebAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch web analytics');
      console.error('Error fetching Metricool web analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebAnalytics();
  }, []);

  return {
    webAnalytics,
    isLoading,
    error,
    refetch: fetchWebAnalytics
  };
}

