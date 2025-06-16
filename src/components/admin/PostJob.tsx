import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Briefcase, MapPin, Settings as SettingsIcon, Award, AlertTriangle, Calendar, Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/ui/rich-text-editor';

const PostJob: React.FC = () => {
  const { 
    positions, 
    locations, 
    facilities, 
    createJob, 
    createPosition, 
    deletePosition, 
    createLocation, 
    deleteLocation, 
    createFacility, 
    deleteFacility,
    fetchMasterData,
    isLoading
  } = useAppContext();
  const [activeTab, setActiveTab] = useState('create-job');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Job form state
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    position: '',
    location: '',
    facilities: [] as string[],
    customFacility: '',
    isUrgent: false,
    applicationDeadline: '',
  });

  // Position/Location/Facility management state
  const [newPosition, setNewPosition] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newFacility, setNewFacility] = useState('');
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [isAddingFacility, setIsAddingFacility] = useState(false);

  // Fetch master data on component mount
  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  const handleJobInputChange = (field: string, value: string | boolean) => {
    setJobForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFacilityToggle = (facility: string) => {
    setJobForm(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const addCustomFacility = () => {
    if (jobForm.customFacility.trim() && !jobForm.facilities.includes(jobForm.customFacility.trim())) {
      setJobForm(prev => ({
        ...prev,
        facilities: [...prev.facilities, prev.customFacility.trim()],
        customFacility: ''
      }));
    }
  };

  const removeFacility = (facility: string) => {
    setJobForm(prev => ({
      ...prev,
      facilities: prev.facilities.filter(f => f !== facility)
    }));
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!jobForm.title || !jobForm.description || !jobForm.position || !jobForm.location) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      setIsSubmitting(false);
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
        setIsSubmitting(false);
        return;
      }
    }

    const success = await createJob({
      title: jobForm.title,
      description: jobForm.description,
      position: jobForm.position,
      location: jobForm.location,
      facilities: jobForm.facilities,
      isActive: true,
      isUrgent: jobForm.isUrgent,
      applicationDeadline: jobForm.applicationDeadline || null,
    });

    if (success) {
      // Reset form
      setJobForm({
        title: '',
        description: '',
        position: '',
        location: '',
        facilities: [],
        customFacility: '',
        isUrgent: false,
        applicationDeadline: '',
      });

      toast({
        title: "Job Posted Successfully",
        description: "Your job posting is now live and accepting applications",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create job posting. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };

  const addPosition = async () => {
    if (!newPosition.trim()) return;
    
    if (positions.find(p => p.name.toLowerCase() === newPosition.trim().toLowerCase())) {
      toast({
        title: "Position Already Exists",
        description: "This job category already exists",
        variant: "destructive",
      });
      return;
    }

    setIsAddingPosition(true);
    const success = await createPosition(newPosition.trim());
    
    if (success) {
      setNewPosition('');
      toast({
        title: "Position Added",
        description: `${newPosition.trim()} has been added to job categories`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add position. Please try again.",
        variant: "destructive",
      });
    }
    setIsAddingPosition(false);
  };

  const addLocation = async () => {
    if (!newLocation.trim()) return;
    
    if (locations.find(l => l.name.toLowerCase() === newLocation.trim().toLowerCase())) {
      toast({
        title: "Location Already Exists",
        description: "This location already exists",
        variant: "destructive",
      });
      return;
    }

    setIsAddingLocation(true);
    const success = await createLocation(newLocation.trim());
    
    if (success) {
      setNewLocation('');
      toast({
        title: "Location Added",
        description: `${newLocation.trim()} has been added to available locations`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add location. Please try again.",
        variant: "destructive",
      });
    }
    setIsAddingLocation(false);
  };

  const addFacilityToList = async () => {
    if (!newFacility.trim()) return;
    
    if (facilities.find(f => f.name.toLowerCase() === newFacility.trim().toLowerCase())) {
      toast({
        title: "Benefit Already Exists",
        description: "This employment benefit already exists",
        variant: "destructive",
      });
      return;
    }

    setIsAddingFacility(true);
    const success = await createFacility(newFacility.trim());
    
    if (success) {
      setNewFacility('');
      toast({
        title: "Benefit Added",
        description: `${newFacility.trim()} has been added to available benefits`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add benefit. Please try again.",
        variant: "destructive",
      });
    }
    setIsAddingFacility(false);
  };

  const removePosition = async (id: string, name: string) => {
    const success = await deletePosition(id);
    if (success) {
      toast({
        title: "Position Removed",
        description: `${name} has been removed from job categories`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to remove position. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeLocation = async (id: string, name: string) => {
    const success = await deleteLocation(id);
    if (success) {
      toast({
        title: "Location Removed",
        description: `${name} has been removed from locations`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to remove location. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeFacilityFromList = async (id: string, name: string) => {
    const success = await deleteFacility(id);
    if (success) {
      toast({
        title: "Benefit Removed",
        description: `${name} has been removed from employment benefits`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to remove benefit. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 animate-fade-in-up">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900" style={{ fontSize: '1.3rem' }}>Post New Job</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create-job" className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4" />
            <span>Create Job</span>
          </TabsTrigger>
          <TabsTrigger value="manage-attributes" className="flex items-center space-x-2">
            <SettingsIcon className="w-4 h-4" />
            <span>Manage Attributes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create-job" className="space-y-6">
          <Card className="p-6">
            <form onSubmit={handleJobSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={jobForm.title}
                    onChange={(e) => handleJobInputChange('title', e.target.value)}
                    className="mt-1"
                    placeholder="e.g., Compassionate Registered Nurse - Home Care"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Position Category *</Label>
                    <Select value={jobForm.position} onValueChange={(value) => handleJobInputChange('position', value)} disabled={isSubmitting}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={positions.length === 0 ? "Loading positions..." : "Select position category"} />
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
                    <Label htmlFor="location">Location *</Label>
                    <Select value={jobForm.location} onValueChange={(value) => handleJobInputChange('location', value)} disabled={isSubmitting}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={locations.length === 0 ? "Loading locations..." : "Select location"} />
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
              </div>

              {/* Priority and Deadline Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Priority & Timing</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id="urgent"
                      checked={jobForm.isUrgent}
                      onCheckedChange={(checked) => handleJobInputChange('isUrgent', checked as boolean)}
                      disabled={isSubmitting}
                    />
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <Label htmlFor="urgent" className="text-sm font-medium">
                        Mark as Urgent
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="deadline" className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Application Deadline</span>
                    </Label>
                    <Input
                      id="deadline"
                      type="datetime-local"
                      value={jobForm.applicationDeadline}
                      onChange={(e) => handleJobInputChange('applicationDeadline', e.target.value)}
                      className="mt-1"
                      min={new Date().toISOString().slice(0, 16)}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional: Set a deadline for applications
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <Label htmlFor="description">Job Description *</Label>
                <div className="mt-1">
                  <RichTextEditor
                    value={jobForm.description}
                    onChange={(value) => handleJobInputChange('description', value)}
                    placeholder="Provide a detailed description of the role, responsibilities, requirements, and benefits..."
                    className="min-h-[200px]"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use the formatting tools to create an engaging job description. Include responsibilities, requirements, and what makes this role special.
                </p>
              </div>

              {/* Facilities/Benefits */}
              <div>
                <Label>Employment Type & Benefits</Label>
                <div className="mt-3 space-y-4">
                  {facilities.length === 0 && isLoading ? (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading employment benefits...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {facilities.map((facility) => (
                        <div key={facility.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={facility.id}
                            checked={jobForm.facilities.includes(facility.name)}
                            onCheckedChange={() => handleFacilityToggle(facility.name)}
                            disabled={isSubmitting}
                          />
                          <Label htmlFor={facility.id} className="text-sm text-gray-700">
                            {facility.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Custom facility */}
                  <div className="flex space-x-2">
                    <Input
                      value={jobForm.customFacility}
                      onChange={(e) => handleJobInputChange('customFacility', e.target.value)}
                      placeholder="Add custom benefit or requirement"
                      className="flex-1"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      onClick={addCustomFacility}
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting || !jobForm.customFacility.trim()}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Selected facilities */}
                  {jobForm.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {jobForm.facilities.map((facility) => (
                        <Badge
                          key={facility}
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1"
                        >
                          {facility}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1 hover:bg-transparent"
                            onClick={() => removeFacility(facility)}
                            disabled={isSubmitting}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Save as Draft
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Job'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="manage-attributes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Manage Positions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-primary" />
                Job Categories
              </h3>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    placeholder="Add new job category"
                    className="flex-1"
                    disabled={isAddingPosition}
                    onKeyPress={(e) => e.key === 'Enter' && addPosition()}
                  />
                  <Button 
                    onClick={addPosition} 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90"
                    disabled={isAddingPosition || !newPosition.trim()}
                  >
                    {isAddingPosition ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {isLoading && positions.length === 0 ? (
                    <div className="flex items-center justify-center p-4 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading categories...
                    </div>
                  ) : positions.length === 0 ? (
                    <div className="text-center p-4 text-gray-500">
                      No job categories yet. Add one above.
                    </div>
                  ) : (
                    positions.map((position) => (
                      <div key={position.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-900">{position.name}</span>
                        <Button
                          onClick={() => removePosition(position.id, position.name)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>

            {/* Manage Locations */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Locations
              </h3>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Add new location"
                    className="flex-1"
                    disabled={isAddingLocation}
                    onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                  />
                  <Button 
                    onClick={addLocation} 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90"
                    disabled={isAddingLocation || !newLocation.trim()}
                  >
                    {isAddingLocation ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {isLoading && locations.length === 0 ? (
                    <div className="flex items-center justify-center p-4 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading locations...
                    </div>
                  ) : locations.length === 0 ? (
                    <div className="text-center p-4 text-gray-500">
                      No locations yet. Add one above.
                    </div>
                  ) : (
                    locations.map((location) => (
                      <div key={location.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-900">{location.name}</span>
                        <Button
                          onClick={() => removeLocation(location.id, location.name)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>

            {/* Manage Employment Benefits */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-primary" />
                Employment Benefits
              </h3>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    placeholder="Add new benefit"
                    className="flex-1"
                    disabled={isAddingFacility}
                    onKeyPress={(e) => e.key === 'Enter' && addFacilityToList()}
                  />
                  <Button 
                    onClick={addFacilityToList} 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90"
                    disabled={isAddingFacility || !newFacility.trim()}
                  >
                    {isAddingFacility ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {isLoading && facilities.length === 0 ? (
                    <div className="flex items-center justify-center p-4 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading benefits...
                    </div>
                  ) : facilities.length === 0 ? (
                    <div className="text-center p-4 text-gray-500">
                      No employment benefits yet. Add one above.
                    </div>
                  ) : (
                    facilities.map((facility) => (
                      <div key={facility.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-900">{facility.name}</span>
                        <Button
                          onClick={() => removeFacilityFromList(facility.id, facility.name)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PostJob;
