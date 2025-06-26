
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import ApplicationSearch from '@/components/tracking/ApplicationSearch';
import ApplicationTimeline from '@/components/tracking/ApplicationTimeline';
import ApplicationDetails from '@/components/tracking/ApplicationDetails';
import ApplicationNotFound from '@/components/tracking/ApplicationNotFound';
import { mapDbStatusToTracking } from '@/components/tracking/utils/statusMapping';

interface ApplicationData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  applied_position: string;
  earliest_start_date: string;
  city_state: string;
  status: 'application_submitted' | 'under_review' | 'shortlisted' | 'interview_scheduled' | 'decisioning' | 'hired' | 'rejected';
  created_at: string;
  updated_at: string;
  job_id: string;
}

interface MappedApplicationData {
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
  const { token: urlToken } = useParams<{ token: string }>();
  const [token, setToken] = useState('');
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [mappedApplication, setMappedApplication] = useState<MappedApplicationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Auto-populate token from URL and search automatically
  useEffect(() => {
    if (urlToken) {
      setToken(urlToken);
      handleSearch(urlToken);
    }
  }, [urlToken]);

  const handleSearch = async (searchToken?: string) => {
    const tokenToSearch = searchToken || token;
    if (!tokenToSearch.trim()) return;

    setLoading(true);
    setNotFound(false);
    setApplication(null);
    setMappedApplication(null);

    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('tracking_token', tokenToSearch.trim())
        .single();

      if (error || !data) {
        console.error('Error fetching application:', error);
        setNotFound(true);
      } else {
        console.log('Found application:', data);
        setApplication(data as ApplicationData);
        
        // Create mapped version for legacy components
        const mapped: MappedApplicationData = {
          ...data,
          status: mapDbStatusToTracking(data.status)
        };
        setMappedApplication(mapped);
      }
    } catch (error) {
      console.error('Error in handleSearch:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Track Your Application
            </h1>
            <p className="text-gray-600">
              Enter your tracking token to check the status of your job application
            </p>
          </div>

          <ApplicationSearch
            token={token}
            onTokenChange={setToken}
            onSearch={() => handleSearch()}
            loading={loading}
          />

          {notFound && <ApplicationNotFound />}

          {application && (
            <div className="space-y-6">
              <ApplicationTimeline application={application} />
              {mappedApplication && <ApplicationDetails application={mappedApplication} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationTracker;
