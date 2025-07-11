
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
import { Eye, RefreshCw, Github, Linkedin, MapPin, Clock, User } from 'lucide-react';
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
  job_title?: string;
  job_location?: string;
  job_position?: string;
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
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    let datePrefix = '';
    if (isToday) {
      datePrefix = 'Today';
    } else if (isTomorrow) {
      datePrefix = 'Tomorrow';
    } else {
      datePrefix = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
    
    const timeString = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    return `${datePrefix} at ${timeString}`;
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      case 'no_show':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-gray-600">Loading scheduled interviews...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (interviews.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming interviews</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                When interviews are scheduled through Calendly, they'll appear here automatically. 
                The system syncs every 10 minutes to keep everything up to date.
              </p>
            </div>
            <div className="flex justify-center space-x-4 pt-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Done</TableHead>
                  <TableHead>Interview Details</TableHead>
                  <TableHead className="hidden md:table-cell">Position</TableHead>
                  <TableHead className="hidden lg:table-cell">Job Location</TableHead>
                  <TableHead className="hidden xl:table-cell">Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled Time</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((interview) => {
                  const dateTime = formatDateTime(interview.scheduled_time);
                  const isCompleted = interview.status === 'completed';
                  const isUpdating = updatingStatuses.has(interview.id);
                  const candidateName = `${interview.first_name || ''} ${interview.last_name || ''}`.trim() || 'Unknown Candidate';

                  return (
                    <TableRow key={interview.id} className="hover:bg-gray-50">
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
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{candidateName}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {interview.candidate_email}
                          </div>
                          {interview.city_state && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span>{interview.city_state}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm font-medium text-gray-900">
                          {interview.applied_position || 'Not specified'}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {interview.job_location || 'Not specified'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="text-sm text-gray-600">
                          {interview.phone && (
                            <div>{interview.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(interview.status)}>
                          {interview.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{dateTime}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(interview.scheduled_time).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
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
          </div>
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
