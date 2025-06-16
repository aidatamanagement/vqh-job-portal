import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Inbox } from 'lucide-react';
import { JobApplication } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import SubmissionsFilters from './components/SubmissionsFilters';
import SubmissionsTable from './components/SubmissionsTable';
import ApplicationDetailsModal from './components/ApplicationDetailsModal';
import FileViewerModal from './components/FileViewerModal';
import {
  getResumeUrl,
  getUniquePositions,
  filterSubmissions,
  getSubmissionsByStatus,
  getStatusCount,
  deleteApplicationFiles,
  deleteApplicationFromDatabase,
  updateApplicationStatusInDatabase
} from './utils/submissionsUtils';

const Submissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [viewingFile, setViewingFile] = useState<{ url: string; name: string } | null>(null);
  const [deletingApplication, setDeletingApplication] = useState<string | null>(null);

  // Fetch submissions from Supabase
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      console.log('Fetching submissions from Supabase...');

      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        toast({
          title: "Error",
          description: "Failed to load submissions. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Fetched submissions:', data);

      // Transform data to match the expected format
      const transformedSubmissions: JobApplication[] = data.map(item => ({
        id: item.id,
        jobId: item.job_id,
        firstName: item.first_name,
        lastName: item.last_name,
        email: item.email,
        phone: item.phone || '',
        appliedPosition: item.applied_position,
        earliestStartDate: item.earliest_start_date || '',
        cityState: item.city_state || '',
        coverLetter: item.cover_letter || '',
        resumeUrl: getResumeUrl(item.id),
        additionalDocsUrls: item.additional_docs_urls || [],
        status: item.status as 'waiting' | 'approved' | 'rejected',
        notes: '',
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      setSubmissions(transformedSubmissions);
    } catch (error) {
      console.error('Error in fetchSubmissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete application and associated files
  const deleteApplication = async (applicationId: string) => {
    try {
      setDeletingApplication(applicationId);
      console.log('=== STARTING COMPLETE APPLICATION DELETION ===');
      console.log('Application ID:', applicationId);

      const application = submissions.find(app => app.id === applicationId);
      if (!application) {
        console.error('Application not found in local state');
        toast({
          title: "Error",
          description: "Application not found.",
          variant: "destructive",
        });
        return;
      }

      console.log('Found application to delete:', {
        id: application.id,
        name: `${application.firstName} ${application.lastName}`,
        email: application.email
      });

      // Step 1: Delete files from storage (non-critical)
      console.log('Step 1: Attempting to delete files from storage...');
      try {
        const filesDeleted = await deleteApplicationFiles(applicationId);
        if (filesDeleted) {
          console.log('✓ Files deleted successfully from storage');
        } else {
          console.warn('⚠ Some files may not have been deleted from storage');
        }
      } catch (storageError) {
        console.warn('⚠ Storage deletion failed, but continuing:', storageError);
      }

      // Step 2: Delete the application record from the database (CRITICAL)
      console.log('Step 2: Deleting record from database...');
      const result = await deleteApplicationFromDatabase(applicationId);
      console.log('✓ Database deletion result:', result);

      // Step 3: Update local state ONLY after successful database deletion
      console.log('Step 3: Updating local state...');
      setSubmissions(prev => {
        const updated = prev.filter(app => app.id !== applicationId);
        console.log(`Local state updated - removed 1 application, ${updated.length} remaining`);
        return updated;
      });

      // Close the details modal if the deleted application was selected
      if (selectedApplication && selectedApplication.id === applicationId) {
        setSelectedApplication(null);
        console.log('✓ Closed application details modal');
      }

      console.log('=== APPLICATION DELETION COMPLETED SUCCESSFULLY ===');
      
      toast({
        title: "Application Deleted",
        description: `Successfully deleted application from ${application.firstName} ${application.lastName}`,
      });

    } catch (error) {
      console.error('=== APPLICATION DELETION FAILED ===');
      console.error('Error details:', error);
      
      toast({
        title: "Deletion Failed",
        description: `Failed to delete application: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setDeletingApplication(null);
    }
  };

  // Update application status in Supabase
  const updateApplicationStatus = async (id: string, newStatus: 'waiting' | 'approved' | 'rejected') => {
    try {
      await updateApplicationStatusInDatabase(id, newStatus);

      // Update local state
      setSubmissions(prev => prev.map(app => 
        app.id === id 
          ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
          : app
      ));

      if (selectedApplication && selectedApplication.id === id) {
        setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null);
      }

      toast({
        title: "Status Updated",
        description: `Application status has been updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error in updateApplicationStatus:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update application status. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filteredSubmissions = filterSubmissions(submissions, searchTerm, statusFilter, positionFilter);
  const uniquePositions = getUniquePositions(submissions);

  const openFileViewer = (url: string, name: string) => {
    setViewingFile({ url, name });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#005586' }}>
              <Inbox className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-bold text-gray-900 text-lg sm:text-xl lg:text-2xl">Submissions</h1>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="spinner" />
          <span className="ml-2">Loading submissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#005586' }}>
            <Inbox className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-bold text-gray-900 text-lg sm:text-xl lg:text-2xl">Submissions</h1>
        </div>
      </div>

      {/* Filters */}
      <SubmissionsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        positionFilter={positionFilter}
        setPositionFilter={setPositionFilter}
        uniquePositions={uniquePositions}
      />

      {/* Status Tabs with Counts */}
      <Tabs 
        value={statusFilter} 
        onValueChange={setStatusFilter}
        className="w-full animate-slide-up-delayed-2"
      >
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="all" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
            <span>All</span>
            <Badge variant="secondary" className="text-xs">
              {getStatusCount(submissions, 'all')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="waiting" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
            <span>Pending</span>
            <Badge variant="secondary" className="text-xs">
              {getStatusCount(submissions, 'waiting')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
            <span>Approved</span>
            <Badge variant="secondary" className="text-xs">
              {getStatusCount(submissions, 'approved')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
            <span>Rejected</span>
            <Badge variant="secondary" className="text-xs">
              {getStatusCount(submissions, 'rejected')}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <SubmissionsTable
            submissions={getSubmissionsByStatus(filteredSubmissions, 'all')}
            onViewApplication={setSelectedApplication}
            onDeleteApplication={deleteApplication}
            deletingApplication={deletingApplication}
          />
        </TabsContent>

        <TabsContent value="waiting" className="mt-6">
          <SubmissionsTable
            submissions={getSubmissionsByStatus(filteredSubmissions, 'waiting')}
            onViewApplication={setSelectedApplication}
            onDeleteApplication={deleteApplication}
            deletingApplication={deletingApplication}
          />
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <SubmissionsTable
            submissions={getSubmissionsByStatus(filteredSubmissions, 'approved')}
            onViewApplication={setSelectedApplication}
            onDeleteApplication={deleteApplication}
            deletingApplication={deletingApplication}
          />
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <SubmissionsTable
            submissions={getSubmissionsByStatus(filteredSubmissions, 'rejected')}
            onViewApplication={setSelectedApplication}
            onDeleteApplication={deleteApplication}
            deletingApplication={deletingApplication}
          />
        </TabsContent>
      </Tabs>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        selectedApplication={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onUpdateStatus={updateApplicationStatus}
        onDeleteApplication={deleteApplication}
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
