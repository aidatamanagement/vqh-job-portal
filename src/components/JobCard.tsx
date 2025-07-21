
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle } from 'lucide-react';
import { Job } from '@/types';
import { useNavigate } from 'react-router-dom';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const navigate = useNavigate();

  const stripHtmlAndTruncate = (html: string, maxWords: number = 18) => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get text content without HTML tags
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Split into words and truncate
    const words = textContent.split(' ');
    if (words.length <= maxWords) return textContent;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const handleViewDetails = () => {
    navigate(`/job/${job.id}`);
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  return (
    <Card className="job-card p-4 bg-white border border-gray-200 hover:border-primary/30 animate-fade-in-up flex flex-col h-full">
      <div className="space-y-3 flex-1 flex flex-col">
        {/* Position and Location */}
        <div className="flex justify-between items-center">
          <p className="text-base font-semibold text-gray-900">
            {job.position}
          </p>
          <div className="flex flex-col items-end text-gray-600 text-sm">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="whitespace-nowrap">Office: {job.officeLocation}</span>
            </div>
            <span className="text-xs whitespace-nowrap">Work: {job.workLocation}</span>
          </div>
        </div>

        {/* Job Title */}
        <div>
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
            {job.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed flex-1">
          {stripHtmlAndTruncate(job.description)}
        </p>

        {/* Urgent badge and Facilities/Tags */}
        <div className="flex flex-wrap gap-2">
          {job.isUrgent && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Urgent
            </Badge>
          )}
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
        <div className="pt-2 mt-auto">
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
