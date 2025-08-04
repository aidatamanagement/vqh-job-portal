
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { 
  X,
  Pin,
  Clock,
  Users
} from 'lucide-react';
import { Job, JobPosition, JobLocation, JobFacility, HRManager } from '@/types';
import { useAppContext } from '@/contexts/AppContext';

interface EditJobModalProps {
  editingJob: Job | null;
  jobForm: Partial<Job> & { customFacility?: string };
  positions: JobPosition[];
  locations: JobLocation[];
  facilities: JobFacility[];
  hrManagers: HRManager[];
  onClose: () => void;
  onInputChange: (field: string, value: string | string[] | boolean) => void;
  onFacilityToggle: (facility: string) => void;
  onSave: () => void;
  onAddCustomFacility?: () => void;
}

const EditJobModal: React.FC<EditJobModalProps> = ({
  editingJob,
  jobForm,
  positions,
  locations,
  facilities,
  hrManagers,
  onClose,
  onInputChange,
  onFacilityToggle,
  onSave,
  onAddCustomFacility,
}) => {
  const { fetchHRManagers, jobs } = useAppContext();
  const [filteredManagers, setFilteredManagers] = useState<HRManager[]>(hrManagers);

  // Fetch managers when modal opens or when editingJob changes
  useEffect(() => {
    if (editingJob && jobForm.officeLocation) {
      fetchHRManagers(jobForm.officeLocation).then(setFilteredManagers);
    }
  }, [editingJob, jobForm.officeLocation, fetchHRManagers]);

  // Fetch managers when office location changes
  useEffect(() => {
    if (jobForm.officeLocation) {
      fetchHRManagers(jobForm.officeLocation).then(managers => {
        setFilteredManagers(managers);
        
        // Check if the current manager is still valid for the new location
      if (jobForm.hrManagerId) {
          const currentManagerExists = managers.some(manager => manager.id === jobForm.hrManagerId);
          if (!currentManagerExists) {
            // Only clear if the current manager is not available for the new location
        onInputChange('hrManagerId', '');
      }
        }
      });
    } else {
      // If no office location selected, clear managers and manager selection
      setFilteredManagers([]);
      if (jobForm.hrManagerId) {
        onInputChange('hrManagerId', '');
      }
    }
  }, [jobForm.officeLocation, fetchHRManagers, jobForm.hrManagerId, onInputChange]);

  // Check current number of featured jobs (excluding current job if it's already featured)
  const getCurrentFeaturedJobsCount = () => {
    const currentJobIsFeatured = editingJob?.isUrgent || false;
    const otherFeaturedJobs = jobs.filter(job => job.isUrgent && job.id !== editingJob?.id).length;
    return otherFeaturedJobs + (currentJobIsFeatured ? 1 : 0);
  };

  // Check if we can add another featured job
  const canAddFeaturedJob = () => {
    const currentFeaturedCount = getCurrentFeaturedJobsCount();
    return currentFeaturedCount < 4;
  };

  return (
    <Dialog open={!!editingJob} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 pr-6">
            Edit Job: {editingJob?.position} in {editingJob?.officeLocation}
          </DialogTitle>
        </DialogHeader>

        {editingJob && (
          <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-position" className="text-sm font-medium">Position Category *</Label>
                <Select 
                  value={jobForm.position || ''} 
                  onValueChange={(value) => onInputChange('position', value)}
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
                <Label htmlFor="edit-officeLocation" className="text-sm font-medium">Office Location *</Label>
                <Select 
                  value={jobForm.officeLocation || ''} 
                  onValueChange={(value) => onInputChange('officeLocation', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select office location" />
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

              <div>
                <Label htmlFor="edit-workLocation" className="text-sm font-medium">Work Location *</Label>
                <Input
                  id="edit-workLocation"
                  type="text"
                  value={jobForm.workLocation || ''}
                  onChange={(e) => onInputChange('workLocation', e.target.value)}
                  placeholder="e.g., Remote, On-site, Hybrid, Field work, etc."
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Where the actual work will be performed
                </p>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="edit-hrManager" className="text-sm font-medium">Hiring Manager *</Label>
                <Select 
                  value={jobForm.hrManagerId || ''} 
                  onValueChange={(value) => onInputChange('hrManagerId', value)}
                  disabled={!jobForm.officeLocation}
                >
                  <SelectTrigger className="mt-1 h-auto min-h-[40px] py-2">
                    <SelectValue placeholder={
                      !jobForm.officeLocation 
                        ? "Select office location first" 
                        : filteredManagers.length === 0 
                          ? "Loading Managers..." 
                          : "Select Manager"
                    } />
                  </SelectTrigger>
                  <SelectContent className="w-full max-w-md">
                    {filteredManagers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        <div className="flex items-center space-x-3 w-full">
                          <div className="flex-shrink-0">
                            {manager.profile_image_url ? (
                              <img
                                src={manager.profile_image_url}
                                alt={manager.name}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  // Fallback to initials if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary ${manager.profile_image_url ? 'hidden' : ''}`}>
                              {manager.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium truncate">{manager.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {manager.role === 'admin' ? 'Admin' : 'HR Manager'}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span className="truncate">{manager.email}</span>
                              {manager.location && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600">{manager.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                                    <p className="text-xs text-gray-500 mt-1">
                      {!jobForm.officeLocation 
                        ? "Please select an office location first to see available hiring managers"
                        : "Hiring manager will handle all applicants for this job"
                      }
                    </p>
              </div>
            </div>

            {/* Priority and Deadline Settings */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Priority & Timing</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id="edit-urgent"
                    checked={jobForm.isUrgent || false}
                    onCheckedChange={(checked) => onInputChange('isUrgent', checked as boolean)}
                      disabled={!canAddFeaturedJob() && !jobForm.isUrgent}
                  />
                  <div className="flex items-center space-x-2">
                      <Pin className="w-4 h-4 text-blue-600" />
                    <Label htmlFor="edit-urgent" className="text-sm font-medium">
                        Mark as Featured Job
                    </Label>
                    </div>
                    <div className="ml-auto text-xs text-gray-500">
                      {getCurrentFeaturedJobsCount()}/4 featured jobs
                    </div>
                  </div>
                  {!canAddFeaturedJob() && !jobForm.isUrgent && (
                    <p className="text-xs text-red-600 mt-1">
                      Featured job limit reached. Unfeature another job to add this one as featured.
                    </p>
                  )}

                <div>
                  <Label htmlFor="edit-deadline" className="flex items-center space-x-2 text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Application Deadline</span>
                  </Label>
                  <Input
                    id="edit-deadline"
                    type="datetime-local"
                    value={jobForm.applicationDeadline || ''}
                    onChange={(e) => onInputChange('applicationDeadline', e.target.value)}
                    className="mt-1"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description" className="text-sm font-medium">Job Description *</Label>
              <div className="mt-1">
                <RichTextEditor
                  value={jobForm.description || ''}
                  onChange={(value) => onInputChange('description', value)}
                  placeholder="Enter the job description..."
                  className="min-h-[200px]"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Employment Type & Benefits</Label>
              <div className="mt-3 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {facilities.map((facility) => (
                    <div key={facility.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${facility.id}`}
                        checked={(jobForm.facilities || []).includes(facility.name)}
                        onCheckedChange={() => onFacilityToggle(facility.name)}
                      />
                      <Label htmlFor={`edit-${facility.id}`} className="text-sm">
                        {facility.name}
                      </Label>
                    </div>
                  ))}
                </div>

                {/* Custom facility */}
                <div className="flex space-x-2">
                  <Input
                    value={jobForm.customFacility || ''}
                    onChange={(e) => onInputChange('customFacility', e.target.value)}
                    placeholder="Add custom benefit or requirement"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={onAddCustomFacility}
                    variant="outline"
                    size="sm"
                    disabled={!jobForm.customFacility?.trim()}
                  >
                    Add
                  </Button>
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
                          onClick={() => onFacilityToggle(facility)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={onSave}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditJobModal;
