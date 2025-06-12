
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Clock, Users } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import ApplicationModal from '@/components/ApplicationModal';

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobs } = useAppContext();
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const job = jobs.find(j => j.id === id);

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90">
            Back to Jobs
          </Button>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Jobs
          </Button>

          {/* Job Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8 animate-fade-in-up">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>
                <p className="text-xl text-primary font-semibold mb-1">
                  {job.position}
                </p>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="text-lg">{job.location}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {job.facilities.map((facility, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    {facility}
                  </Badge>
                ))}
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
                  <div 
                    className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br/>') }}
                  />
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    What We Offer
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Competitive salary and comprehensive benefits package
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Flexible scheduling options to support work-life balance
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Ongoing professional development and training opportunities
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Supportive team environment with interdisciplinary collaboration
                    </li>
                  </ul>
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
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Employment Type</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {job.facilities.map((facility, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs border-gray-300"
                          >
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleApplyNow}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3"
                  size="lg"
                >
                  Apply Now
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  By applying, you agree to our terms and conditions
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <ApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        job={job}
      />
    </div>
  );
};

export default JobDetails;
