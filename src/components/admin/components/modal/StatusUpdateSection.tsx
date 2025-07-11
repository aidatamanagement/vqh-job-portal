import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { JobApplication } from '@/types';
import { getStatusText, getValidNextStatuses, validateStatusTransition } from '../../utils/submissionsUtils';
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { updateApplicationStatus, isUpdating } = useStatusUpdate();

  const allStatusOptions = [
    { value: 'application_submitted', label: 'Application Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interviewed', label: 'Interviewed' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'waiting_list', label: 'Waiting List' },
  ];

  const validNextStatuses = getValidNextStatuses(application.status);
  const statusOptions = allStatusOptions.filter(option => 
    validNextStatuses.includes(option.value)
  );

  const isTransitionValid = selectedStatus ? validateStatusTransition(application.status, selectedStatus) : false;

  const handleStatusUpdateClick = () => {
    if (!selectedStatus || selectedStatus === application.status || !isTransitionValid) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === application.status || !isTransitionValid) return;
    
    try {
      console.log('Updating status from modal:', { 
        applicationId: application.id, 
        currentStatus: application.status, 
        newStatus: selectedStatus 
      });
      
      const result = await updateApplicationStatus(application.id, selectedStatus as ApplicationStatus);
      
      if (result.success) {
        onUpdateStatus(application.id, selectedStatus as ApplicationStatus);
        
        // Check if job was deactivated due to hire
        const jobDeactivatedMessage = selectedStatus === 'hired' ? ' The job posting has been automatically deactivated.' : '';
        
        toast({
          title: "Status Updated Successfully",
          description: `Application status has been updated to ${getStatusText(selectedStatus)}. Email notification sent to candidate.${jobDeactivatedMessage}`,
        });
        
        setSelectedStatus('');
        setShowConfirmDialog(false);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: "Update Failed",
        description: `Failed to update application status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setShowConfirmDialog(false);
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
        
        {statusOptions.length === 0 ? (
          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
            No status transitions available from current status.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 max-w-xs">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full bg-white border-gray-300 focus:border-primary focus:ring-primary">
                  <SelectValue placeholder="Select new status..." />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50 max-h-60">
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="hover:bg-gray-100 cursor-pointer">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  onClick={handleStatusUpdateClick}
                  disabled={!selectedStatus || !isTransitionValid || isUpdating}
                  className="bg-primary hover:bg-primary/90 min-w-[100px] whitespace-nowrap"
                >
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to update the application status from{' '}
                    <strong>{getStatusText(application.status)}</strong> to{' '}
                    <strong>{selectedStatus ? getStatusText(selectedStatus) : ''}</strong>?
                    <br />
                    <br />
                    This will send an email notification to the candidate and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmStatusUpdate} disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : 'Confirm Update'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

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
