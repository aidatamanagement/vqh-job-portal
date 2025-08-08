import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Users, MapPin, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useDefaultBranchManagers } from '@/hooks/useDefaultBranchManagers';
import { JobLocation, HRManager } from '@/types';

interface DefaultBranchManagersCardProps {
  locations: JobLocation[];
}

const DefaultBranchManagersCard: React.FC<DefaultBranchManagersCardProps> = ({ locations }) => {
  const {
    defaultManagers,
    branchManagers,
    isLoading,
    fetchDefaultManagers,
    fetchBranchManagers,
    saveDefaultManager,
    deleteDefaultManager,
  } = useDefaultBranchManagers();

  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    locationName: string;
    managerName: string;
  }>({
    isOpen: false,
    locationName: '',
    managerName: '',
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchDefaultManagers();
    fetchBranchManagers();
  }, [fetchDefaultManagers, fetchBranchManagers]);

  const handleSave = async () => {
    if (!selectedLocation || !selectedManager) {
      return;
    }

    setIsSaving(true);
    const success = await saveDefaultManager(selectedLocation, selectedManager);
    
    if (success) {
      setSelectedLocation('');
      setSelectedManager('');
    }
    
    setIsSaving(false);
  };

  const handleDeleteClick = (locationName: string) => {
    const managerName = getManagerName(defaultManagers.find(m => m.location_name === locationName)?.manager_id || '');
    setDeleteConfirmation({
      isOpen: true,
      locationName,
      managerName,
    });
  };

  const handleDeleteConfirm = async () => {
    await deleteDefaultManager(deleteConfirmation.locationName);
    setDeleteConfirmation({
      isOpen: false,
      locationName: '',
      managerName: '',
    });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      locationName: '',
      managerName: '',
    });
  };

  const getManagerName = (managerId: string) => {
    const manager = branchManagers.find(m => m.id === managerId);
    return manager?.name || 'Unknown Manager';
  };

  const getLocationName = (locationName: string) => {
    const location = locations.find(l => l.name === locationName);
    return location?.name || locationName;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Default Branch Managers</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Assign branch managers to locations for automatic job posting assignments (Admins, HR, and Branch Managers can manage)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Assignment */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Add New Assignment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Location</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select location" />
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
                <label className="text-sm font-medium text-gray-700">Branch Manager</label>
                <Select value={selectedManager} onValueChange={setSelectedManager}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {branchManagers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name} {manager.location && `(${manager.location})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={!selectedLocation || !selectedManager || isSaving}
              className="w-full md:w-auto"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Save Assignment
                </>
              )}
            </Button>
          </div>

          {/* Current Assignments */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Current Assignments</h4>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="text-sm text-gray-600 mt-2">Loading assignments...</p>
              </div>
            ) : defaultManagers.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No default manager assignments yet</p>
                <p className="text-xs text-gray-500 mt-1">Add assignments above to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-8 gap-3 overflow-x-auto">
                {defaultManagers.map((assignment) => (
                  <div key={assignment.id} className="flex flex-col p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(assignment.location_name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {getLocationName(assignment.location_name)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {getManagerName(assignment.manager_id)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmation.isOpen} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Delete Assignment</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the default manager assignment for{' '}
              <span className="font-medium">{deleteConfirmation.locationName}</span>?
              <br />
              <span className="text-sm text-gray-600">
                Manager: <span className="font-medium">{deleteConfirmation.managerName}</span>
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Assignment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DefaultBranchManagersCard; 