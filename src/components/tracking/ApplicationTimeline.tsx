
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TimelineStep from './timeline/TimelineStep';
import StatusBadge from './timeline/StatusBadge';
import StatusMessage from './timeline/StatusMessage';
import { getTimelineSteps, getStatusIcon, formatDate, type ApplicationData } from './timeline/timelineUtils';

interface ApplicationTimelineProps {
  application: ApplicationData;
}

const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ application }) => {
  const timelineSteps = getTimelineSteps(application);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {getStatusIcon(application.status)}
          Application Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-6">
            <StatusBadge status={application.status} />
            <div className="text-sm text-gray-500">
              Last updated: {formatDate(application.updated_at)}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            {timelineSteps.map((step, index) => (
              <TimelineStep
                key={step.id}
                step={step}
                isLast={index === timelineSteps.length - 1}
                applicationStatus={application.status}
              />
            ))}
          </div>

          {/* Status-specific message */}
          <StatusMessage status={application.status} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationTimeline;
