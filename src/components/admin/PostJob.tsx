import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Briefcase, MapPin, Settings as SettingsIcon, Award, AlertTriangle, Calendar, Loader2, Users, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { HRManager } from '@/types';
import { useDocumentParser } from '@/hooks/useDocumentParser';

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
    fetchHRManagers,
    isLoading
  } = useAppContext();
  
  const { parseDocument, isParsingDocument } = useDocumentParser();
  
  const [activeTab, setActiveTab] = useState('create-job');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hrManagers, setHRManagers] = useState<HRManager[]>([]);
  
  // Document parsing state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [showParsePreview, setShowParsePreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Job form state
  const [jobForm, setJobForm] = useState({
    description: '',
    position: '',
    location: '',
    facilities: [] as string[],
    customFacility: '',
    isUrgent: false,
    applicationDeadline: '',
    hrManagerId: '',
  });

  // Position/Location/Facility management state
  const [newPosition, setNewPosition] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newFacility, setNewFacility] = useState('');
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [isAddingFacility, setIsAddingFacility] = useState(false);

  // Fetch master data and Managers on component mount
  useEffect(() => {
    fetchMasterData();
    fetchHRManagers().then(setHRManagers);
  }, [fetchMasterData, fetchHRManagers]);

  // Fetch managers when location changes
  useEffect(() => {
    console.log('Location changed to:', jobForm.location);
    if (jobForm.location) {
      console.log('Fetching managers for location:', jobForm.location);
      fetchHRManagers(jobForm.location).then(managers => {
        console.log('Received managers:', managers);
        setHRManagers(managers);
      });
      // Clear manager selection when location changes
      setJobForm(prev => ({ ...prev, hrManagerId: '' }));
    } else {
      console.log('No location selected, clearing managers');
      // If no location selected, clear managers and manager selection
      setHRManagers([]);
      setJobForm(prev => ({ ...prev, hrManagerId: '' }));
    }
  }, [jobForm.location, fetchHRManagers]);

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
    
    if (!jobForm.description || !jobForm.position || !jobForm.location || !jobForm.hrManagerId) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields including Manager",
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

    const jobData = {
      description: jobForm.description,
      position: jobForm.position,
      location: jobForm.location,
      facilities: jobForm.facilities,
      isActive: true,
      isUrgent: jobForm.isUrgent,
      applicationDeadline: jobForm.applicationDeadline || null,
      hrManagerId: jobForm.hrManagerId,
    };

    console.log('Submitting job data:', jobData);

    const success = await createJob(jobData);

    if (success) {
      // Reset form
      setJobForm({
        description: '',
        position: '',
        location: '',
        facilities: [],
        customFacility: '',
        isUrgent: false,
        applicationDeadline: '',
        hrManagerId: '',
      });

      toast({
        title: "Job Posted Successfully",
        description: `Your job posting for ${jobData.position} in ${jobData.location} is now live${jobData.isUrgent ? ' and marked as urgent' : ''}${jobData.applicationDeadline ? ' with application deadline set' : ''}`,
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

  // File handling functions for document parsing
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const allowedExtensions = ['.txt', '.pdf', '.doc', '.docx'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      toast({
        title: "Unsupported File Type",
        description: "Please upload a .txt, .pdf, .doc, or .docx file",
        variant: "destructive",
      });
      return;
    }

    // File size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);

    try {
      const extractedData = await parseDocument(file);
      setParsedData(extractedData);
      setShowParsePreview(true);
    } catch (error) {
      console.error('Document parsing failed:', error);
      setUploadedFile(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const applyParsedData = () => {
    if (!parsedData) return;

    // Apply extracted data to form, only if values are present
    if (parsedData.description) {
      setJobForm(prev => ({ ...prev, description: parsedData.description }));
    }
    
    if (parsedData.position) {
      // Try to match with existing positions
      const matchingPosition = positions.find(pos => 
        pos.name.toLowerCase().includes(parsedData.position.toLowerCase()) ||
        parsedData.position.toLowerCase().includes(pos.name.toLowerCase())
      );
      if (matchingPosition) {
        setJobForm(prev => ({ ...prev, position: matchingPosition.name }));
      }
    }
    
    if (parsedData.location) {
      // Try to match with existing locations
      const matchingLocation = locations.find(loc => 
        loc.name.toLowerCase().includes(parsedData.location.toLowerCase()) ||
        parsedData.location.toLowerCase().includes(loc.name.toLowerCase())
      );
      if (matchingLocation) {
        setJobForm(prev => ({ ...prev, location: matchingLocation.name }));
      }
    }
    
    if (parsedData.facilities && parsedData.facilities.length > 0) {
      // Match extracted facilities with existing ones
      const matchingFacilities = parsedData.facilities.filter(extractedFacility =>
        facilities.some(facility => 
          facility.name.toLowerCase().includes(extractedFacility.toLowerCase()) ||
          extractedFacility.toLowerCase().includes(facility.name.toLowerCase())
        )
      ).map(extractedFacility => {
        const match = facilities.find(facility => 
          facility.name.toLowerCase().includes(extractedFacility.toLowerCase()) ||
          extractedFacility.toLowerCase().includes(facility.name.toLowerCase())
        );
        return match ? match.name : extractedFacility;
      });
      
      setJobForm(prev => ({ 
        ...prev, 
        facilities: [...new Set([...prev.facilities, ...matchingFacilities])]
      }));
    }
    
    if (parsedData.isUrgent !== undefined) {
      setJobForm(prev => ({ ...prev, isUrgent: parsedData.isUrgent }));
    }
    
    if (parsedData.applicationDeadline) {
      setJobForm(prev => ({ ...prev, applicationDeadline: parsedData.applicationDeadline }));
    }

    setShowParsePreview(false);
    setParsedData(null);
    setUploadedFile(null);

    toast({
      title: "Data Applied Successfully",
      description: "Job form has been populated with extracted data. Please review and adjust as needed.",
    });
  };

  const clearParsedData = () => {
    setShowParsePreview(false);
    setParsedData(null);
    setUploadedFile(null);
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
          {/* Document Upload Section */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Auto-Fill from Document</span>
              </div>
              
              {!uploadedFile && !showParsePreview && (
                <label className="flex items-center space-x-2 text-primary hover:text-primary/90 cursor-pointer text-sm">
                  <FileText className="w-4 h-4" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                    className="hidden"
                    disabled={isParsingDocument}
                  />
                </label>
              )}
            </div>
            
            {uploadedFile && !showParsePreview && (
              <div className="mt-2 text-xs text-gray-500">
                {uploadedFile.name} • {Math.round(uploadedFile.size / 1024)}KB
              </div>
            )}

              {isParsingDocument && (
                <div className="flex items-center justify-center space-x-3 p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Analyzing document...
                    </p>
                    <p className="text-xs text-gray-500">
                      Extracting job data with AI
                    </p>
                  </div>
                </div>
              )}

              {showParsePreview && parsedData && (
                <div className="text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Extracted Data Preview
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearParsedData}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    {parsedData.position && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Position</Label>
                        <p className="text-sm text-gray-900">{parsedData.position}</p>
                      </div>
                    )}
                    {parsedData.location && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Location</Label>
                        <p className="text-sm text-gray-900">{parsedData.location}</p>
                      </div>
                    )}
                    {parsedData.facilities && parsedData.facilities.length > 0 && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Benefits/Type</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {parsedData.facilities.map((facility, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {parsedData.isUrgent && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600 font-medium">Marked as Urgent</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      type="button"
                      onClick={applyParsedData}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Apply to Form
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={clearParsedData}
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              )}
          </Card>

          <Card className="p-6">
            <form onSubmit={handleJobSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="position">Position*</Label>
                    <Select value={jobForm.position} onValueChange={(value) => handleJobInputChange('position', value)} disabled={isSubmitting}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={positions.length === 0 ? "Loading positions..." : "Select position"} />
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

                  <div>
                    <Label htmlFor="hrManager">Assigned Manager *</Label>
                    <Select 
                      value={jobForm.hrManagerId} 
                      onValueChange={(value) => handleJobInputChange('hrManagerId', value)} 
                      disabled={isSubmitting || !jobForm.location}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={
                          !jobForm.location 
                            ? "Select location first" 
                            : hrManagers.length === 0 
                              ? "Loading Managers..." 
                              : "Select Manager"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {hrManagers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            <div className="flex items-center space-x-3">
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
                      {!jobForm.location 
                        ? "Please select a location first to see available managers"
                        : "Manager will handle all applicants for this job"
                      }
                    </p>
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
