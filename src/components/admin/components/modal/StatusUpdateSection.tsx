
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JobApplication } from '@/types';
import { getStatusText } from '../../utils/submissionsUtils';
import StatusTransitionValidator from '../../StatusTransitionValidator';
import { useStatusUpdate } from '@/hooks/useStatusUpdate';
import { toast } from '@/hooks/use-toast';

type ApplicationStatus = 'application_submitted' | 'under_review' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected' | 'waiting_list';

interface StatusUpdateSectionProps {
  application: JobApplication;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
}

const StatusUpdateSection: React.FC<StatusUpdateSectionProps> = ({
  application,
  onUpdateStatus
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const { updateApplicationStatus, isUpdating } = useStatusUpdate();

  const statusOptions = [
    { value: 'application_submitted', label: 'Application Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interviewed', label: 'Interviewed' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'waiting_list', label: 'Waiting List' },
  ];

  const validateTransition = (currentStatus: string, newStatus: string): boolean => {
    const validTransitions: Record<string, string[]> = {
      'application_submitted': ['under_review', 'rejected'],
      'under_review': ['shortlisted', 'rejected', 'waiting_list'],
      'shortlisted': ['interviewed', 'rejected', 'waiting_list'],
      'interviewed': ['hired', 'rejected', 'waiting_list'],
      'hired': [],
      'rejected': [],
      'waiting_list': ['under_review', 'shortlisted', 'interviewed', 'hired', 'rejected']
    };

    if (currentStatus === newStatus) return false;
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  };

  const isTransitionValid = selectedStatus ? validateTransition(application.status, selectedStatus) : false;

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === application.status || !isTransitionValid) return;
    
    try {
      console.log('Updating status from modal:', selectedStatus);
      const result = await updateApplicationStatus(application.id, selectedStatus as ApplicationStatus);
      
      if (result.success) {
        onUpdateStatus(application.id, selectedStatus as ApplicationStatus);
        
        toast({
          title: "Status Updated",
          description: `Application status has been updated to ${getStatusText(selectedStatus)}. Email notification sent to candidate.`,
        });
        
        setSelectedStatus('');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getEnhancedStatusBadge = (status: string) => {
    const baseClasses = "font-semibold px-3 py-1 text-sm border-2 shadow-sm rounded-lg";
    
    switch (status) {
      case 'hired':
        return `${baseClasses} bg-green-100 text-green-800 border-green-300`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800 border-red-300`;
      case 'shortlisted':
        return `${baseClasses} bg-blue-100 text-blue-800 border-blue-300`;
      case 'interviewed':
        return `${baseClasses} bg-purple-100 text-purple-800 border-purple-300`;
      case 'under_review':
        return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-300`;
      case 'waiting_list':
        return `${baseClasses} bg-orange-100 text-orange-800 border-orange-300`;
      case 'application_submitted':
        return `${baseClasses} bg-gray-100 text-gray-800 border-gray-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border-gray-300`;
    }
  };

  return (
    <div className="flex-1">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Update Application Status</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">Current Status:</span>
          <span className={getEnhancedStatusBadge(application.status)}>
            {getStatusText(application.status)}
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 max-w-xs">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full bg-white border-gray-300 focus:border-primary focus:ring-primary">
                <SelectValue placeholder="Select new status..." />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50 max-h-60">
                {statusOptions
                  .filter(option => option.value !== application.status)
                  .map((option) => (
                    <SelectItem key={option.value} value={option.value} className="hover:bg-gray-100 cursor-pointer">
                      {option.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleStatusUpdate}
            disabled={!selectedStatus || selectedStatus === application.status || !isTransitionValid || isUpdating}
            className="bg-primary hover:bg-primary/90 min-w-[100px] whitespace-nowrap"
          >
            {isUpdating ? 'Updating...' : 'Save Status'}
          </Button>
        </div>

        {selectedStatus && (
          <div className="mt-4">
            <StatusTransitionValidator
              currentStatus={application.status}
              newStatus={selectedStatus}
              isValid={isTransitionValid}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusUpdateSection;
