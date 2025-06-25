
import React from 'react';

interface TimelineStepProps {
  step: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    status: 'completed' | 'current';
    date: string;
  };
  isLast: boolean;
  applicationStatus: string;
}

const TimelineStep: React.FC<TimelineStepProps> = ({ step, isLast, applicationStatus }) => {
  const getStepStyles = (step: TimelineStepProps['step']) => {
    switch (step.status) {
      case 'completed':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          titleColor: 'text-gray-900',
          descColor: 'text-gray-600'
        };
      case 'current':
        return {
          iconBg: applicationStatus === 'hired' ? 'bg-green-100' : applicationStatus === 'rejected' ? 'bg-red-100' : 'bg-blue-100',
          iconColor: applicationStatus === 'hired' ? 'text-green-600' : applicationStatus === 'rejected' ? 'text-red-600' : 'text-blue-600',
          titleColor: 'text-gray-900',
          descColor: 'text-gray-600'
        };
      default:
        return {
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-400',
          titleColor: 'text-gray-500',
          descColor: 'text-gray-400'
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const styles = getStepStyles(step);

  return (
    <div className="relative">
      <div className="flex items-start gap-4">
        {/* Timeline dot */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${styles.iconBg} relative z-10`}>
          <div className={styles.iconColor}>
            {step.icon}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold ${styles.titleColor}`}>
            {step.title}
          </p>
          <p className={`text-sm ${styles.descColor} mt-1`}>
            {step.description}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {formatDate(step.date)}
          </p>
        </div>
      </div>
      
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-4 top-8 w-px h-6 bg-gray-200"></div>
      )}
    </div>
  );
};

export default TimelineStep;
