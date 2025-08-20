
import React from 'react';
import { JobApplication } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock } from 'lucide-react';
import SubmissionsTable from './SubmissionsTable';

interface SubmissionsStatusTabsProps {
  statusFilter: string;
  filteredSubmissions: JobApplication[];
  onViewApplication: (application: JobApplication) => void;
  onDeleteApplication: (applicationId: string) => void;
  deletingApplication: string | null;
  submissions: JobApplication[];
}

// Function to check if application is new (within 7 days)
const isNewApplication = (createdAt: string): boolean => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return new Date(createdAt) > oneWeekAgo;
};

const SubmissionsStatusTabs: React.FC<SubmissionsStatusTabsProps> = ({
  filteredSubmissions,
  onViewApplication,
  onDeleteApplication,
  deletingApplication,
  submissions,
}) => {
  // Calculate new applications count
  const newApplicationsCount = submissions.filter(app => isNewApplication(app.createdAt)).length;
  const filteredNewApplicationsCount = filteredSubmissions.filter(app => isNewApplication(app.createdAt)).length;

  return (
    <div className="space-y-4">

      {/* Submissions Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm animate-slide-up-delayed">
        <SubmissionsTable
          submissions={filteredSubmissions}
          onViewApplication={onViewApplication}
          onDeleteApplication={onDeleteApplication}
          deletingApplication={deletingApplication}
        />
      </div>
    </div>
  );
};

export default SubmissionsStatusTabs;
