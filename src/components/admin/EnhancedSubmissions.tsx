
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { CalendarIcon, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { JobApplication } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EnhancedSubmissionsProps {
  application: JobApplication;
  onStatusUpdate: (id: string, newStatus: string) => void;
  onClose: () => void;
}

interface Supervisor {
  id: string;
  name: string;
  email: string;
  department?: string;
}

type ExtendedStatus = 'waiting' | 'approved' | 'interview_scheduled' | 'hired' | 'onboarding' | 'completed' | 'rejected';

const EnhancedSubmissions: React.FC<EnhancedSubmissionsProps> = ({
  application,
  onStatusUpdate,
  onClose
}) => {
  const [newStatus, setNewStatus] = useState<ExtendedStatus>(application.status as ExtendedStatus);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('');
  const [interviewDate, setInterviewDate] = useState<Date>();
  const [hiringDate, setHiringDate] = useState<Date>();
  const [onboardingStartDate, setOnboardingStartDate] = useState<Date>();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const { data, error } = await supabase
        .from('supervisors')
        .select('*')
        .order('name');

      if (error) throw error;
      setSupervisors(data || []);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    }
  };

  const statusOptions: { value: ExtendedStatus; label: string; description: string }[] = [
    { value: 'waiting', label: 'Pending Review', description: 'Application submitted, awaiting review' },
    { value: 'approved', label: 'Approved', description: 'Application approved, ready for next steps' },
    { value: 'interview_scheduled', label: 'Interview Scheduled', description: 'Interview date set with candidate' },
    { value: 'hired', label: 'Hired', description: 'Candidate accepted, ready for onboarding' },
    { value: 'onboarding', label: 'Onboarding', description: 'New hire onboarding in progress' },
    { value: 'completed', label: 'Completed', description: 'Onboarding completed successfully' },
    { value: 'rejected', label: 'Rejected', description: 'Application declined' }
  ];

  const getStatusColor = (status: ExtendedStatus) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'interview_scheduled': return 'bg-blue-100 text-blue-800';
      case 'hired': return 'bg-purple-100 text-purple-800';
      case 'onboarding': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateApplicationStatus = async () => {
    if (!newStatus) return;

    setLoading(true);
    try {
      // Create or update hiring pipeline entry
      const pipelineData: any = {
        application_id: application.id,
        status: newStatus,
        notes: notes || null,
        updated_at: new Date().toISOString()
      };

      if (selectedSupervisor) {
        pipelineData.supervisor_id = selectedSupervisor;
      }

      if (interviewDate) {
        pipelineData.interview_date = interviewDate.toISOString();
      }

      if (hiringDate) {
        pipelineData.hiring_date = hiringDate.toISOString();
      }

      if (onboardingStartDate) {
        pipelineData.onboarding_start_date = onboardingStartDate.toISOString();
      }

      // Check if pipeline entry exists
      const { data: existingPipeline } = await supabase
        .from('hiring_pipeline')
        .select('id')
        .eq('application_id', application.id)
        .single();

      if (existingPipeline) {
        // Update existing pipeline entry
        const { error: pipelineError } = await supabase
          .from('hiring_pipeline')
          .update(pipelineData)
          .eq('application_id', application.id);

        if (pipelineError) throw pipelineError;
      } else {
        // Create new pipeline entry
        const { error: pipelineError } = await supabase
          .from('hiring_pipeline')
          .insert(pipelineData);

        if (pipelineError) throw pipelineError;
      }

      // Update application status
      const { error: applicationError } = await supabase
        .from('job_applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (applicationError) throw applicationError;

      onStatusUpdate(application.id, newStatus);

      toast({
        title: "Status Updated",
        description: `Application status updated to ${statusOptions.find(s => s.value === newStatus)?.label}`,
      });

      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStatusSpecificFields = () => {
    switch (newStatus) {
      case 'interview_scheduled':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Interview Date & Time
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {interviewDate ? format(interviewDate, "PPP") : "Select interview date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={interviewDate}
                    onSelect={setInterviewDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      case 'hired':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Assign Supervisor
              </label>
              <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map((supervisor) => (
                    <SelectItem key={supervisor.id} value={supervisor.id}>
                      <div>
                        <div className="font-medium">{supervisor.name}</div>
                        <div className="text-sm text-gray-500">{supervisor.department}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Hiring Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {hiringDate ? format(hiringDate, "PPP") : "Select hiring date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={hiringDate}
                    onSelect={setHiringDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      case 'onboarding':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Onboarding Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {onboardingStartDate ? format(onboardingStartDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={onboardingStartDate}
                    onSelect={setOnboardingStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Application Status</h3>
      
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Current Status
          </label>
          <Badge className={getStatusColor(application.status as ExtendedStatus)}>
            {statusOptions.find(s => s.value === application.status)?.label || application.status}
          </Badge>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            New Status
          </label>
          <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ExtendedStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {renderStatusSpecificFields()}

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Notes (Optional)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any relevant notes about this status change..."
            className="min-h-[80px]"
          />
        </div>

        <div className="flex space-x-3">
          <Button 
            onClick={updateApplicationStatus} 
            disabled={loading || !newStatus}
            className="flex-1"
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Update Status
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedSubmissions;
