
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { JobApplication } from '@/types';
import CandidateInformation from './modal/CandidateInformation';
import ApplicationInformation from './modal/ApplicationInformation';
import CoverLetterSection from './modal/CoverLetterSection';
import AttachmentsSection from './modal/AttachmentsSection';
import StatusUpdateSection from './modal/StatusUpdateSection';
import DeleteApplicationSection from './modal/DeleteApplicationSection';
import StatusHistoryTimeline from './StatusHistoryTimeline';

type ApplicationStatus = 'application_submitted' | 'under_review' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected' | 'waiting_list';

interface ApplicationDetailsModalProps {
  selectedApplication: JobApplication | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
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
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-lg sm:text-xl">Application Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Candidate and Application Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CandidateInformation application={selectedApplication} />
            <ApplicationInformation application={selectedApplication} />
          </div>

          {/* Cover Letter */}
          <CoverLetterSection 
            coverLetter={selectedApplication.coverLetter} 
            coverLetterUrl={selectedApplication.coverLetterUrl}
            onOpenFileViewer={onOpenFileViewer}
          />

          {/* Attachments */}
          <AttachmentsSection
            resumeUrl={selectedApplication.resumeUrl}
            additionalDocsUrls={selectedApplication.additionalDocsUrls}
            onOpenFileViewer={onOpenFileViewer}
          />

          {/* Status History Timeline */}
          <StatusHistoryTimeline applicationId={selectedApplication.id} />

          {/* Status Update and Delete Section */}
          <div className="border-t pt-4">
            <div className="flex flex-col lg:flex-row gap-6">
              <StatusUpdateSection
                application={selectedApplication}
                onUpdateStatus={onUpdateStatus}
              />
              <DeleteApplicationSection
                application={selectedApplication}
                onDeleteApplication={onDeleteApplication}
                deletingApplication={deletingApplication}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDetailsModal;
