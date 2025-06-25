
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Mail, MailCheck, MailX } from 'lucide-react';
import { useEmailSettings } from '@/hooks/useEmailSettings';

interface EmailStatusIndicatorProps {
  className?: string;
}

const EmailStatusIndicator: React.FC<EmailStatusIndicatorProps> = ({ className }) => {
  const { settings, isLoading } = useEmailSettings();

  if (isLoading) {
    return (
      <Badge variant="outline" className={className}>
        <Mail className="w-3 h-3 mr-1" />
        Loading...
      </Badge>
    );
  }

  if (!settings.enableNotifications && !settings.enableAutoResponses) {
    return (
      <Badge variant="destructive" className={className}>
        <MailX className="w-3 h-3 mr-1" />
        Emails Disabled
      </Badge>
    );
  }

  if (settings.enableNotifications && settings.enableAutoResponses) {
    return (
      <Badge variant="default" className={className}>
        <MailCheck className="w-3 h-3 mr-1" />
        All Emails Active
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={className}>
      <Mail className="w-3 h-3 mr-1" />
      Partial Email Active
    </Badge>
  );
};

export default EmailStatusIndicator;
