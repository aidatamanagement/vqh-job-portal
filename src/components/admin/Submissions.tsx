import React, { useState, useEffect } from 'react';
import { JobApplication } from '@/types';
import { useSubmissions } from './hooks/useSubmissions';
import SubmissionsHeader from './components/SubmissionsHeader';
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

  const filteredSubmissions = sortSubmissions(
    filterSubmissions(submissions, searchTerm, statusFilter, positionFilter, 'all', hrManagerFilter),
    sortBy,
    sortOrder
  );
  const uniquePositions = getUniquePositions(submissions);
  const uniqueHrManagers = getUniqueHrManagers(submissions);

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

  const handleUpdateApplicationStatus = async (id: string, newStatus: 'application_submitted' | 'under_review' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected' | 'waiting_list') => {
    try {
      console.log('Updating application status from Submissions:', { id, newStatus });
      const result = await updateApplicationStatus(id, newStatus);
      
      if (result.success) {
        // Refresh the submissions list to get updated data
        await refreshSubmissions();
        
        // Update the selected application if it's currently being viewed
        // This prevents the modal from closing and reopening
        if (selectedApplication && selectedApplication.id === id) {
          setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null);
        }
        
        // Check if job was deactivated due to hire
        const jobDeactivatedMessage = newStatus === 'hired' ? ' The job posting has been automatically deactivated.' : '';
        
        toast({
          title: "Status Updated",
          description: `Application status updated to ${getStatusText(newStatus)}. Email notification sent to candidate.${jobDeactivatedMessage}`,
        });
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
        locationFilter={'all'}
        setLocationFilter={() => {}}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        hrManagerFilter={hrManagerFilter}
        setHrManagerFilter={setHrManagerFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        positions={positions}
        locations={[]}
        uniqueHrManagers={uniqueHrManagers}
      />

      {/* Submissions Table */}
      <SubmissionsStatusTabs
        statusFilter={statusFilter}
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
