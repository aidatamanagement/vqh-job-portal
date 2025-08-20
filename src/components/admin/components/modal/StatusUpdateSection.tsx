import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JobApplication } from '@/types';
import { getStatusText, getValidNextStatuses, validateStatusTransition } from '../../utils/submissionsUtils';
import StatusTransitionValidator from '../../StatusTransitionValidator';
import { useStatusUpdate } from '@/hooks/useStatusUpdate';
import { useEmailAutomation } from '@/hooks/useEmailAutomation';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock, Mail } from 'lucide-react';

type ApplicationStatus = 'application_submitted' | 'shortlisted_for_hr' | 'hr_interviewed' | 'shortlisted_for_manager' | 'manager_interviewed' | 'hired' | 'rejected' | 'waiting_list';

interface StatusUpdateSectionProps {
  application: JobApplication;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  refreshSubmissions?: () => void;
}

const StatusUpdateSection: React.FC<StatusUpdateSectionProps> = ({
  application,
  onUpdateStatus,
  refreshSubmissions
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [scheduleEmail, setScheduleEmail] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const { updateApplicationStatus, isUpdating } = useStatusUpdate();
  const { sendStatusChangeNotification, getDelayedEmails, updateDelayedEmailSchedule, cancelDelayedEmail } = useEmailAutomation();

  const allStatusOptions = [
    { value: 'application_submitted', label: 'Application Submitted' },
    { value: 'shortlisted_for_hr', label: 'Shortlisted for HR Round' },
    { value: 'hr_interviewed', label: 'HR Interviewed' },
    { value: 'shortlisted_for_manager', label: 'Shortlisted for Manager Interview' },
    { value: 'manager_interviewed', label: 'Manager Interviewed' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'waiting_list', label: 'Waiting List' },
  ];

  const validNextStatuses = getValidNextStatuses(application.status);
  const statusOptions = allStatusOptions.filter(option => 
    validNextStatuses.includes(option.value)
  );

  const isTransitionValid = selectedStatus ? validateStatusTransition(application.status, selectedStatus) : false;
  const isNotesValid = notes.trim().length > 0;
  const isRejectedStatus = selectedStatus === 'rejected';
  const isSchedulingValid = !scheduleEmail || (scheduledDate && scheduledTime);

  // Track if an active schedule already exists for this application
  const [hasActiveSchedule, setHasActiveSchedule] = useState(false);
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);

  // Set default scheduled date to tomorrow at 9 AM
  React.useEffect(() => {
    if (isRejectedStatus && scheduleEmail && !scheduledDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setScheduledDate(tomorrow.toISOString().split('T')[0]);
      setScheduledTime('09:00');
    }
  }, [isRejectedStatus, scheduleEmail, scheduledDate]);

  // Check existing delayed email for this application
  React.useEffect(() => {
    let cancelled = false;
    async function checkExisting() {
      try {
        const existing = await getDelayedEmails(application.id);
        const active = (existing || []).find((e: any) => e.status === 'scheduled' || e.status === 'processing');
        if (!cancelled) {
          setHasActiveSchedule(!!active);
          setActiveScheduleId(active ? active.id : null);
          if (active?.scheduled_for) {
            const dt = new Date(active.scheduled_for);
            setScheduledDate(dt.toISOString().split('T')[0]);
            setScheduledTime(dt.toTimeString().slice(0,5));
          }
        }
      } catch {}
    }
    if (isRejectedStatus) checkExisting();
    return () => { cancelled = true };
  }, [application.id, isRejectedStatus, getDelayedEmails]);

  const handleStatusUpdateClick = () => {
    if (!selectedStatus || selectedStatus === application.status || !isTransitionValid || !isNotesValid || !isSchedulingValid) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === application.status || !isTransitionValid || !isNotesValid || !isSchedulingValid) return;
    
    try {
      console.log('Updating status from modal:', { 
        applicationId: application.id, 
        currentStatus: application.status, 
        newStatus: selectedStatus,
        notes: notes.trim(),
        scheduleEmail,
        scheduledDate,
        scheduledTime
      });
      
      const result = await updateApplicationStatus(application.id, selectedStatus as ApplicationStatus, notes.trim(), isRejectedStatus && scheduleEmail);
      
      if (result.success) {
        // If rejected status and email scheduling is enabled, send delayed email
        if (isRejectedStatus && scheduleEmail && scheduledDate && scheduledTime) {
          try {
            const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
            
            // Send delayed email notification with the NEW status (rejected)
            await sendStatusChangeNotification(
              {
                email: application.email,
                firstName: application.firstName,
                lastName: application.lastName,
                appliedPosition: application.appliedPosition,
                status: selectedStatus as ApplicationStatus, // Use the NEW status, not the current one
                id: application.id
              },
              { location: application.jobLocation },
              undefined, // trackingToken
              {
                scheduledFor: scheduledDateTime,
                applicationId: application.id,
                status: selectedStatus // Use the NEW status
              }
            );
            
            console.log('Delayed rejection email scheduled for:', scheduledDateTime);
          } catch (emailError) {
            console.error('Failed to schedule delayed email:', emailError);
            toast({
              title: "Email Scheduling Failed",
              description: "Status updated but failed to schedule delayed email. Please check the delayed emails section.",
              variant: "destructive",
            });
          }
        }
        
        console.log('Status update successful, calling onUpdateStatus and refreshSubmissions');
        onUpdateStatus(application.id, selectedStatus as ApplicationStatus);
        
        // Refresh submissions data to update the frontend
        if (refreshSubmissions) {
          console.log('Calling refreshSubmissions function...');
          refreshSubmissions();
          console.log('refreshSubmissions function called');
        } else {
          console.log('refreshSubmissions function not provided');
        }
        
        // Check if job was deactivated due to hire
        const jobDeactivatedMessage = selectedStatus === 'hired' ? ' The job posting has been automatically deactivated.' : '';
        const emailScheduledMessage = isRejectedStatus && scheduleEmail ? ' Rejection email scheduled for delayed delivery.' : '';
        
        toast({
          title: "Status Updated Successfully",
          description: `Application status has been updated to ${getStatusText(selectedStatus)}.${emailScheduledMessage}${jobDeactivatedMessage}`,
        });
        
        setSelectedStatus('');
        setNotes('');
        setScheduleEmail(false);
        setScheduledDate('');
        setScheduledTime('');
        setShowConfirmDialog(false);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: "Update Failed",
        description: `Failed to update application status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setShowConfirmDialog(false);
    }
  };

  const getEnhancedStatusBadge = (status: string) => {
    const baseClasses = "font-semibold px-3 py-1 text-sm border-2 shadow-sm rounded-lg";
    
    switch (status) {
      case 'hired':
        return `${baseClasses} bg-green-100 text-green-800 border-green-300`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800 border-red-300`;
      case 'shortlisted':
        return `${baseClasses} bg-blue-100 text-blue-800 border-blue-300`;
      case 'interviewed':
        return `${baseClasses} bg-purple-100 text-purple-800 border-purple-300`;
      case 'under_review':
        return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-300`;
      case 'waiting_list':
        return `${baseClasses} bg-orange-100 text-orange-800 border-orange-300`;
      case 'application_submitted':
        return `${baseClasses} bg-gray-100 text-gray-800 border-gray-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border-gray-300`;
    }
  };

  return (
    <div className="flex-1">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Update Application Status</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">Current Status:</span>
          <span className={getEnhancedStatusBadge(application.status)}>
            {getStatusText(application.status)}
          </span>
        </div>
        
        {statusOptions.length === 0 ? (
          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
            No status transitions available from current status.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 max-w-xs">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full bg-white border-gray-300 focus:border-primary focus:ring-primary">
                    <SelectValue placeholder="Select new status..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50 max-h-60">
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="hover:bg-gray-100 cursor-pointer">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email Scheduling Section for Rejected Status */}
            {isRejectedStatus && (
              <Card className="border-blue-200 bg-blue-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Scheduling Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="schedule-email"
                      checked={scheduleEmail}
                      onCheckedChange={(checked) => setScheduleEmail(checked as boolean)}
                    />
                    <Label htmlFor="schedule-email" className="text-sm font-medium text-blue-900">
                      Schedule delayed email delivery
                    </Label>
                  </div>
                  
                  {(scheduleEmail || hasActiveSchedule) && (
                    <div className="space-y-3 pl-6">
                      <p className="text-xs text-blue-700">
                        {hasActiveSchedule ? 'Edit the scheduled time for this rejection email.' : 'Schedule when the rejection email should be sent to the candidate. This allows for better timing and professional communication.'}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="scheduled-date" className="text-xs font-medium text-blue-900 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Date
                          </Label>
                          <Input
                            id="scheduled-date"
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="text-sm"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="scheduled-time" className="text-xs font-medium text-blue-900 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Time
                          </Label>
                          <Input
                            id="scheduled-time"
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      
                      {scheduledDate && scheduledTime && (
                        <div className="space-y-3">
                          <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                            Email will be sent on {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            This schedule will be saved when you click <strong>Update Status</strong>.
                          </div>
                          {hasActiveSchedule && activeScheduleId && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await cancelDelayedEmail(activeScheduleId);
                                  setHasActiveSchedule(false);
                                  setActiveScheduleId(null);
                                  toast({ title: '🗑️ Schedule Cancelled', description: 'The delayed email has been cancelled.' });
                                } catch (e) {
                                  toast({ title: 'Failed to cancel', variant: 'destructive' });
                                }
                              }}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Cancel Schedule
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Mandatory Notes Section */}
            <div className="space-y-2">
              <Label htmlFor="status-notes" className="text-sm font-medium text-gray-700">
                Notes <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="status-notes"
                placeholder="Enter notes explaining this status change (required)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] resize-none bg-white border-gray-300 focus:border-primary focus:ring-primary"
                required
              />
              {!isNotesValid && notes.length > 0 && (
                <p className="text-sm text-red-600">Notes cannot be empty. Please provide details about this status change.</p>
              )}
            </div>
            
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  onClick={handleStatusUpdateClick}
                  disabled={!selectedStatus || !isTransitionValid || !isNotesValid || !isSchedulingValid || isUpdating}
                  className="bg-primary hover:bg-primary/90 min-w-[100px] whitespace-nowrap"
                >
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to update the application status from{' '}
                    <strong>{getStatusText(application.status)}</strong> to{' '}
                    <strong>{selectedStatus ? getStatusText(selectedStatus) : ''}</strong>?
                  <br />
                  <br />
                  <strong>Notes:</strong> {notes.trim()}
                  {isRejectedStatus && scheduleEmail && scheduledDate && scheduledTime && (
                    <>
                      <br />
                      <br />
                      <strong>Email Scheduling:</strong> Rejection email will be sent on{' '}
                      {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                    </>
                  )}
                    <br />
                    <br />
                    This will send an email notification to the candidate and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmStatusUpdate} disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : 'Confirm Update'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {selectedStatus && (
          <div className="mt-4">
            <StatusTransitionValidator
              currentStatus={application.status}
              newStatus={selectedStatus}
              isValid={isTransitionValid}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusUpdateSection;
