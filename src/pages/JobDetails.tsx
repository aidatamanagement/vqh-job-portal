import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Clock, Users, AlertTriangle, Briefcase, Info } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import ApplicationModal from '@/components/ApplicationModal';
import Header from '@/components/Header';
import CursorGlow from '@/components/CursorGlow';

const JobDetails: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    jobs
  } = useAppContext();
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const job = jobs.find(j => j.id === id);
  if (!job) {
    return (
      <div className="min-h-screen bg-white relative">
        <CursorGlow />
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
            <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90">
              Back to Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }
  const handleBack = () => {
    navigate('/');
  };
  const handleApplyNow = () => {
    setShowApplicationModal(true);
  };
  const isDeadlineApproaching = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 7 && daysUntilDeadline > 0;
  };
  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };
  const formatDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDeadline < 0) {
      return 'Applications have closed';
    } else if (daysUntilDeadline === 0) {
      return 'Applications close today';
    } else if (daysUntilDeadline === 1) {
      return 'Applications close tomorrow';
    } else if (daysUntilDeadline <= 7) {
      return `Applications close in ${daysUntilDeadline} days`;
    } else {
      return `Applications close on ${deadlineDate.toLocaleDateString()}`;
    }
  };
  const isApplicationDisabled = job.applicationDeadline && isDeadlinePassed(job.applicationDeadline);
  return (
    <div className="min-h-screen bg-white relative">
      <CursorGlow />
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <Button variant="ghost" onClick={handleBack} className="mb-6 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Jobs
            </Button>

            {/* Job Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8 animate-fade-in-up">
              <div className="space-y-4">
                {/* Urgent and deadline badges */}
                {(job.isUrgent || job.applicationDeadline) && <div className="flex flex-wrap gap-2">
                    {job.isUrgent && <Badge variant="destructive" className="flex items-center gap-1 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Urgent Position
                      </Badge>}
                    {job.applicationDeadline && <Badge variant={isDeadlinePassed(job.applicationDeadline) ? "destructive" : isDeadlineApproaching(job.applicationDeadline) ? "outline" : "secondary"} className={`flex items-center gap-1 text-sm ${isDeadlineApproaching(job.applicationDeadline) ? 'border-orange-400 text-orange-700' : ''}`}>
                        <Clock className="w-4 h-4" />
                        {formatDeadline(job.applicationDeadline)}
                      </Badge>}
                  </div>}

                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {job.title}
                  </h1>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                    <div className="flex items-center" style={{ color: '#005586' }}>
                      <Briefcase className="w-4 h-4 mr-2" />
                      <span className="text-base">{job.position}</span>
                    </div>
                    <div className="flex items-center" style={{ color: '#005586' }}>
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-base">{job.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {job.facilities.map((facility, index) => <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {facility}
                    </Badge>)}
                </div>
              </div>
            </div>

            {/* Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Job Description */}
              <div className="lg:col-span-2">
                <Card className="p-8 animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Job Description
                  </h2>
                  <div className="prose prose-gray max-w-none">
                    <div className="text-gray-700 leading-relaxed job-description-content" dangerouslySetInnerHTML={{
                    __html: job.description
                  }} />
                  </div>
                </Card>
              </div>

              {/* Sticky Application Box */}
              <div className="lg:col-span-1">
                <Card className="p-6 sticky top-24 animate-slide-in-right">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Job Overview
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <Users className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Position</p>
                        <p className="text-sm text-gray-600">{job.position}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">{job.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Posted</p>
                        <p className="text-sm text-gray-600">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {job.applicationDeadline && <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Application Deadline</p>
                          <p className={`text-sm ${isDeadlinePassed(job.applicationDeadline) ? 'text-red-600' : isDeadlineApproaching(job.applicationDeadline) ? 'text-orange-600' : 'text-gray-600'}`}>
                            {new Date(job.applicationDeadline).toLocaleDateString()} at {new Date(job.applicationDeadline).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                          </p>
                        </div>
                      </div>}

                    {job.hrManagerName && <div className="flex items-start space-x-3">
                        <Users className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">HR Manager</p>
                          <p className="text-sm text-gray-600">{job.hrManagerName}</p>
                        </div>
                      </div>}
                    
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Position Information</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {job.facilities.map((facility, index) => <Badge key={index} variant="outline" className="text-xs border-gray-300">
                              {facility}
                            </Badge>)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleApplyNow} disabled={isApplicationDisabled} className={`w-full font-semibold py-3 ${isApplicationDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-white'}`} size="lg">
                    {isApplicationDisabled ? 'Applications Closed' : 'Apply Now'}
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    {isApplicationDisabled ? 'The application deadline has passed' : 'By applying, you agree to our terms and conditions'}
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Application Modal */}
        <ApplicationModal isOpen={showApplicationModal} onClose={() => setShowApplicationModal(false)} job={job} />
      </div>
    </div>
  );
};
export default JobDetails;
