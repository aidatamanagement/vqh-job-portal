
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileText, Download, ExternalLink, Trash2 } from 'lucide-react';
import { JobApplication } from '@/types';
import { formatDate, getStatusBadgeVariant, getStatusText } from '../utils/submissionsUtils';

interface ApplicationDetailsModalProps {
  selectedApplication: JobApplication | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'waiting' | 'approved' | 'rejected') => void;
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
  if (!selectedApplication) return null;

  return (
    <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto m-2">
        <DialogHeader>
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
                    className="ml-2 text-xs"
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={() => onUpdateStatus(selectedApplication.id, 'approved')}
              disabled={selectedApplication.status === 'approved'}
              className="bg-green-600 hover:bg-green-700 text-sm px-4 py-2"
            >
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => onUpdateStatus(selectedApplication.id, 'rejected')}
              disabled={selectedApplication.status === 'rejected'}
              className="text-sm px-4 py-2"
            >
              Reject
            </Button>
            <Button
              variant="outline"
              onClick={() => onUpdateStatus(selectedApplication.id, 'waiting')}
              disabled={selectedApplication.status === 'waiting'}
              className="text-sm px-4 py-2"
            >
              Mark as Pending
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={deletingApplication === selectedApplication.id}
                  className="text-sm px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Application
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
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDetailsModal;
