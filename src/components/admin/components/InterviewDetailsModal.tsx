
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Video
} from 'lucide-react';

interface InterviewDetailsModalProps {
  interview: {
    id: string;
    first_name?: string;
    last_name?: string;
    candidate_email: string;
    phone?: string;
    applied_position?: string;
    city_state?: string;
    scheduled_time: string;
    meeting_url?: string;
    status: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const InterviewDetailsModal: React.FC<InterviewDetailsModalProps> = ({
  interview,
  isOpen,
  onClose,
}) => {
  if (!interview) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Interview Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Candidate Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {interview.first_name} {interview.last_name}
              </h3>
              <Badge variant={getStatusBadgeVariant(interview.status)}>
                {interview.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span>{interview.applied_position}</span>
              </div>
              
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
            </div>
          </div>
          
          {/* Interview Schedule */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formatDate(interview.scheduled_time)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{formatTime(interview.scheduled_time)}</span>
            </div>
          </div>
          
          {/* Meeting Link */}
          {interview.meeting_url && (
            <div className="border-t pt-4">
              <Button
                onClick={() => window.open(interview.meeting_url, '_blank')}
                className="w-full flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                Join Meeting
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewDetailsModal;
