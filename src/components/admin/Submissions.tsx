
import React, { useState } from 'react';
import { JobApplication } from '@/types';
import { useSubmissions } from './hooks/useSubmissions';
import SubmissionsHeader from './components/SubmissionsHeader';
import SubmissionsFilters from './components/SubmissionsFilters';
import SubmissionsStatusTabs from './components/SubmissionsStatusTabs';
import ApplicationDetailsModal from './components/ApplicationDetailsModal';
import FileViewerModal from './components/FileViewerModal';
import {
  getUniquePositions,
  filterSubmissions
} from './utils/submissionsUtils';

const Submissions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [viewingFile, setViewingFile] = useState<{ url: string; name: string } | null>(null);

  const {
    submissions,
    loading,
    deletingApplication,
    deleteApplication,
    updateApplicationStatus
  } = useSubmissions();

  const filteredSubmissions = filterSubmissions(submissions, searchTerm, statusFilter, positionFilter);
  const uniquePositions = getUniquePositions(submissions);

  const openFileViewer = (url: string, name: string) => {
    setViewingFile({ url, name });
  };

  const handleDeleteApplication = async (applicationId: string) => {
    await deleteApplication(applicationId);
    // Close the details modal if the deleted application was selected
    if (selectedApplication && selectedApplication.id === applicationId) {
      setSelectedApplication(null);
    }
  };

  const handleUpdateApplicationStatus = async (id: string, newStatus: 'waiting' | 'approved' | 'rejected') => {
    await updateApplicationStatus(id, newStatus);
    // Update the selected application if it's currently being viewed
    if (selectedApplication && selectedApplication.id === id) {
      setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-slide-up">
        <SubmissionsHeader />
        <div className="flex justify-center items-center h-64">
          <div className="spinner" />
          <span className="ml-2">Loading submissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <SubmissionsHeader />

      {/* Filters */}
      <SubmissionsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        positionFilter={positionFilter}
        setPositionFilter={setPositionFilter}
        uniquePositions={uniquePositions}
      />

      {/* Status Tabs with Counts */}
      <SubmissionsStatusTabs
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        filteredSubmissions={filteredSubmissions}
        onViewApplication={setSelectedApplication}
        onDeleteApplication={handleDeleteApplication}
        deletingApplication={deletingApplication}
        submissions={submissions}
      />

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        selectedApplication={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onUpdateStatus={handleUpdateApplicationStatus}
        onDeleteApplication={handleDeleteApplication}
        onOpenFileViewer={openFileViewer}
        deletingApplication={deletingApplication}
      />

      {/* File Viewer Modal */}
      <FileViewerModal
        viewingFile={viewingFile}
        onClose={() => setViewingFile(null)}
      />
    </div>
  );
};

export default Submissions;
