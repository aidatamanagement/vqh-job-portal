
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import ApplicationSearch from '@/components/tracking/ApplicationSearch';
import ApplicationTimeline from '@/components/tracking/ApplicationTimeline';
import ApplicationDetails from '@/components/tracking/ApplicationDetails';
import ApplicationNotFound from '@/components/tracking/ApplicationNotFound';

interface ApplicationData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  applied_position: string;
  earliest_start_date: string;
  city_state: string;
  status: 'waiting' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  job_id: string;
}

const ApplicationTracker: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [manualToken, setManualToken] = useState('');
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchApplication = async (trackingToken: string) => {
    if (!trackingToken.trim()) {
      toast({
        title: "Invalid Token",
        description: "Please enter a valid tracking token",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching application with token:', trackingToken);

      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('tracking_token', trackingToken.trim())
        .maybeSingle();

      if (error) {
        console.error('Error fetching application:', error);
        throw error;
      }

      if (!data) {
        toast({
          title: "Application Not Found",
          description: "No application found with this tracking token. Please check your token and try again.",
          variant: "destructive",
        });
        setApplication(null);
      } else {
        console.log('Application found:', data);
        const transformedApplication: ApplicationData = {
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          applied_position: data.applied_position,
          earliest_start_date: data.earliest_start_date,
          city_state: data.city_state,
          status: data.status as 'waiting' | 'approved' | 'rejected',
          created_at: data.created_at,
          updated_at: data.updated_at,
          job_id: data.job_id,
        };
        setApplication(transformedApplication);
      }
      setSearched(true);
    } catch (error) {
      console.error('Error in fetchApplication:', error);
      toast({
        title: "Error",
        description: "Failed to fetch application details. Please try again.",
        variant: "destructive",
      });
      setApplication(null);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      setManualToken(token);
      fetchApplication(token);
    }
  }, [token]);

  const handleManualSearch = () => {
    fetchApplication(manualToken);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Application</h1>
            <p className="text-gray-600">
              Enter your tracking token to view the status of your job application
            </p>
          </div>

          <ApplicationSearch
            token={manualToken}
            onTokenChange={setManualToken}
            onSearch={handleManualSearch}
            loading={loading}
          />

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="spinner" />
              <span className="ml-2">Loading application details...</span>
            </div>
          )}

          {searched && !loading && !application && <ApplicationNotFound />}

          {application && (
            <div className="space-y-6">
              <ApplicationTimeline application={application} />
              <ApplicationDetails application={application} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationTracker;
