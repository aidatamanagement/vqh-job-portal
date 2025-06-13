
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';
import { Job } from '@/types';
import { useNavigate } from 'react-router-dom';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const navigate = useNavigate();

  const truncateDescription = (text: string, maxWords: number = 18) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const handleViewDetails = () => {
    navigate(`/job/${job.id}`);
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
      return 'Deadline passed';
    } else if (daysUntilDeadline === 0) {
      return 'Deadline today';
    } else if (daysUntilDeadline === 1) {
      return 'Deadline tomorrow';
    } else if (daysUntilDeadline <= 7) {
      return `${daysUntilDeadline} days left`;
    } else {
      return `Deadline: ${deadlineDate.toLocaleDateString()}`;
    }
  };

  return (
    <Card className="job-card p-4 bg-white border border-gray-200 hover:border-primary/30 animate-fade-in-up">
      <div className="space-y-3">
        {/* Urgent and deadline badges */}
        {(job.isUrgent || job.applicationDeadline) && (
          <div className="flex flex-wrap gap-2">
            {job.isUrgent && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Urgent
              </Badge>
            )}
            {job.applicationDeadline && (
              <Badge 
                variant={isDeadlinePassed(job.applicationDeadline) ? "destructive" : 
                        isDeadlineApproaching(job.applicationDeadline) ? "outline" : "secondary"}
                className={`flex items-center gap-1 ${
                  isDeadlineApproaching(job.applicationDeadline) ? 'border-orange-400 text-orange-700' : ''
                }`}
              >
                <Clock className="w-3 h-3" />
                {formatDeadline(job.applicationDeadline)}
              </Badge>
            )}
          </div>
        )}

        {/* Position and Location */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-primary font-medium">
            {job.position}
          </p>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="whitespace-nowrap">{job.location}</span>
          </div>
        </div>

        {/* Job Title */}
        <div>
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
            {job.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed">
          {truncateDescription(job.description)}
        </p>

        {/* Facilities/Tags */}
        <div className="flex flex-wrap gap-2">
          {job.facilities.map((facility, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {facility}
            </Badge>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button 
            onClick={handleViewDetails}
            className="w-full bg-primary hover:bg-primary/90 text-white"
            size="sm"
            disabled={job.applicationDeadline && isDeadlinePassed(job.applicationDeadline)}
          >
            {job.applicationDeadline && isDeadlinePassed(job.applicationDeadline) 
              ? 'Application Closed' 
              : 'View Details & Apply'
            }
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default JobCard;
