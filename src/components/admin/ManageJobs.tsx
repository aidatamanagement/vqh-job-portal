import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  MapPin,
  Calendar,
  Briefcase,
  X,
  Plus,
  FilterX,
  MoreVertical
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Job } from '@/types';
import { toast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const ManageJobs: React.FC = () => {
  const { jobs, setJobs, applications, positions, locations } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingJob, setEditingJob] = useState<Job | null>(null);
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

  const toggleJobStatus = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, isActive: !job.isActive, updatedAt: new Date().toISOString() }
        : job
    ));
    
    const job = jobs.find(j => j.id === jobId);
    toast({
      title: "Job Status Updated",
      description: `Job "${job?.title}" is now ${job?.isActive ? 'inactive' : 'active'}`,
    });
  };

  const deleteJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job && window.confirm(`Are you sure you want to delete "${job.title}"?`)) {
      setJobs(prev => prev.filter(j => j.id !== jobId));
      toast({
        title: "Job Deleted",
        description: `"${job.title}" has been permanently deleted`,
      });
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
    });
  };

  const handleJobInputChange = (field: string, value: string | string[]) => {
    setJobForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFacilityToggle = (facility: string) => {
    const currentFacilities = jobForm.facilities || [];
    const newFacilities = currentFacilities.includes(facility)
      ? currentFacilities.filter(f => f !== facility)
      : [...currentFacilities, facility];
    
    setJobForm(prev => ({ ...prev, facilities: newFacilities }));
  };

  const saveJobChanges = () => {
    if (!editingJob || !jobForm.title || !jobForm.description || !jobForm.position || !jobForm.location) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

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
  };

  const defaultFacilities = ['Full-time', 'Part-time', 'Remote', 'Flexible Schedule', 'Benefits', 'Training Provided'];

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
      <Card className="p-3 sm:p-4 lg:p-6 animate-fade-in">
        <div className="space-y-3 sm:space-y-4">
          {/* Search - Full width on mobile */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Filters - Stack on mobile, grid on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Select value={filterPosition} onValueChange={setFilterPosition}>
              <SelectTrigger>
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map((position) => (
                  <SelectItem key={position.id} value={position.name}>
                    {position.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.name}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <FilterX className="w-4 h-4" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

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
            <Card key={job.id} className="p-3 sm:p-4 lg:p-6 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:justify-between">
                <div className="flex-1 space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">{job.title}</h3>
                      <p className="text-primary font-medium text-sm sm:text-base">{job.position}</p>
                    </div>
                    
                    {/* Status toggle - Desktop only */}
                    <div className="hidden sm:flex items-center justify-end space-x-2">
                      <span className="text-sm text-gray-600">
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <Switch
                        checked={job.isActive}
                        onCheckedChange={() => toggleJobStatus(job.id)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>

                  {/* Job details - Stack on mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span>{getApplicationCount(job.id)} applications</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons - Mobile with switch and dropdown */}
                <div className="flex sm:hidden items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Switch
                      checked={job.isActive}
                      onCheckedChange={() => toggleJobStatus(job.id)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.open(`/job/${job.id}`, '_blank')}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Job
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditModal(job)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Job
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteJob(job.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Job
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Desktop action buttons */}
                <div className="hidden sm:flex items-center space-x-2 ml-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/job/${job.id}`, '_blank')}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(job)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteJob(job.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Edit Job Modal - Responsive */}
      <Dialog open={!!editingJob} onOpenChange={() => setEditingJob(null)}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 pr-6">
              Edit Job: {editingJob?.title}
            </DialogTitle>
          </DialogHeader>

          {editingJob && (
            <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <div>
                <Label htmlFor="edit-title" className="text-sm font-medium">Job Title *</Label>
                <Input
                  id="edit-title"
                  value={jobForm.title || ''}
                  onChange={(e) => handleJobInputChange('title', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-position" className="text-sm font-medium">Position Category *</Label>
                  <Select 
                    value={jobForm.position || ''} 
                    onValueChange={(value) => handleJobInputChange('position', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position.id} value={position.name}>
                          {position.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-location" className="text-sm font-medium">Location *</Label>
                  <Select 
                    value={jobForm.location || ''} 
                    onValueChange={(value) => handleJobInputChange('location', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description" className="text-sm font-medium">Job Description *</Label>
                <Textarea
                  id="edit-description"
                  value={jobForm.description || ''}
                  onChange={(e) => handleJobInputChange('description', e.target.value)}
                  className="mt-1 min-h-[150px] sm:min-h-[200px] rich-editor"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Employment Type & Benefits</Label>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {defaultFacilities.map((facility) => (
                    <div key={facility} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${facility}`}
                        checked={(jobForm.facilities || []).includes(facility)}
                        onCheckedChange={() => handleFacilityToggle(facility)}
                      />
                      <Label htmlFor={`edit-${facility}`} className="text-sm">
                        {facility}
                      </Label>
                    </div>
                  ))}
                </div>

                {(jobForm.facilities || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(jobForm.facilities || []).map((facility) => (
                      <Badge
                        key={facility}
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1 text-xs"
                      >
                        {facility}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1 hover:bg-transparent"
                          onClick={() => handleFacilityToggle(facility)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setEditingJob(null)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveJobChanges}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageJobs;
