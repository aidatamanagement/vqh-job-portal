import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Job } from '@/types';
import { toast } from '@/hooks/use-toast';
import JobFilters from './JobFilters';
import ManageJobCard from './ManageJobCard';
import EditJobModal from './EditJobModal';
import JobPreviewModal from './JobPreviewModal';

const ManageJobs: React.FC = () => {
  const { jobs, applications, positions, locations, updateJob, deleteJob, isDataLoading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [previewingJob, setPreviewingJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState<Partial<Job>>({});

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== '' || filterPosition !== 'all' || filterLocation !== 'all' || filterStatus !== 'all';

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterPosition('all');
    setFilterLocation('all');
    setFilterStatus('all');
  };

  // Get application counts for each job
  const getApplicationCount = (jobId: string) => {
    return applications.filter(app => app.jobId === jobId).length;
  };

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = filterPosition === 'all' || job.position === filterPosition;
    const matchesLocation = filterLocation === 'all' || job.location === filterLocation;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && job.isActive) ||
                         (filterStatus === 'inactive' && !job.isActive);
    
    return matchesSearch && matchesPosition && matchesLocation && matchesStatus;
  });

  const toggleJobStatus = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const success = await updateJob(jobId, { isActive: !job.isActive });
    
    if (success) {
      toast({
        title: "Job Status Updated",
        description: `Job "${job.title}" is now ${job.isActive ? 'inactive' : 'active'}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update job status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job && window.confirm(`Are you sure you want to delete "${job.title}"?`)) {
      const success = await deleteJob(jobId);
      
      if (success) {
        toast({
          title: "Job Deleted",
          description: `"${job.title}" has been permanently deleted`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete job. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      description: job.description,
      position: job.position,
      location: job.location,
      facilities: [...job.facilities],
      isUrgent: job.isUrgent || false,
      applicationDeadline: job.applicationDeadline ? 
        new Date(job.applicationDeadline).toISOString().slice(0, 16) : '',
    });
  };

  const openPreviewModal = (job: Job) => {
    setPreviewingJob(job);
  };

  const closePreviewModal = () => {
    setPreviewingJob(null);
  };

  const handleJobInputChange = (field: string, value: string | string[] | boolean) => {
    setJobForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFacilityToggle = (facility: string) => {
    const currentFacilities = jobForm.facilities || [];
    const newFacilities = currentFacilities.includes(facility)
      ? currentFacilities.filter(f => f !== facility)
      : [...currentFacilities, facility];
    
    setJobForm(prev => ({ ...prev, facilities: newFacilities }));
  };

  const saveJobChanges = async () => {
    if (!editingJob || !jobForm.title || !jobForm.description || !jobForm.position || !jobForm.location) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate deadline if provided
    if (jobForm.applicationDeadline) {
      const deadlineDate = new Date(jobForm.applicationDeadline);
      const now = new Date();
      if (deadlineDate <= now) {
        toast({
          title: "Invalid Deadline",
          description: "Application deadline must be in the future",
          variant: "destructive",
        });
        return;
      }
    }

    const updateData: Partial<Job> = {
      title: jobForm.title,
      description: jobForm.description,
      position: jobForm.position,
      location: jobForm.location,
      facilities: jobForm.facilities,
      isUrgent: jobForm.isUrgent,
      applicationDeadline: jobForm.applicationDeadline || null,
    };

    console.log('Updating job with data:', updateData);

    const success = await updateJob(editingJob.id, updateData);
    
    if (success) {
      setEditingJob(null);
      setJobForm({});
      
      toast({
        title: "Job Updated",
        description: `"${jobForm.title}" has been successfully updated${jobForm.isUrgent ? ' and marked as urgent' : ''}${jobForm.applicationDeadline ? ' with deadline set' : ''}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update job. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading state while data is being fetched
  if (isDataLoading) {
    return (
      <div className="space-y-4 lg:space-y-6 p-2 sm:p-0">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-in-up">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#005586' }}>
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-bold text-gray-900 text-lg sm:text-xl lg:text-2xl">Manage Jobs</h1>
        </div>

        {/* Loading skeleton for filters */}
        <Skeleton className="h-20 w-full" />

        {/* Loading skeleton for jobs */}
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-2 sm:p-0">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="p-2 rounded-lg" style={{ backgroundColor: '#005586' }}>
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-bold text-gray-900 text-lg sm:text-xl lg:text-2xl">Manage Jobs</h1>
      </div>

      {/* Filters */}
      <JobFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterPosition={filterPosition}
        setFilterPosition={setFilterPosition}
        filterLocation={filterLocation}
        setFilterLocation={setFilterLocation}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        positions={positions}
        locations={locations}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
      />

      {/* Jobs List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredJobs.length === 0 ? (
          <Card className="p-6 sm:p-8 text-center animate-fade-in">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-sm sm:text-base text-gray-600">
              {searchTerm || filterPosition !== 'all' || filterLocation !== 'all' || filterStatus !== 'all'
                ? "Try adjusting your search criteria" 
                : "No jobs have been posted yet"
              }
            </p>
          </Card>
        ) : (
          filteredJobs.map((job, index) => (
            <ManageJobCard
              key={job.id}
              job={job}
              applicationCount={getApplicationCount(job.id)}
              index={index}
              onToggleStatus={toggleJobStatus}
              onEdit={openEditModal}
              onDelete={handleDeleteJob}
              onPreview={openPreviewModal}
            />
          ))
        )}
      </div>

      {/* Edit Job Modal */}
      <EditJobModal
        editingJob={editingJob}
        jobForm={jobForm}
        positions={positions}
        locations={locations}
        onClose={() => setEditingJob(null)}
        onInputChange={handleJobInputChange}
        onFacilityToggle={handleFacilityToggle}
        onSave={saveJobChanges}
      />

      {/* Job Preview Modal */}
      <JobPreviewModal
        job={previewingJob}
        isOpen={!!previewingJob}
        onClose={closePreviewModal}
      />
    </div>
  );
};

export default ManageJobs;
