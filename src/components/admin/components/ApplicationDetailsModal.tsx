
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, ExternalLink, Trash2 } from 'lucide-react';
import { JobApplication } from '@/types';
import { formatDate, getStatusBadgeVariant, getStatusText } from '../utils/submissionsUtils';
import StatusTransitionValidator from '../StatusTransitionValidator';

interface ApplicationDetailsModalProps {
  selectedApplication: JobApplication | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'application_submitted' | 'under_review' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected' | 'waiting_list') => void;
  onDeleteApplication: (applicationId: string) => void;
  onOpenFileViewer: (url: string, name: string) => void;
  deletingApplication: string | null;
}

const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  selectedApplication,
  onClose,
  onUpdateStatus,
  onDeleteApplication,
  onOpenFileViewer,
  deletingApplication
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!selectedApplication) return null;

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

  const isTransitionValid = selectedStatus ? validateTransition(selectedApplication.status, selectedStatus) : false;

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === selectedApplication.status || !isTransitionValid) return;
    
    setIsUpdating(true);
    try {
      await onUpdateStatus(selectedApplication.id, selectedStatus as any);
      setSelectedStatus(''); // Reset selection after successful update
    } finally {
      setIsUpdating(false);
    }
  };

  // Enhanced status badge with more vibrant colors
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
    <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto m-2">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-lg sm:text-xl">Application Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Candidate Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Candidate Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2">{selectedApplication.firstName} {selectedApplication.lastName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 break-all">{selectedApplication.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2">{selectedApplication.phone}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <span className="ml-2">{selectedApplication.cityState}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Earliest Start Date:</span>
                  <span className="ml-2">{selectedApplication.earliestStartDate ? formatDate(selectedApplication.earliestStartDate) : 'Not specified'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Application Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Applied Position:</span>
                  <span className="ml-2">{selectedApplication.appliedPosition}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Applied Date:</span>
                  <span className="ml-2">{formatDate(selectedApplication.createdAt)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Current Status:</span>
                  <Badge 
                    variant={getStatusBadgeVariant(selectedApplication.status)}
                    className="ml-2 text-xs font-medium px-3 py-1"
                  >
                    {getStatusText(selectedApplication.status)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Cover Letter</h3>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <div className="text-gray-700 whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{ __html: selectedApplication.coverLetter }} />
            </div>
          </div>

          {/* Attachments */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Attachments</h3>
            <div className="space-y-2">
              {selectedApplication.resumeUrl && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium text-sm">Resume</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenFileViewer(selectedApplication.resumeUrl!, 'Resume')}
                      className="text-xs px-2 py-1"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">View Online</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedApplication.resumeUrl, '_blank')}
                      className="text-xs px-2 py-1"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
              
              {selectedApplication.additionalDocsUrls.map((docUrl, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium text-sm">Additional Document {index + 1}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenFileViewer(docUrl, `Additional Document ${index + 1}`)}
                      className="text-xs px-2 py-1"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">View Online</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(docUrl, '_blank')}
                      className="text-xs px-2 py-1"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Update and Delete Section */}
          <div className="border-t pt-4">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Status Update Section - Left Side */}
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Update Application Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-gray-700">Current Status:</span>
                    <span className={getEnhancedStatusBadge(selectedApplication.status)}>
                      {getStatusText(selectedApplication.status)}
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
                            .filter(option => option.value !== selectedApplication.status)
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
                      disabled={!selectedStatus || selectedStatus === selectedApplication.status || !isTransitionValid || isUpdating}
                      className="bg-primary hover:bg-primary/90 min-w-[100px] whitespace-nowrap"
                    >
                      {isUpdating ? 'Updating...' : 'Save Status'}
                    </Button>
                  </div>

                  {/* Status Transition Validation */}
                  {selectedStatus && (
                    <div className="mt-4">
                      <StatusTransitionValidator
                        currentStatus={selectedApplication.status}
                        newStatus={selectedStatus}
                        isValid={isTransitionValid}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Delete Action - Right Side */}
              <div className="lg:w-auto">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={deletingApplication === selectedApplication.id}
                      className="text-sm px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 whitespace-nowrap"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deletingApplication === selectedApplication.id ? 'Deleting...' : 'Delete Application'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Application</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this application from {selectedApplication.firstName} {selectedApplication.lastName}? 
                        This will permanently delete the application record and all uploaded files. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteApplication(selectedApplication.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Application
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDetailsModal;
