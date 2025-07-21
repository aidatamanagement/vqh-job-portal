import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Upload, X, FileText, Calendar, MapPin, Copy, ExternalLink } from 'lucide-react';
import { Job } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { supabase } from '@/integrations/supabase/client';
import { useEmailAutomation } from '@/hooks/useEmailAutomation';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose, job }) => {
  const { applications, setApplications } = useAppContext();
  const { sendApplicationSubmittedEmail } = useEmailAutomation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    earliestStartDate: '',
    cityState: '',
    coverLetter: '',
    confirmTerms: false,
  });

  const [files, setFiles] = useState({
    resume: null as File | null,
    coverLetter: null as File | null,
    additionalDocs: [] as File[],
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (type: 'resume' | 'coverLetter' | 'additional', file: File) => {
    if (type === 'resume') {
      setFiles(prev => ({ ...prev, resume: file }));
    } else if (type === 'coverLetter') {
      setFiles(prev => ({ ...prev, coverLetter: file }));
    } else {
      setFiles(prev => ({ ...prev, additionalDocs: [...prev.additionalDocs, file] }));
    }
  };

  const removeFile = (type: 'resume' | 'coverLetter' | 'additional', index?: number) => {
    if (type === 'resume') {
      setFiles(prev => ({ ...prev, resume: null }));
    } else if (type === 'coverLetter') {
      setFiles(prev => ({ ...prev, coverLetter: null }));
    } else if (typeof index === 'number') {
      setFiles(prev => ({
        ...prev,
        additionalDocs: prev.additionalDocs.filter((_, i) => i !== index)
      }));
    }
  };

  const uploadFileToSupabase = async (file: File, applicationId: string, fileType: 'resume' | 'coverLetter' | 'additional', index?: number): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${applicationId}/${fileType}${index !== undefined ? `_${index}` : ''}.${fileExt}`;
    
    console.log(`Uploading file: ${fileName}`);
    
    const { data, error } = await supabase.storage
      .from('job-applications')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('File upload error:', error);
      throw new Error(`Failed to upload ${fileType}: ${error.message}`);
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('job-applications')
      .getPublicUrl(fileName);

    console.log(`File uploaded successfully: ${publicUrl}`);
    return publicUrl;
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'earliestStartDate', 'cityState'];
    
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "Missing Required Field",
          description: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          variant: "destructive",
        });
        return false;
      }
    }

    // Validate earliest start date is not in the past
    if (formData.earliestStartDate) {
      const startDate = new Date(formData.earliestStartDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
      
      if (startDate < today) {
        toast({
          title: "Invalid Start Date",
          description: "Earliest start date cannot be in the past",
          variant: "destructive",
        });
        return false;
      }
    }

    if (!files.resume) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume",
        variant: "destructive",
      });
      return false;
    }

    // Check that at least one cover letter option is provided
    if (!formData.coverLetter.trim() && !files.coverLetter) {
      toast({
        title: "Cover Letter Required",
        description: "Please provide a cover letter by either typing it below or uploading a file",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.confirmTerms) {
      toast({
        title: "Terms and Conditions",
        description: "Please confirm that you agree to the terms and conditions",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Generate a unique application ID for file uploads
      const applicationId = crypto.randomUUID();
      
      console.log('Starting application submission with ID:', applicationId);

      // Upload resume
      let resumeUrl = '';
      if (files.resume) {
        resumeUrl = await uploadFileToSupabase(files.resume, applicationId, 'resume');
      }

      // Upload cover letter file
      let coverLetterUrl = '';
      if (files.coverLetter) {
        coverLetterUrl = await uploadFileToSupabase(files.coverLetter, applicationId, 'coverLetter');
      }

      // Upload additional documents
      const additionalDocsUrls: string[] = [];
      for (let i = 0; i < files.additionalDocs.length; i++) {
        const docUrl = await uploadFileToSupabase(files.additionalDocs[i], applicationId, 'additional', i);
        additionalDocsUrls.push(docUrl);
      }

      // Generate tracking token for application tracking
      const trackingToken = crypto.randomUUID();

      // Create application data for Supabase
      // Try different possible column names for applied position
      const applicationData = {
        id: applicationId,
        job_id: job.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        // Try the expected column name first
        applied_position: job.position,
        earliest_start_date: formData.earliestStartDate,
        city_state: formData.cityState,
        cover_letter: formData.coverLetter,
        cover_letter_url: coverLetterUrl,
        additional_docs_urls: additionalDocsUrls,
        tracking_token: trackingToken,
        status: 'application_submitted',
        user_id: null // Anonymous application
      };

      console.log('Submitting application data:', applicationData);

      // Try to insert into Supabase with better error handling
      let insertResult;
      try {
        insertResult = await supabase
          .from('job_applications')
          .insert([applicationData])
          .select()
          .single();
      } catch (insertError) {
        console.error('First insert attempt failed:', insertError);
        
        // If applied_position fails, try alternative column names
        const alternativeData = {
          ...applicationData,
          position: job.position, // Alternative column name
        };
        delete alternativeData.applied_position; // Remove the failing field
        
        console.log('Trying alternative data structure:', alternativeData);
        
        insertResult = await supabase
          .from('job_applications')
          .insert([alternativeData])
          .select()
          .single();
      }

      const { data, error } = insertResult;

      if (error) {
        console.error('Supabase error details:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        throw new Error(`Failed to submit application: ${error.message}`);
      }

      console.log('Application submitted successfully:', data);

      // Update local state for immediate UI update
      const newApplication = {
        id: data.id,
        jobId: job.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        appliedPosition: job.position,
        earliestStartDate: formData.earliestStartDate,
        cityState: formData.cityState,
        coverLetter: formData.coverLetter,
        coverLetterUrl: coverLetterUrl,
        status: 'application_submitted' as const,
        resumeUrl: resumeUrl,
        additionalDocsUrls: additionalDocsUrls,
        notes: '',
        trackingToken: data.tracking_token,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setApplications(prev => [...prev, newApplication]);

      // Send confirmation email with tracking information
      try {
        await sendApplicationSubmittedEmail(
          {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            appliedPosition: job.position,
            earliestStartDate: formData.earliestStartDate,
            phone: formData.phone,
          },
          {
            location: job.officeLocation,
            workLocation: job.workLocation,
          },
          data.tracking_token
        );
        console.log('Confirmation email sent successfully');
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the application submission if email fails
      }

      setShowThankYou(true);

      toast({
        title: "Application Submitted!",
        description: "Your application has been successfully submitted. Check your email for confirmation.",
      });

    } catch (error) {
      console.error('Application submission error:', error);
      toast({
        title: "Submission Error",
        description: error instanceof Error ? error.message : "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      earliestStartDate: '',
      cityState: '',
      coverLetter: '',
      confirmTerms: false,
    });
    setFiles({
      resume: null,
      coverLetter: null,
      additionalDocs: [],
    });
    setShowThankYou(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (showThankYou) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Application Submitted!
            </h3>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in the {job.position} position. We've received your application and will be in touch soon.
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              You should receive a confirmation email shortly with details about your application.
            </p>
            
            <Button onClick={handleClose} className="w-full bg-primary hover:bg-primary/90">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Apply for {job.title}
          </DialogTitle>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
            <div className="flex flex-col">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Office: {job.officeLocation}
              </div>
              <div className="flex items-center text-xs ml-5">
                Work: {job.workLocation}
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {job.position}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Personal Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="mt-1"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="mt-1"
                  placeholder="Enter your last name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-1"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </Card>

          {/* Position Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appliedPosition">Applied Position</Label>
                <Input
                  id="appliedPosition"
                  value={job.position}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="earliestStartDate">Earliest Start Date *</Label>
                <Input
                  id="earliestStartDate"
                  type="date"
                  value={formData.earliestStartDate}
                  onChange={(e) => handleInputChange('earliestStartDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="cityState">City/State *</Label>
                <Input
                  id="cityState"
                  value={formData.cityState}
                  onChange={(e) => handleInputChange('cityState', e.target.value)}
                  className="mt-1"
                  placeholder="Los Angeles, CA"
                />
              </div>
            </div>
          </Card>

          {/* Cover Letter */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cover Letter *</h3>
              <div className="flex items-center space-x-2">
                {!files.coverLetter ? (
                  <>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('coverLetter', e.target.files[0])}
                      className="hidden"
                      id="cover-letter-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('cover-letter-upload')?.click()}
                      className="flex items-center space-x-1"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">Upload File</span>
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg border border-green-200">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">{files.coverLetter.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile('coverLetter')}
                      className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Please provide a cover letter by typing below OR uploading a file (at least one is required).
            </p>
            
            <RichTextEditor
              value={formData.coverLetter}
              onChange={(value) => handleInputChange('coverLetter', value)}
              placeholder="Tell us why you're interested in this position and what makes you a great fit for our team..."
              className="min-h-[200px]"
            />
            <p className="text-xs text-gray-500 mt-2">
              Use formatting to highlight your key qualifications and express your enthusiasm for the role.
            </p>
          </Card>

          {/* File Uploads */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume</h3>
            
            {/* Resume Upload */}
            <div className="mb-6">
              <Label className="block text-sm font-medium text-gray-900 mb-2">
                Resume * (PDF, DOC, DOCX - Max 10MB)
              </Label>
              {!files.resume ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('resume', e.target.files[0])}
                    className="hidden"
                    id="resume-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('resume-upload')?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-900">{files.resume.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('resume')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Additional Documents */}
            <div>
              <Label className="block text-sm font-medium text-gray-900 mb-2">
                Additional Documents (Optional)
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors mb-4">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload certifications, references, etc.</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => {
                    Array.from(e.target.files || []).forEach(file => 
                      handleFileUpload('additional', file)
                    );
                  }}
                  className="hidden"
                  id="additional-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('additional-upload')?.click()}
                >
                  Choose Files
                </Button>
              </div>
              
              {files.additionalDocs.length > 0 && (
                <div className="space-y-2">
                  {files.additionalDocs.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-900">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile('additional', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Terms and Submit */}
          <Card className="p-6">
            <div className="flex items-start space-x-3 mb-6">
              <Checkbox
                id="confirmTerms"
                checked={formData.confirmTerms}
                onCheckedChange={(checked) => handleInputChange('confirmTerms', !!checked)}
              />
              <Label htmlFor="confirmTerms" className="text-sm text-gray-700 leading-relaxed">
                I confirm that the information provided is accurate and complete. I understand that any false information may lead to rejection of my application or termination of employment. I consent to the processing of my personal data for recruitment purposes. *
              </Label>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="spinner" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </div>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;
