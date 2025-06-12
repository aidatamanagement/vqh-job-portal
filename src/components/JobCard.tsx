
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
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

  return (
    <Card className="job-card p-4 bg-white border border-gray-200 hover:border-primary/30 animate-fade-in-up">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
              {job.title}
            </h3>
            <p className="text-sm text-primary font-medium mt-1">
              {job.position}
            </p>
          </div>
          <div className="flex items-center text-gray-600 text-sm ml-4">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="whitespace-nowrap">{job.location}</span>
          </div>
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
          >
            View Details & Apply
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default JobCard;
