
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Job } from '@/types';
import { toast } from '@/hooks/use-toast';
import { jobService } from '@/services/jobService';
import { supabase } from '@/integrations/supabase/client';
import JobFilters from './JobFilters';
import ManageJobCard from './ManageJobCard';
import EditJobModal from './EditJobModal';

const ManageJobs: React.FC = () => {
  const { jobs, setJobs, applications, positions, locations, isAuthenticated } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState<Partial<Job>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Reload jobs when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      loadJobs();
    }
  }, [isAuthenticated]);

  const loadJobs = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        const mappedJobs = data.map(j => ({
          id: j.id,
          title: j.title,
          description: j.description,
          position: j.position,
          location: j.location,
          facilities: j.facilities || [],
          isActive: j.is_active,
          isUrgent: j.is_urgent,
          applicationDeadline: j.application_deadline,
          createdAt: j.created_at,
          updatedAt: j.updated_at,
        }));
        setJobs(mappedJobs);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    if (!isAuthenticated) return;

    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      await jobService.updateJob(jobId, { isActive: !job.isActive });
      
      setJobs(prev => prev.map(j => 
        j.id === jobId 
          ? { ...j, isActive: !j.isActive, updatedAt: new Date().toISOString() }
          : j
      ));
      
      toast({
        title: "Job Status Updated",
        description: `Job "${job.title}" is now ${job.isActive ? 'inactive' : 'active'}`,
      });
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!isAuthenticated) return;

    const job = jobs.find(j => j.id === jobId);
    if (job && window.confirm(`Are you sure you want to delete "${job.title}"?`)) {
      try {
        await jobService.deleteJob(jobId);
        setJobs(prev => prev.filter(j => j.id !== jobId));
        toast({
          title: "Job Deleted",
          description: `"${job.title}" has been permanently deleted`,
        });
      } catch (error) {
        console.error('Error deleting job:', error);
        toast({
          title: "Error",
          description: "Failed to delete job",
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
      applicationDeadline: job.applicationDeadline || '',
    });
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
    if (!editingJob || !jobForm.title || !jobForm.description || !jobForm.position || !jobForm.location || !isAuthenticated) {
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

    try {
      await jobService.updateJob(editingJob.id, jobForm);

      setJobs(prev => prev.map(job => 
        job.id === editingJob.id 
          ? {
              ...job,
              ...jobForm,
              updatedAt: new Date().toISOString(),
            }
          : job
      ));

      setEditingJob(null);
      setJobForm({});
      
      toast({
        title: "Job Updated",
        description: `"${jobForm.title}" has been successfully updated`,
      });
    } catch (error) {
      console.error('Error updating job:', error);
      toast({
        title: "Error",
        description: "Failed to update job",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600">Please log in to manage jobs.</p>
      </Card>
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
        positions={positions}
        locations={locations}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
      />

      {/* Jobs List */}
      <div className="space-y-3 sm:space-y-4">
        {isLoading ? (
          <Card className="p-6 sm:p-8 text-center animate-fade-in">
            <p className="text-gray-600">Loading jobs...</p>
          </Card>
        ) : filteredJobs.length === 0 ? (
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
              onDelete={deleteJob}
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
    </div>
  );
};

export default ManageJobs;
