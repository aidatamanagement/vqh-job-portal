
import React from 'react';
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
  AlertTriangle,
  Clock,
  Users
} from 'lucide-react';
import { Job, JobPosition, JobLocation, JobFacility, HRManager } from '@/types';

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
  return (
    <Dialog open={!!editingJob} onOpenChange={onClose}>
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
                onChange={(e) => onInputChange('title', e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Label htmlFor="edit-location" className="text-sm font-medium">Location *</Label>
                <Select 
                  value={jobForm.location || ''} 
                  onValueChange={(value) => onInputChange('location', value)}
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

              <div>
                <Label htmlFor="edit-hrManager" className="text-sm font-medium">Assigned HR Manager *</Label>
                <Select 
                  value={jobForm.hrManagerId || ''} 
                  onValueChange={(value) => onInputChange('hrManagerId', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select HR manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {hrManagers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{manager.name}</span>
                          <span className="text-xs text-gray-500">({manager.email})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  HR manager will handle all applicants for this job
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
                  />
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <Label htmlFor="edit-urgent" className="text-sm font-medium">
                      Mark as Urgent
                    </Label>
                  </div>
                </div>

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
