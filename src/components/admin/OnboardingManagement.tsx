
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, CheckCircle, Clock, Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  order_index: number;
  is_required: boolean;
  estimated_duration_hours: number;
}

interface Supervisor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
}

interface HiringPipelineItem {
  id: string;
  application_id: string;
  status: string;
  supervisor_id?: string;
  interview_date?: string;
  hiring_date?: string;
  onboarding_start_date?: string;
  onboarding_completion_date?: string;
  notes?: string;
  applicant_name?: string;
  position?: string;
}

const OnboardingManagement: React.FC = () => {
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [hiringPipeline, setHiringPipeline] = useState<HiringPipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStep, setEditingStep] = useState<OnboardingStep | null>(null);
  const [newSupervisor, setNewSupervisor] = useState({ name: '', email: '', phone: '', department: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch onboarding steps
      const { data: steps, error: stepsError } = await supabase
        .from('onboarding_steps')
        .select('*')
        .order('order_index');

      if (stepsError) throw stepsError;
      setOnboardingSteps(steps || []);

      // Fetch supervisors
      const { data: supervisorsData, error: supervisorsError } = await supabase
        .from('supervisors')
        .select('*')
        .order('name');

      if (supervisorsError) throw supervisorsError;
      setSupervisors(supervisorsData || []);

      // Fetch hiring pipeline
      const { data: pipeline, error: pipelineError } = await supabase
        .from('hiring_pipeline')
        .select(`
          *,
          job_applications(first_name, last_name, applied_position)
        `)
        .order('created_at', { ascending: false });

      if (pipelineError) throw pipelineError;
      
      const formattedPipeline = pipeline?.map(item => ({
        ...item,
        applicant_name: item.job_applications ? 
          `${item.job_applications.first_name} ${item.job_applications.last_name}` : 
          'Unknown',
        position: item.job_applications?.applied_position || 'Unknown'
      })) || [];
      
      setHiringPipeline(formattedPipeline);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load onboarding data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSupervisor = async () => {
    if (!newSupervisor.name || !newSupervisor.email) {
      toast({
        title: "Missing Information",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('supervisors')
        .insert(newSupervisor)
        .select()
        .single();

      if (error) throw error;

      setSupervisors(prev => [...prev, data]);
      setNewSupervisor({ name: '', email: '', phone: '', department: '' });
      
      toast({
        title: "Success",
        description: "Supervisor added successfully",
      });
    } catch (error) {
      console.error('Error adding supervisor:', error);
      toast({
        title: "Error",
        description: "Failed to add supervisor",
        variant: "destructive",
      });
    }
  };

  const updateOnboardingStep = async (step: OnboardingStep) => {
    try {
      const { error } = await supabase
        .from('onboarding_steps')
        .update({
          title: step.title,
          description: step.description,
          estimated_duration_hours: step.estimated_duration_hours,
          is_required: step.is_required
        })
        .eq('id', step.id);

      if (error) throw error;

      setOnboardingSteps(prev => prev.map(s => s.id === step.id ? step : s));
      setEditingStep(null);
      
      toast({
        title: "Success",
        description: "Onboarding step updated successfully",
      });
    } catch (error) {
      console.error('Error updating step:', error);
      toast({
        title: "Error",
        description: "Failed to update onboarding step",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="spinner" />
          <span className="ml-2">Loading onboarding data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-lg flex items-center justify-center">
          <Users className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900" style={{ fontSize: '1.3rem' }}>Onboarding Management</h1>
        </div>
      </div>

      {/* Hiring Pipeline */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hiring Pipeline</h2>
        <div className="space-y-3">
          {hiringPipeline.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No candidates in the hiring pipeline yet</p>
          ) : (
            hiringPipeline.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">{item.applicant_name}</h3>
                    <Badge variant="outline">{item.position}</Badge>
                    <Badge variant={
                      item.status === 'completed' ? 'default' :
                      item.status === 'onboarding' ? 'secondary' :
                      item.status === 'hired' ? 'default' :
                      'outline'
                    }>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  {item.onboarding_start_date && (
                    <p className="text-sm text-gray-600 mt-1">
                      Onboarding started: {new Date(item.onboarding_start_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {item.status === 'hired' && (
                    <Button size="sm" variant="outline">
                      Start Onboarding
                    </Button>
                  )}
                  {item.status === 'onboarding' && (
                    <Button size="sm">
                      View Progress
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Onboarding Steps */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Onboarding Steps</h2>
        <div className="space-y-4">
          {onboardingSteps.map((step) => (
            <div key={step.id} className="border border-gray-200 rounded-lg p-4">
              {editingStep?.id === step.id ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`title-${step.id}`}>Title</Label>
                    <Input
                      id={`title-${step.id}`}
                      value={editingStep.title}
                      onChange={(e) => setEditingStep({...editingStep, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`description-${step.id}`}>Description</Label>
                    <Textarea
                      id={`description-${step.id}`}
                      value={editingStep.description}
                      onChange={(e) => setEditingStep({...editingStep, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`duration-${step.id}`}>Estimated Duration (hours)</Label>
                    <Input
                      id={`duration-${step.id}`}
                      type="number"
                      value={editingStep.estimated_duration_hours}
                      onChange={(e) => setEditingStep({...editingStep, estimated_duration_hours: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => updateOnboardingStep(editingStep)}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingStep(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {step.order_index}
                      </span>
                      <h3 className="font-medium text-gray-900">{step.title}</h3>
                      {step.is_required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {step.estimated_duration_hours}h
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 ml-9">{step.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingStep(step)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Supervisors Management */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Supervisors</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="supervisor-name">Name</Label>
            <Input
              id="supervisor-name"
              value={newSupervisor.name}
              onChange={(e) => setNewSupervisor({...newSupervisor, name: e.target.value})}
              placeholder="Enter supervisor name"
            />
          </div>
          <div>
            <Label htmlFor="supervisor-email">Email</Label>
            <Input
              id="supervisor-email"
              type="email"
              value={newSupervisor.email}
              onChange={(e) => setNewSupervisor({...newSupervisor, email: e.target.value})}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <Label htmlFor="supervisor-phone">Phone (Optional)</Label>
            <Input
              id="supervisor-phone"
              value={newSupervisor.phone}
              onChange={(e) => setNewSupervisor({...newSupervisor, phone: e.target.value})}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <Label htmlFor="supervisor-department">Department (Optional)</Label>
            <Input
              id="supervisor-department"
              value={newSupervisor.department}
              onChange={(e) => setNewSupervisor({...newSupervisor, department: e.target.value})}
              placeholder="Enter department"
            />
          </div>
        </div>
        
        <Button onClick={addSupervisor} className="mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Add Supervisor
        </Button>

        <div className="space-y-3">
          {supervisors.map((supervisor) => (
            <div key={supervisor.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">{supervisor.name}</h3>
                <p className="text-sm text-gray-600">{supervisor.email}</p>
                {supervisor.department && (
                  <Badge variant="outline" className="text-xs mt-1">{supervisor.department}</Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default OnboardingManagement;
