import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Mail, X, CheckCircle, AlertCircle, Calendar, Pencil } from 'lucide-react';
import { useEmailAutomation } from '@/hooks/useEmailAutomation';

interface DelayedEmail {
  id: string;
  template_slug: string;
  recipient_email: string;
  subject: string;
  scheduled_for: string;
  status: 'scheduled' | 'processing' | 'sent' | 'failed' | 'cancelled';
  application_id?: string;
  status_type?: string;
  created_at: string;
  sent_at?: string;
  error_message?: string;
}

const DelayedEmails: React.FC = () => {
  const [delayedEmails, setDelayedEmails] = useState<DelayedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState<DelayedEmail | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const { getDelayedEmails, cancelDelayedEmail, updateDelayedEmailSchedule } = useEmailAutomation();

  useEffect(() => {
    loadDelayedEmails();
  }, []);

  const loadDelayedEmails = async () => {
    try {
      setLoading(true);
      const emails = await getDelayedEmails();
      setDelayedEmails(emails);
    } catch (error) {
      console.error('Error loading delayed emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEmail = async (emailId: string) => {
    try {
      setCancellingId(emailId);
      await cancelDelayedEmail(emailId);
      await loadDelayedEmails(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling delayed email:', error);
    } finally {
      setCancellingId(null);
    }
  };

  const openEditDialog = (email: DelayedEmail) => {
    setEditingEmail(email);
    const dt = new Date(email.scheduled_for);
    setEditDate(dt.toISOString().split('T')[0]);
    setEditTime(dt.toTimeString().slice(0,5));
  };

  const handleSaveEdit = async () => {
    if (!editingEmail || !editDate || !editTime) return;
    try {
      setSavingEdit(true);
      const scheduledDateTime = new Date(`${editDate}T${editTime}`);
      await updateDelayedEmailSchedule(editingEmail.id, scheduledDateTime);
      setEditingEmail(null);
      await loadDelayedEmails();
    } catch (error) {
      console.error('Error updating delayed email schedule:', error);
    } finally {
      setSavingEdit(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800"><X className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTemplateDisplayName = (slug: string) => {
    const templateNames: Record<string, string> = {
      'application_submitted': 'Application Submitted',
      'shortlisted_for_hr': 'Shortlisted for HR',
      'hr_interviewed': 'HR Interviewed',
      'shortlisted_for_manager': 'Shortlisted for Manager',
      'manager_interviewed': 'Manager Interviewed',
      'hired': 'Hired',
      'application_rejected': 'Application Rejected',
      'waiting_list': 'Waiting List',
      'admin_notification': 'Admin Notification'
    };
    return templateNames[slug] || slug;
  };

  const getStatusTypeDisplayName = (statusType?: string) => {
    if (!statusType) return 'N/A';
    const statusNames: Record<string, string> = {
      'rejected': 'Rejected',
      'hired': 'Hired',
      'waiting_list': 'Waiting List'
    };
    return statusNames[statusType] || statusType;
  };

  const scheduledEmails = delayedEmails.filter(email => email.status === 'scheduled');
  const processedEmails = delayedEmails.filter(email => email.status !== 'scheduled');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delayed Emails</h1>
          <p className="text-gray-600">Manage scheduled and delayed email notifications</p>
        </div>
        <Button onClick={loadDelayedEmails} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{scheduledEmails.length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successfully Sent</p>
                <p className="text-2xl font-bold text-green-600">
                  {delayedEmails.filter(e => e.status === 'sent').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {delayedEmails.filter(e => e.status === 'failed').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-600">
                  {delayedEmails.filter(e => e.status === 'cancelled').length}
                </p>
              </div>
              <X className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Emails */}
      {scheduledEmails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Scheduled Emails ({scheduledEmails.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Scheduled For</TableHead>
                    <TableHead>Status Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.recipient_email}</TableCell>
                      <TableCell>{getTemplateDisplayName(email.template_slug)}</TableCell>
                      <TableCell className="max-w-xs truncate">{email.subject}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {formatDate(email.scheduled_for)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusTypeDisplayName(email.status_type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(email)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={cancellingId === email.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4 mr-1" />
                                {cancellingId === email.id ? 'Cancelling...' : 'Cancel'}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Delayed Email</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel this delayed email to {email.recipient_email}? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Scheduled</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelEmail(email.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Cancel Email
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processed Emails */}
      {processedEmails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Processed Emails ({processedEmails.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scheduled For</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.recipient_email}</TableCell>
                      <TableCell>{getTemplateDisplayName(email.template_slug)}</TableCell>
                      <TableCell className="max-w-xs truncate">{email.subject}</TableCell>
                      <TableCell>{getStatusBadge(email.status)}</TableCell>
                      <TableCell>{formatDate(email.scheduled_for)}</TableCell>
                      <TableCell>
                        {email.sent_at ? formatDate(email.sent_at) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {email.error_message && (
                          <div className="max-w-xs truncate text-red-600" title={email.error_message}>
                            {email.error_message}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading delayed emails...</p>
        </div>
      )}

      {!loading && delayedEmails.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Delayed Emails</h3>
            <p className="text-gray-600">There are no scheduled or processed delayed emails.</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Schedule Dialog */}
      <Dialog open={!!editingEmail} onOpenChange={(open) => !open && setEditingEmail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Scheduled Time</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input id="edit-date" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-time">Time</Label>
              <Input id="edit-time" type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingEmail(null)}>Close</Button>
            <Button onClick={handleSaveEdit} disabled={!editDate || !editTime || savingEdit}>
              {savingEdit ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DelayedEmails;
