
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';
import { useEmailAutomation } from '@/hooks/useEmailAutomation';

interface Application {
  id: string;
  created_at: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resume: string;
  coverLetter: string;
  additionalNotes: string;
  appliedPosition: string;
  status: string;
  jobs: {
    title: string;
    location: string;
  };
  tracking_token: string;
}

const Submissions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();
  const { sendApplicationStatusEmail } = useEmailAutomation();

  const { isLoading, error, data: applications, refetch } = useQuery({
    queryKey: ['applications', searchQuery, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('applications')
        .select(`
          *,
          jobs (
            title,
            location
          )
        `)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('firstName', `%${searchQuery}%`);
      }

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return data as Application[];
    },
  });

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      console.log(`Updating application ${applicationId} to status: ${newStatus}`);
      
      // First update the status in database
      const { data: updatedApplication, error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select(`
          *,
          jobs (
            title,
            location
          )
        `)
        .single();

      if (error) {
        console.error('Error updating application status:', error);
        throw error;
      }

      console.log('Application updated successfully:', updatedApplication);

      // Send email notification for approved/rejected status
      if (newStatus === 'approved' || newStatus === 'rejected') {
        try {
          console.log('Sending status update email...');
          await sendApplicationStatusEmail({
            id: updatedApplication.id,
            email: updatedApplication.email,
            firstName: updatedApplication.firstName,
            lastName: updatedApplication.lastName,
            appliedPosition: updatedApplication.appliedPosition,
            status: newStatus,
            trackingToken: updatedApplication.tracking_token
          });
          
          toast({
            title: "Status Updated",
            description: `Application ${newStatus} and notification email sent to ${updatedApplication.email}`,
          });
        } catch (emailError) {
          console.error('Failed to send status email:', emailError);
          toast({
            title: "Status Updated",
            description: `Application ${newStatus} but failed to send email notification`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Status Updated",
          description: `Application status changed to ${newStatus}`,
        });
      }

      refetch();

    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy - hh:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Submissions</h2>
          <p className="text-gray-600">Manage job application submissions</p>
        </div>
      </div>
      <Card className="p-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-1">
            <Label htmlFor="search">Search</Label>
            <Input
              type="search"
              id="search"
              placeholder="Search by first name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <Label htmlFor="status">Filter by Status</Label>
            <Select onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1">
            <Label htmlFor="refresh">Quick Actions</Label>
            <Button onClick={() => refetch()} className="w-full">
              Refresh Data
            </Button>
          </div>
        </div>
      </Card>
      <div className="md:col-span-2 lg:col-span-3">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications?.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="font-medium">{application.firstName} {application.lastName}</div>
                    <div className="text-sm text-gray-500">{application.email}</div>
                  </TableCell>
                  <TableCell>{application.jobs?.title || application.appliedPosition}</TableCell>
                  <TableCell>{formatDate(application.created_at)}</TableCell>
                  <TableCell>
                    {application.status === 'approved' ? (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                        Approved
                      </div>
                    ) : application.status === 'rejected' ? (
                      <div className="flex items-center">
                        <XCircle className="w-4 h-4 mr-1 text-red-500" />
                        Rejected
                      </div>
                    ) : (
                      application.status
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <DotsHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => window.open(application.resume, '_blank')}>
                          View Resume
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(application.coverLetter, '_blank')}>
                          View Cover Letter
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateApplicationStatus(application.id, 'pending')}>
                          Mark as Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateApplicationStatus(application.id, 'approved')}>
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateApplicationStatus(application.id, 'rejected')}>
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateApplicationStatus(application.id, 'on-hold')}>
                          Mark as On Hold
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateApplicationStatus(application.id, 'interviewing')}>
                          Mark as Interviewing
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default Submissions;
