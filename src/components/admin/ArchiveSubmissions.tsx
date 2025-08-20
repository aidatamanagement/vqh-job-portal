import React, { useState, useEffect } from 'react';
import { JobApplication } from '@/types';
import { useSubmissions } from './hooks/useSubmissions';
import SubmissionsFilters from './components/SubmissionsFilters';
import ApplicationDetailsModal from './components/ApplicationDetailsModal';
import FileViewerModal from './components/FileViewerModal';
import { useStatusUpdate } from '@/hooks/useStatusUpdate';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Archive, ArrowLeft, Eye, Trash2, FileText, Calendar, MapPin, User } from 'lucide-react';
import {
  getUniquePositions,
  getUniqueHrManagers,
  filterSubmissions,
  sortSubmissions,
  getStatusText
} from './utils/submissionsUtils';

const ArchiveSubmissions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filter to only show rejected applications
  const rejectedSubmissions = submissions.filter(submission => submission.status === 'rejected');
  
  const filteredSubmissions = sortSubmissions(
    filterSubmissions(rejectedSubmissions, searchTerm, 'rejected', positionFilter, locationFilter, hrManagerFilter),
    sortBy,
    sortOrder
  );
  
  const uniquePositions = getUniquePositions(rejectedSubmissions);
  const uniqueHrManagers = getUniqueHrManagers(rejectedSubmissions);

  const openFileViewer = (url: string, name: string) => {
    setViewingFile({ url, name });
  };

  const handleDeleteApplication = async (applicationId: string) => {
    await deleteApplication(applicationId);
    if (selectedApplication && selectedApplication.id === applicationId) {
      setSelectedApplication(null);
    }
  };

  const handleUpdateApplicationStatus = async (id: string, newStatus: 'application_submitted' | 'shortlisted_for_hr' | 'hr_interviewed' | 'shortlisted_for_manager' | 'manager_interviewed' | 'hired' | 'rejected' | 'waiting_list') => {
    toast({
      title: "Status Update Method Changed",
      description: "Please use the application details modal to update status with mandatory notes.",
      variant: "destructive",
    });
    console.log('Direct status updates are deprecated. Use the application details modal.');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="flex justify-center items-center h-64">
          <div className="spinner" />
          <span className="ml-2">Loading archived submissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 bg-[#005188] hover:bg-[#004070] text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Submissions
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="ml-2">
              {rejectedSubmissions.length} rejected
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters */}
      <SubmissionsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        positionFilter={positionFilter}
        setPositionFilter={setPositionFilter}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        statusFilter="rejected"
        setStatusFilter={() => {}} // Disabled for archive
        hrManagerFilter={hrManagerFilter}
        setHrManagerFilter={setHrManagerFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        positions={positions}
        locations={locations}
        uniqueHrManagers={uniqueHrManagers}
        isArchive={true}
      />

      {/* Archive Content */}
      {filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Archive className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Archived Submissions</h3>
            <p className="text-gray-500 text-center">
              {searchTerm || positionFilter !== 'all' || locationFilter !== 'all' || hrManagerFilter !== 'all'
                ? 'No rejected applications match your current filters.'
                : 'There are no rejected applications in the archive yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSubmissions.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.firstName} {application.lastName}
                      </h3>
                      <Badge variant="destructive">Rejected</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{application.appliedPosition}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{application.cityState || 'Location not specified'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Applied {formatDate(application.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>{application.coverLetter ? 'Cover letter included' : 'No cover letter'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Email: {application.email}</span>
                      <span>•</span>
                      <span>Phone: {application.phone}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApplication(application)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteApplication(application.id)}
                      disabled={deletingApplication === application.id}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingApplication === application.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

export default ArchiveSubmissions;
