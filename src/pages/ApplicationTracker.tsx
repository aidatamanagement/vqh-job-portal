import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Clock, User, Mail, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';

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
        // Transform the data to match ApplicationData interface with proper type casting
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default' as const;
      case 'rejected':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Not Selected';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Application Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="trackingToken">Tracking Token</Label>
                  <Input
                    id="trackingToken"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Enter your tracking token (e.g., abc123de-f456-789g-h012-ijk345lmn678)"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleManualSearch}
                    disabled={loading || !manualToken.trim()}
                    className="w-full sm:w-auto"
                  >
                    {loading ? 'Searching...' : 'Track Application'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="spinner" />
              <span className="ml-2">Loading application details...</span>
            </div>
          )}

          {searched && !loading && !application && (
            <Card>
              <CardContent className="text-center py-12">
                <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Application Not Found
                </h3>
                <p className="text-gray-600">
                  We couldn't find an application with this tracking token. 
                  Please check the token and try again.
                </p>
              </CardContent>
            </Card>
          )}

          {application && (
            <div className="space-y-6">
              {/* Status Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {getStatusIcon(application.status)}
                    Application Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <Badge variant={getStatusBadgeVariant(application.status)} className="text-sm px-3 py-1">
                        {getStatusText(application.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      Last updated: {formatDate(application.updated_at)}
                    </div>
                  </div>

                  {application.status === 'waiting' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800">
                        Your application is currently under review. We'll update the status as soon as possible.
                      </p>
                    </div>
                  )}

                  {application.status === 'approved' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800">
                        Congratulations! Your application has been approved. We'll contact you soon with next steps.
                      </p>
                    </div>
                  )}

                  {application.status === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800">
                        Thank you for your interest. While we've decided not to move forward with your application at this time, we encourage you to apply for future opportunities.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Application Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Application Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Applicant Name</p>
                        <p className="font-semibold">{application.first_name} {application.last_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-semibold">{application.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-semibold">{application.phone || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-semibold">{application.city_state || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Position Applied</p>
                        <p className="font-semibold">{application.applied_position}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Application Submitted</p>
                        <p className="font-semibold">{formatDate(application.created_at)}</p>
                      </div>
                    </div>

                    {application.earliest_start_date && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Earliest Start Date</p>
                          <p className="font-semibold">
                            {new Date(application.earliest_start_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Application Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Application Submitted</p>
                        <p className="text-sm text-gray-500">{formatDate(application.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        application.status !== 'waiting' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <CheckCircle className={`w-4 h-4 ${
                          application.status !== 'waiting' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          application.status !== 'waiting' ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          Application Reviewed
                        </p>
                        <p className="text-sm text-gray-500">
                          {application.status !== 'waiting' 
                            ? formatDate(application.updated_at)
                            : 'Pending review'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        application.status === 'approved' ? 'bg-green-100' : 
                        application.status === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        {application.status === 'approved' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : application.status === 'rejected' ? (
                          <XCircle className="w-4 h-4 text-red-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          application.status !== 'waiting' ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          Final Decision
                        </p>
                        <p className="text-sm text-gray-500">
                          {application.status === 'approved' ? 'Application approved' :
                           application.status === 'rejected' ? 'Application not selected' :
                           'Decision pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationTracker;
