
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search, 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  Phone,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { JobApplication } from '@/types';

const ApplicationTracker: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchApplication();
    }
  }, [token]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      console.log('Fetching application with token:', token);

      const { data: applicationData, error: appError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('tracking_token', token)
        .maybeSingle();

      if (appError) {
        console.error('Error fetching application:', appError);
        setError('Failed to fetch application details');
        return;
      }

      if (!applicationData) {
        setError('Application not found. Please check your tracking link.');
        return;
      }

      // Transform the data to match our interface
      const transformedApplication: JobApplication = {
        id: applicationData.id,
        jobId: applicationData.job_id,
        firstName: applicationData.first_name,
        lastName: applicationData.last_name,
        email: applicationData.email,
        phone: applicationData.phone || '',
        appliedPosition: applicationData.applied_position,
        earliestStartDate: applicationData.earliest_start_date || '',
        cityState: applicationData.city_state || '',
        coverLetter: applicationData.cover_letter || '',
        status: applicationData.status as 'waiting' | 'approved' | 'rejected',
        resumeUrl: '',
        additionalDocsUrls: applicationData.additional_docs_urls || [],
        notes: '',
        createdAt: applicationData.created_at,
        updatedAt: applicationData.updated_at,
      };

      setApplication(transformedApplication);

      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', applicationData.job_id)
        .maybeSingle();

      if (jobError) {
        console.error('Error fetching job:', jobError);
      } else if (jobData) {
        setJob({
          id: jobData.id,
          title: jobData.title,
          description: jobData.description,
          position: jobData.position,
          location: jobData.location,
          facilities: jobData.facilities || [],
          isActive: jobData.is_active,
          isUrgent: jobData.is_urgent || false,
          applicationDeadline: jobData.application_deadline,
          createdAt: jobData.created_at,
          updatedAt: jobData.updated_at,
        });
      }
    } catch (error) {
      console.error('Error in fetchApplication:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Not Selected';
      default:
        return 'Under Review';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="spinner" />
          <span className="text-gray-600">Loading your application...</span>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Application Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'We couldn\'t find an application with this tracking link.'}
          </p>
          <Link to="/">
            <Button className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Search className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Application Status</h1>
                <p className="text-sm text-gray-600">Track your job application progress</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Status Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Application Status
                  </h2>
                  <p className="text-sm text-gray-600">
                    Submitted on {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={`${getStatusColor(application.status)} border text-sm px-3 py-1`}>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(application.status)}
                    <span>{getStatusText(application.status)}</span>
                  </div>
                </Badge>
              </div>

              {/* Status Timeline */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Application Submitted</p>
                    <p className="text-sm text-gray-600">
                      {new Date(application.createdAt).toLocaleDateString()} at{' '}
                      {new Date(application.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {application.status === 'waiting' ? (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Application Under Review</p>
                    <p className="text-sm text-gray-600">
                      {application.status === 'waiting' 
                        ? 'Your application is currently being reviewed by our team'
                        : 'Review completed'
                      }
                    </p>
                  </div>
                </div>

                {application.status !== 'waiting' && (
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(application.status)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {application.status === 'approved' ? 'Application Approved' : 'Application Decision'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {application.status === 'approved' 
                          ? 'Congratulations! We\'ll be in touch soon regarding next steps.'
                          : 'Thank you for your interest. We\'ll keep your profile for future opportunities.'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Job Details Card */}
            {job && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{job.title}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Contact Information Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{application.firstName} {application.lastName}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{application.email}</span>
                </div>
                {application.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{application.phone}</span>
                  </div>
                )}
                {application.cityState && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{application.cityState}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have questions about your application status, please contact our HR team.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>careers@hospicecare.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>(555) 123-4567</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationTracker;
