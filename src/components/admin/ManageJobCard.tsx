
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
  Pin,
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

  const getDeadlineStatus = (deadline: string) => {
    if (isDeadlinePassed(deadline)) return 'passed';
    if (isDeadlineApproaching(deadline)) return 'approaching';
    return 'normal';
  };

  const getCardBackgroundClass = (deadline: string) => {
    const status = getDeadlineStatus(deadline);
    switch (status) {
      case 'passed':
        return 'bg-red-50 border-red-200 shadow-red-100';
      case 'approaching':
        return 'bg-orange-50 border-orange-200 shadow-orange-100';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getDeadlineTextClass = (deadline: string) => {
    const status = getDeadlineStatus(deadline);
    switch (status) {
      case 'passed':
        return 'text-red-700 font-medium';
      case 'approaching':
        return 'text-orange-700 font-medium';
      default:
        return 'text-gray-600';
    }
  };

  const getDeadlineBadgeClass = (deadline: string) => {
    const status = getDeadlineStatus(deadline);
    switch (status) {
      case 'passed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'approaching':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <Card className={`p-3 sm:p-4 lg:p-6 animate-fade-in transition-all duration-300 ${job.applicationDeadline ? getCardBackgroundClass(job.applicationDeadline) : 'bg-white border-gray-200'}`} style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2 sm:space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">{job.position}</h3>
                {job.isUrgent && (
                  <Badge variant="default" className="flex items-center gap-1 text-xs bg-primary hover:bg-primary/90 text-white">
                    <Pin className="w-3 h-3" />
                    Featured
                  </Badge>
                )}
              </div>
              {job.applicationDeadline && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`flex items-center gap-1 text-xs border ${getDeadlineBadgeClass(job.applicationDeadline)}`}>
                    <Clock className="w-3 h-3" />
                    {getDeadlineStatus(job.applicationDeadline) === 'passed' ? 'DEADLINE' : 
                     getDeadlineStatus(job.applicationDeadline) === 'approaching' ? 'DEADLINE' : 
                     'Deadline'}
                  </Badge>
                  <span className={`text-sm ${getDeadlineTextClass(job.applicationDeadline)}`}>
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
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
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Office: {job.officeLocation}</span>
              </div>
              <div className="flex items-center space-x-1 ml-5">
                <span className="truncate text-xs">Work: {job.workLocation}</span>
              </div>
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
            variant="default"
            size="sm"
            onClick={() => onPreview(job)}
            className="bg-primary hover:bg-primary/90 text-white"
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
