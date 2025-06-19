
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, AlertTriangle, Building2 } from 'lucide-react';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {job.title}
            {job.isUrgent && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Urgent
              </Badge>
            )}
            <Badge variant={job.isActive ? "default" : "secondary"}>
              {job.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="w-5 h-5" />
              <span className="font-medium">Position:</span>
              <span>{job.position}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Location:</span>
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Posted:</span>
              <span>{formatDate(job.createdAt)}</span>
            </div>
            {job.applicationDeadline && (
              <div className={`flex items-center gap-2 ${
                isDeadlinePassed(job.applicationDeadline) ? 'text-red-600' : 
                isDeadlineApproaching(job.applicationDeadline) ? 'text-orange-600' : 'text-gray-600'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-medium">Deadline:</span>
                <span>{formatDate(job.applicationDeadline)}</span>
              </div>
            )}
          </div>

          {/* Facilities */}
          {job.facilities && job.facilities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Facilities</h3>
              <div className="flex flex-wrap gap-2">
                {job.facilities.map((facility, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {facility}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Job Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
            <div 
              className="prose max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </div>

          {/* Status Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Status:</span>
                <span className={`ml-2 ${job.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                  {job.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className="font-medium">Priority:</span>
                <span className={`ml-2 ${job.isUrgent ? 'text-red-600' : 'text-gray-500'}`}>
                  {job.isUrgent ? 'Urgent' : 'Normal'}
                </span>
              </div>
              <div>
                <span className="font-medium">Created:</span>
                <span className="ml-2 text-gray-600">{formatDate(job.createdAt)}</span>
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>
                <span className="ml-2 text-gray-600">{formatDate(job.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobPreviewModal;
