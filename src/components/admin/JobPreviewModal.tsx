
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MapPin, Calendar, Clock, Pin, Briefcase, Users, User } from 'lucide-react';
import { Job } from '@/types';

interface JobPreviewModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

const JobPreviewModal: React.FC<JobPreviewModalProps> = ({ job, isOpen, onClose }) => {
  if (!job) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gray-50 min-h-full">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Job Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8 animate-fade-in-up">
                <div className="space-y-4">
                  {/* Featured and deadline badges */}
                  {(job.isUrgent || job.applicationDeadline) && (
                    <div className="flex flex-wrap gap-2">
                      {job.isUrgent && (
                        <Badge variant="default" className="flex items-center gap-1 text-sm bg-blue-600 hover:bg-blue-700 text-white">
                          <Pin className="w-4 h-4" />
                          Featured Position
                        </Badge>
                      )}
                      {job.applicationDeadline && (
                        <Badge 
                          variant={
                            isDeadlinePassed(job.applicationDeadline) 
                              ? "destructive" 
                              : isDeadlineApproaching(job.applicationDeadline) 
                              ? "outline" 
                              : "secondary"
                          } 
                          className={`flex items-center gap-1 text-sm ${
                            isDeadlineApproaching(job.applicationDeadline) 
                              ? 'border-orange-400 text-orange-700' 
                              : ''
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          {formatDeadline(job.applicationDeadline)}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      {job.position}
                    </h1>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                      <div className="flex items-center" style={{ color: '#005586' }}>
                        <Briefcase className="w-4 h-4 mr-2" />
                        <span className="text-base">{job.position}</span>
                      </div>
                      <div className="flex flex-col" style={{ color: '#005586' }}>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-base">Office: {job.officeLocation}</span>
                        </div>
                        <span className="text-sm ml-6">Work: {job.workLocation}</span>
                      </div>
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
                        className="text-gray-700 leading-relaxed job-description-content" 
                        dangerouslySetInnerHTML={{ __html: job.description }} 
                      />
                    </div>
                  </Card>
                </div>

                {/* Job Overview */}
                <div className="lg:col-span-1">
                  <Card className="p-6 animate-slide-in-right">
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
                          <p className="text-sm font-medium text-gray-900">Locations</p>
                          <p className="text-sm text-gray-600">Office: {job.officeLocation}</p>
                          <p className="text-sm text-gray-600">Work: {job.workLocation}</p>
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

                      {job.applicationDeadline && (
                        <div className="flex items-start space-x-3">
                          <Clock className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Application Deadline</p>
                            <p className={`text-sm ${
                              isDeadlinePassed(job.applicationDeadline) 
                                ? 'text-red-600' 
                                : isDeadlineApproaching(job.applicationDeadline) 
                                ? 'text-orange-600' 
                                : 'text-gray-600'
                            }`}>
                              {new Date(job.applicationDeadline).toLocaleDateString()} at {new Date(job.applicationDeadline).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      )}

                      {job.hrManagerName && (
                        <div className="flex items-start space-x-3">
                          <User className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Manager</p>
                            <p className="text-sm text-gray-600">{job.hrManagerName}</p>
                          </div>
                        </div>
                      )}
                      
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

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Admin Preview</h4>
                      <p className="text-xs text-gray-500">
                        This is how the job appears to applicants on the public site.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobPreviewModal;
