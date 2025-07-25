import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Pin } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Job, HRManager } from '@/types';
import { toast } from '@/hooks/use-toast';
import JobFilters from './JobFilters';
import ManageJobCard from './ManageJobCard';
import EditJobModal from './EditJobModal';
import JobPreviewModal from './JobPreviewModal';

const ManageJobs: React.FC = () => {
  const { jobs, applications, positions, locations, facilities, updateJob, deleteJob, fetchHRManagers, isDataLoading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterHRManager, setFilterHRManager] = useState('all');
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [previewingJob, setPreviewingJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState<Partial<Job> & { customFacility?: string }>({});
  const [hrManagers, setHRManagers] = useState<HRManager[]>([]);

  // Fetch Managers on component mount
  useEffect(() => {
    fetchHRManagers().then(setHRManagers);
  }, [fetchHRManagers]);

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== '' || filterPosition !== 'all' || filterLocation !== 'all' || filterStatus !== 'all' || filterHRManager !== 'all';

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterPosition('all');
    setFilterLocation('all');
    setFilterStatus('all');
    setFilterHRManager('all');
  };

  // Get application counts for each job
  const getApplicationCount = (jobId: string) => {
    return applications.filter(app => app.jobId === jobId).length;
  };

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job.hrManagerName && job.hrManagerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPosition = filterPosition === 'all' || job.position === filterPosition;
    const matchesLocation = filterLocation === 'all' || job.officeLocation === filterLocation;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && job.isActive) ||
                         (filterStatus === 'inactive' && !job.isActive);
    const matchesHRManager = filterHRManager === 'all' || job.hrManagerId === filterHRManager;
    
    return matchesSearch && matchesPosition && matchesLocation && matchesStatus && matchesHRManager;
  }).sort((a, b) => {
    // First priority: Featured jobs come first
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    
    // Second priority: Sort by creation date (newest first)
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  const toggleJobStatus = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const success = await updateJob(jobId, { isActive: !job.isActive });
    
    if (success) {
      toast({
        title: "Job Status Updated",
        description: `Job "${job.position}" in ${job.officeLocation} is now ${job.isActive ? 'inactive' : 'active'}`,
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
    if (job && window.confirm(`Are you sure you want to delete "${job.position}" in ${job.officeLocation}?`)) {
      const success = await deleteJob(jobId);
      
      if (success) {
        toast({
          title: "Job Deleted",
          description: `"${job.position}" in ${job.officeLocation} has been permanently deleted`,
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
      description: job.description,
      position: job.position,
      officeLocation: job.officeLocation,
      workLocation: job.workLocation,
      facilities: [...job.facilities],
      isUrgent: job.isUrgent || false,
      applicationDeadline: job.applicationDeadline ? 
        new Date(job.applicationDeadline).toISOString().slice(0, 16) : '',
      hrManagerId: job.hrManagerId || '',
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

  const handleAddCustomFacility = () => {
    const customFacility = jobForm.customFacility?.trim();
    if (customFacility) {
      const currentFacilities = jobForm.facilities || [];
      if (!currentFacilities.includes(customFacility)) {
        setJobForm(prev => ({ 
          ...prev, 
          facilities: [...currentFacilities, customFacility],
          customFacility: ''
        }));
      }
    }
  };

  const saveJobChanges = async () => {
    if (!editingJob || !jobForm.description || !jobForm.position || !jobForm.officeLocation || !jobForm.workLocation || !jobForm.hrManagerId) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields including both location fields and Manager",
        variant: "destructive",
      });
      return;
    }

    // Validate featured job limit
    const currentJobIsFeatured = editingJob.isUrgent || false;
    const otherFeaturedJobs = jobs.filter(job => job.isUrgent && job.id !== editingJob.id).length;
    const newFeaturedCount = otherFeaturedJobs + (jobForm.isUrgent ? 1 : 0);
    
    if (jobForm.isUrgent && newFeaturedCount > 4) {
      toast({
        title: "Featured Job Limit Reached",
        description: "You can only have a maximum of 4 featured jobs. Please unfeature another job first.",
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
      description: jobForm.description,
      position: jobForm.position,
      officeLocation: jobForm.officeLocation,
      workLocation: jobForm.workLocation,
      facilities: jobForm.facilities,
      isUrgent: jobForm.isUrgent,
      applicationDeadline: jobForm.applicationDeadline || null,
      hrManagerId: jobForm.hrManagerId,
    };

    console.log('Updating job with data:', updateData);

    const success = await updateJob(editingJob.id, updateData);
    
    if (success) {
      setEditingJob(null);
      setJobForm({});
      
      toast({
        title: "Job Updated",
        description: `"${jobForm.position}" in ${jobForm.officeLocation} has been successfully updated${jobForm.isUrgent ? ' and marked as featured' : ''}${jobForm.applicationDeadline ? ' with deadline set' : ''}`,
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
        <div className="flex items-center space-x-3 animate-fade-in-up">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-lg flex items-center justify-center">
            <Briefcase className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900" style={{ fontSize: '1.3rem' }}>Manage Jobs</h1>
          </div>
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
      <div className="flex items-center space-x-3 animate-fade-in-up">
        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-lg flex items-center justify-center">
          <Briefcase className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900" style={{ fontSize: '1.3rem' }}>Manage Jobs</h1>
        </div>
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
        filterHRManager={filterHRManager}
        setFilterHRManager={setFilterHRManager}
        positions={positions}
        locations={locations}
        hrManagers={hrManagers}
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
              {searchTerm || filterPosition !== 'all' || filterLocation !== 'all' || filterStatus !== 'all' || filterHRManager !== 'all'
                ? "Try adjusting your search criteria" 
                : "No jobs have been posted yet"
              }
            </p>
          </Card>
        ) : (
          filteredJobs.map((job, index) => {
            const isFeatured = job.isUrgent;
            const previousJob = index > 0 ? filteredJobs[index - 1] : null;
            const showSeparator = isFeatured && previousJob && !previousJob.isUrgent;
            
            return (
              <React.Fragment key={job.id}>
                {/* Separator between featured and regular jobs */}
                {showSeparator && (
                  <div className="my-4 border-t border-gray-300">
                    <div className="text-center -mt-3">
                      <span className="bg-white px-4 text-sm text-gray-500">Other Positions</span>
                    </div>
                  </div>
                )}
                
                <ManageJobCard
                  job={job}
                  applicationCount={getApplicationCount(job.id)}
                  index={index}
                  onToggleStatus={toggleJobStatus}
                  onEdit={openEditModal}
                  onDelete={handleDeleteJob}
                  onPreview={openPreviewModal}
                />
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Edit Job Modal */}
      <EditJobModal
        editingJob={editingJob}
        jobForm={jobForm}
        positions={positions}
        locations={locations}
        facilities={facilities}
        hrManagers={hrManagers}
        onClose={() => setEditingJob(null)}
        onInputChange={handleJobInputChange}
        onFacilityToggle={handleFacilityToggle}
        onSave={saveJobChanges}
        onAddCustomFacility={handleAddCustomFacility}
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
