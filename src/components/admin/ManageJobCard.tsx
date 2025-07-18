
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  MapPin,
  Calendar,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Job } from '@/types';

interface ManageJobCardProps {
  job: Job;
  applicationCount: number;
  index: number;
  onToggleStatus: (jobId: string) => void;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onPreview: (job: Job) => void;
}

const ManageJobCard: React.FC<ManageJobCardProps> = ({
  job,
  applicationCount,
  index,
  onToggleStatus,
  onEdit,
  onDelete,
  onPreview,
}) => {
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
    <Card className="p-3 sm:p-4 lg:p-6 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2 sm:space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">{job.position}</h3>
                {job.isUrgent && (
                  <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    Urgent
                  </Badge>
                )}
              </div>
              {job.applicationDeadline && (
                <p className={`text-xs flex items-center gap-1 mt-1 ${
                  isDeadlinePassed(job.applicationDeadline) ? 'text-red-600' : 
                  isDeadlineApproaching(job.applicationDeadline) ? 'text-orange-600' : 'text-gray-600'
                }`}>
                  <Clock className="w-3 h-3" />
                  Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                </p>
              )}
            </div>
            
            {/* Status toggle - Desktop only */}
            <div className="hidden sm:flex items-center justify-end space-x-2">
              <span className="text-sm text-gray-600">
                {job.isActive ? 'Active' : 'Inactive'}
              </span>
              <Switch
                checked={job.isActive}
                onCheckedChange={() => onToggleStatus(job.id)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>

          {/* Job details - Stack on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>{applicationCount} applications</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Action buttons - Mobile with switch and dropdown */}
        <div className="flex sm:hidden items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {job.isActive ? 'Active' : 'Inactive'}
            </span>
            <Switch
              checked={job.isActive}
              onCheckedChange={() => onToggleStatus(job.id)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPreview(job)}>
                <Eye className="w-4 h-4 mr-2" />
                View Job
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(job)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Job
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(job.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop action buttons */}
        <div className="hidden sm:flex items-center space-x-2 ml-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPreview(job)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(job)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(job.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ManageJobCard;
