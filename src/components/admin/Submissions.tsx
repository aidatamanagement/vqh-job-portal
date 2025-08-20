import React, { useState, useEffect } from 'react';
import { JobApplication } from '@/types';
import { useSubmissions } from './hooks/useSubmissions';
import SubmissionsFilters from './components/SubmissionsFilters';
import SubmissionsStatusTabs from './components/SubmissionsStatusTabs';
import ApplicationDetailsModal from './components/ApplicationDetailsModal';
import FileViewerModal from './components/FileViewerModal';
import { useStatusUpdate } from '@/hooks/useStatusUpdate';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import {
  getUniquePositions,
  getUniqueHrManagers,
  filterSubmissions,
  sortSubmissions,
  getStatusText
} from './utils/submissionsUtils';

const Submissions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [hrManagerFilter, setHrManagerFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'position' | 'hrManager'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [viewingFile, setViewingFile] = useState<{ url: string; name: string } | null>(null);

  const {
    submissions,
    loading,
    deletingApplication,
    deleteApplication,
    refreshSubmissions
  } = useSubmissions();

  const { updateApplicationStatus } = useStatusUpdate();
  const { positions, locations, fetchMasterData } = useAppContext();

  // Fetch master data on component mount
  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  // Filter out rejected applications from main submissions page
  const activeSubmissions = submissions.filter(submission => submission.status !== 'rejected');

  const filteredSubmissions = sortSubmissions(
    filterSubmissions(activeSubmissions, searchTerm, statusFilter, positionFilter, locationFilter, hrManagerFilter),
    sortBy,
    sortOrder
  );
  const uniquePositions = getUniquePositions(activeSubmissions);
  const uniqueHrManagers = getUniqueHrManagers(activeSubmissions);

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

  const handleUpdateApplicationStatus = async (
    id: string,
    newStatus: 'application_submitted' | 'shortlisted_for_hr' | 'hr_interviewed' | 'shortlisted_for_manager' | 'manager_interviewed' | 'hired' | 'rejected' | 'waiting_list'
  ) => {
    // Modal already performed the update and toasts; simply close the modal here
    setSelectedApplication(null);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="flex justify-center items-center h-64">
          <div className="spinner" />
          <span className="ml-2">Loading submissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Filters */}
      <SubmissionsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        positionFilter={positionFilter}
        setPositionFilter={setPositionFilter}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        hrManagerFilter={hrManagerFilter}
        setHrManagerFilter={setHrManagerFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        positions={positions}
        locations={locations}
        uniqueHrManagers={uniqueHrManagers}
      />

      {/* Submissions Table */}
      <SubmissionsStatusTabs
        statusFilter={statusFilter}
        filteredSubmissions={filteredSubmissions}
        onViewApplication={setSelectedApplication}
        onDeleteApplication={handleDeleteApplication}
        deletingApplication={deletingApplication}
        submissions={activeSubmissions}
      />

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        selectedApplication={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onUpdateStatus={handleUpdateApplicationStatus}
        onDeleteApplication={handleDeleteApplication}
        onOpenFileViewer={openFileViewer}
        deletingApplication={deletingApplication}
        refreshSubmissions={refreshSubmissions}
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
