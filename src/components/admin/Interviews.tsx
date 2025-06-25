
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, Mail, Video, Filter } from 'lucide-react';
import { Interview } from '@/types';
import { useInterviews } from '@/hooks/useInterviews';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const Interviews: React.FC = () => {
  const { interviews, loading, updateInterviewStatus } = useInterviews();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = 
      interview.candidate_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (interview.interviewer_email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Interview['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingInterviews = filteredInterviews.filter(
    interview => new Date(interview.scheduled_time) > new Date() && interview.status === 'scheduled'
  );

  const pastInterviews = filteredInterviews.filter(
    interview => new Date(interview.scheduled_time) <= new Date() || interview.status !== 'scheduled'
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="flex justify-center items-center h-64">
          <div className="spinner" />
          <span className="ml-2">Loading interviews...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
          <p className="text-gray-600">Manage scheduled interviews and candidate meetings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-600">
            {upcomingInterviews.length} Upcoming
          </Badge>
          <Badge variant="outline" className="text-gray-600">
            {interviews.length} Total
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search by candidate or interviewer email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Interviews</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onStatusUpdate={updateInterviewStatus}
              />
            ))}
          </div>
        </div>
      )}

      {upcomingInterviews.length > 0 && pastInterviews.length > 0 && <Separator />}

      {/* Past/Completed Interviews */}
      {pastInterviews.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Interviews</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onStatusUpdate={updateInterviewStatus}
              />
            ))}
          </div>
        </div>
      )}

      {filteredInterviews.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters to see more results.'
                : 'Interviews will appear here when candidates schedule them.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const InterviewCard: React.FC<{
  interview: Interview;
  onStatusUpdate: (id: string, status: Interview['status']) => void;
}> = ({ interview, onStatusUpdate }) => {
  const scheduledTime = new Date(interview.scheduled_time);
  const isUpcoming = scheduledTime > new Date() && interview.status === 'scheduled';

  const getStatusColor = (status: Interview['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`${isUpcoming ? 'border-blue-200 bg-blue-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">
              {format(scheduledTime, 'MMM dd, yyyy')}
            </span>
          </div>
          <Badge className={getStatusColor(interview.status)}>
            {interview.status}
          </Badge>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{format(scheduledTime, 'h:mm a')}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{interview.candidate_email}</span>
        </div>
        
        {interview.interviewer_email && (
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{interview.interviewer_email}</span>
          </div>
        )}

        {interview.meeting_url && (
          <div className="pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={() => window.open(interview.meeting_url, '_blank')}
            >
              <Video className="h-4 w-4 mr-2" />
              Join Meeting
            </Button>
          </div>
        )}

        {interview.status === 'scheduled' && (
          <div className="pt-2 space-y-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={() => onStatusUpdate(interview.id, 'completed')}
            >
              Mark Completed
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full text-red-600 hover:text-red-700"
              onClick={() => onStatusUpdate(interview.id, 'cancelled')}
            >
              Cancel Interview
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Interviews;
