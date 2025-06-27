
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, RefreshCw } from 'lucide-react';
import InterviewDetailsModal from './InterviewDetailsModal';

interface Interview {
  id: string;
  application_id: string;
  calendly_event_id: string;
  calendly_event_uri: string;
  candidate_email: string;
  interviewer_email?: string;
  scheduled_time: string;
  meeting_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  applied_position?: string;
  city_state?: string;
}

interface InterviewsTableProps {
  interviews: Interview[];
  isLoading: boolean;
  onUpdateStatus: (interviewId: string, completed: boolean) => Promise<void>;
}

const InterviewsTable: React.FC<InterviewsTableProps> = ({
  interviews,
  isLoading,
  onUpdateStatus,
}) => {
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [updatingStatuses, setUpdatingStatuses] = useState<Set<string>>(new Set());

  const handleStatusChange = async (interview: Interview, completed: boolean) => {
    setUpdatingStatuses(prev => new Set(prev).add(interview.id));
    try {
      await onUpdateStatus(interview.id, completed);
    } finally {
      setUpdatingStatuses(prev => {
        const newSet = new Set(prev);
        newSet.delete(interview.id);
        return newSet;
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'no_show':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Loading interviews...</span>
        </CardContent>
      </Card>
    );
  }

  if (interviews.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No interviews found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Done</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="w-20">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews.map((interview) => {
                const dateTime = formatDateTime(interview.scheduled_time);
                const isCompleted = interview.status === 'completed';
                const isUpdating = updatingStatuses.has(interview.id);

                return (
                  <TableRow key={interview.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={isCompleted}
                          disabled={isUpdating}
                          onCheckedChange={(checked) => 
                            handleStatusChange(interview, checked as boolean)
                          }
                        />
                        {isUpdating && (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {interview.first_name} {interview.last_name}
                    </TableCell>
                    <TableCell>{interview.applied_position}</TableCell>
                    <TableCell>{interview.candidate_email}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(interview.status)}>
                        {interview.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{dateTime}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedInterview(interview)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InterviewDetailsModal
        interview={selectedInterview}
        isOpen={!!selectedInterview}
        onClose={() => setSelectedInterview(null)}
      />
    </>
  );
};

export default InterviewsTable;
