
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react';

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

interface InterviewCardProps {
  interview: Interview;
}

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

export const InterviewCard: React.FC<InterviewCardProps> = ({ interview }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Candidate Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {interview.first_name} {interview.last_name}
                </h3>
                <p className="text-gray-600">{interview.applied_position}</p>
              </div>
              <Badge variant={getStatusBadgeVariant(interview.status)}>
                {interview.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{interview.candidate_email}</span>
              </div>
              
              {interview.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{interview.phone}</span>
                </div>
              )}
              
              {interview.city_state && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{interview.city_state}</span>
                </div>
              )}
              
              {interview.interviewer_email && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Interviewer: {interview.interviewer_email}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Interview Details */}
          <div className="lg:w-80 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>
                {new Date(interview.scheduled_time).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>
                {new Date(interview.scheduled_time).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            
            <div className="flex gap-2">
              {interview.meeting_url && (
                <Button
                  onClick={() => window.open(interview.meeting_url, '_blank')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  Join Meeting
                </Button>
              )}
              
              <Button
                onClick={() => window.open(interview.calendly_event_uri, '_blank')}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Calendar className="w-3 h-3" />
                View in Calendly
              </Button>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>Scheduled: {new Date(interview.created_at).toLocaleDateString()}</p>
              <p>Event ID: {interview.calendly_event_id}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
