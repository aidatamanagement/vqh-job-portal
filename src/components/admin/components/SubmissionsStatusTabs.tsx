
import React from 'react';
import { JobApplication } from '@/types';
import SubmissionsTable from './SubmissionsTable';

interface SubmissionsStatusTabsProps {
  statusFilter: string;
  filteredSubmissions: JobApplication[];
  onViewApplication: (application: JobApplication) => void;
  onDeleteApplication: (applicationId: string) => void;
  deletingApplication: string | null;
  submissions: JobApplication[];
}

const SubmissionsStatusTabs: React.FC<SubmissionsStatusTabsProps> = ({
  filteredSubmissions,
  onViewApplication,
  onDeleteApplication,
  deletingApplication,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm animate-slide-up-delayed">
      <SubmissionsTable
        submissions={filteredSubmissions}
        onViewApplication={onViewApplication}
        onDeleteApplication={onDeleteApplication}
        deletingApplication={deletingApplication}
      />
    </div>
  );
};

export default SubmissionsStatusTabs;
