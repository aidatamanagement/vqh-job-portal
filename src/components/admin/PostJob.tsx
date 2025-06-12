
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Briefcase, MapPin, Settings as SettingsIcon } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

const PostJob: React.FC = () => {
  const { positions, locations, setPositions, setLocations, jobs, setJobs } = useAppContext();
  const [activeTab, setActiveTab] = useState('create-job');
  
  // Job form state
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    position: '',
    location: '',
    facilities: [] as string[],
    customFacility: '',
  });

  // Position/Location management state
  const [newPosition, setNewPosition] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const defaultFacilities = ['Full-time', 'Part-time', 'Remote', 'Flexible Schedule', 'Benefits', 'Training Provided', 'Professional Development', 'Continuing Education'];

  const handleJobInputChange = (field: string, value: string) => {
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

  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobForm.title || !jobForm.description || !jobForm.position || !jobForm.location) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newJob = {
      id: Date.now().toString(),
      ...jobForm,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setJobs(prev => [...prev, newJob]);
    
    // Reset form
    setJobForm({
      title: '',
      description: '',
      position: '',
      location: '',
      facilities: [],
      customFacility: '',
    });

    toast({
      title: "Job Posted Successfully",
      description: "Your job posting is now live and accepting applications",
    });
  };

  const addPosition = () => {
    if (newPosition.trim() && !positions.find(p => p.name === newPosition.trim())) {
      const newPos = {
        id: Date.now().toString(),
        name: newPosition.trim(),
        createdAt: new Date().toISOString(),
      };
      setPositions(prev => [...prev, newPos]);
      setNewPosition('');
      toast({
        title: "Position Added",
        description: `${newPos.name} has been added to job categories`,
      });
    }
  };

  const addLocation = () => {
    if (newLocation.trim() && !locations.find(l => l.name === newLocation.trim())) {
      const newLoc = {
        id: Date.now().toString(),
        name: newLocation.trim(),
        createdAt: new Date().toISOString(),
      };
      setLocations(prev => [...prev, newLoc]);
      setNewLocation('');
      toast({
        title: "Location Added",
        description: `${newLoc.name} has been added to available locations`,
      });
    }
  };

  const removePosition = (id: string) => {
    setPositions(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Position Removed",
      description: "Job category has been removed",
    });
  };

  const removeLocation = (id: string) => {
    setLocations(prev => prev.filter(l => l.id !== id));
    toast({
      title: "Location Removed",
      description: "Location has been removed",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 animate-fade-in-up">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Post New Job</h1>
          <p className="text-gray-600">Create and manage job postings</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create-job" className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4" />
            <span>Create Job</span>
          </TabsTrigger>
          <TabsTrigger value="manage-categories" className="flex items-center space-x-2">
            <SettingsIcon className="w-4 h-4" />
            <span>Manage Categories</span>
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
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Position Category *</Label>
                    <Select value={jobForm.position} onValueChange={(value) => handleJobInputChange('position', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select position category" />
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
                    <Select value={jobForm.location} onValueChange={(value) => handleJobInputChange('location', value)}>
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
                </div>
              </div>

              {/* Job Description */}
              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={jobForm.description}
                  onChange={(e) => handleJobInputChange('description', e.target.value)}
                  className="mt-1 min-h-[200px] rich-editor"
                  placeholder="Provide a detailed description of the role, responsibilities, requirements, and benefits..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use clear, engaging language to attract the right candidates. Include responsibilities, requirements, and what makes this role special.
                </p>
              </div>

              {/* Facilities/Benefits */}
              <div>
                <Label>Employment Type & Benefits</Label>
                <div className="mt-3 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {defaultFacilities.map((facility) => (
                      <div key={facility} className="flex items-center space-x-2">
                        <Checkbox
                          id={facility}
                          checked={jobForm.facilities.includes(facility)}
                          onCheckedChange={() => handleFacilityToggle(facility)}
                        />
                        <Label htmlFor={facility} className="text-sm text-gray-700">
                          {facility}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {/* Custom facility */}
                  <div className="flex space-x-2">
                    <Input
                      value={jobForm.customFacility}
                      onChange={(e) => handleJobInputChange('customFacility', e.target.value)}
                      placeholder="Add custom benefit or requirement"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addCustomFacility}
                      variant="outline"
                      size="sm"
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
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Publish Job
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="manage-categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  />
                  <Button onClick={addPosition} size="sm" className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {positions.map((position) => (
                    <div key={position.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-900">{position.name}</span>
                      <Button
                        onClick={() => removePosition(position.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
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
                  />
                  <Button onClick={addLocation} size="sm" className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {locations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-900">{location.name}</span>
                      <Button
                        onClick={() => removeLocation(location.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
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
