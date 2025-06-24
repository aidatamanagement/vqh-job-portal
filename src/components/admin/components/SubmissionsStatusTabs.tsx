
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JobApplication } from '@/types';
import SubmissionsTable from './SubmissionsTable';
import { getSubmissionsByStatus, getStatusCount } from '../utils/submissionsUtils';

interface SubmissionsStatusTabsProps {
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  filteredSubmissions: JobApplication[];
  onViewApplication: (application: JobApplication) => void;
  onDeleteApplication: (applicationId: string) => void;
  deletingApplication: string | null;
  submissions: JobApplication[];
}

const SubmissionsStatusTabs: React.FC<SubmissionsStatusTabsProps> = ({
  statusFilter,
  setStatusFilter,
  filteredSubmissions,
  onViewApplication,
  onDeleteApplication,
  deletingApplication,
  submissions
}) => {
  return (
    <Tabs 
      value={statusFilter} 
      onValueChange={setStatusFilter}
      className="w-full animate-slide-up-delayed-2"
    >
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
        <TabsTrigger value="all" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <span>All</span>
          <Badge variant="secondary" className="text-xs">
            {getStatusCount(submissions, 'all')}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="waiting" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <span>Pending</span>
          <Badge variant="secondary" className="text-xs">
            {getStatusCount(submissions, 'waiting')}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="approved" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <span>Approved</span>
          <Badge variant="secondary" className="text-xs">
            {getStatusCount(submissions, 'approved')}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="rejected" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <span>Rejected</span>
          <Badge variant="secondary" className="text-xs">
            {getStatusCount(submissions, 'rejected')}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-6">
        <SubmissionsTable
          submissions={getSubmissionsByStatus(filteredSubmissions, 'all')}
          onViewApplication={onViewApplication}
          onDeleteApplication={onDeleteApplication}
          deletingApplication={deletingApplication}
        />
      </TabsContent>

      <TabsContent value="waiting" className="mt-6">
        <SubmissionsTable
          submissions={getSubmissionsByStatus(filteredSubmissions, 'waiting')}
          onViewApplication={onViewApplication}
          onDeleteApplication={onDeleteApplication}
          deletingApplication={deletingApplication}
        />
      </TabsContent>

      <TabsContent value="approved" className="mt-6">
        <SubmissionsTable
          submissions={getSubmissionsByStatus(filteredSubmissions, 'approved')}
          onViewApplication={onViewApplication}
          onDeleteApplication={onDeleteApplication}
          deletingApplication={deletingApplication}
        />
      </TabsContent>

      <TabsContent value="rejected" className="mt-6">
        <SubmissionsTable
          submissions={getSubmissionsByStatus(filteredSubmissions, 'rejected')}
          onViewApplication={onViewApplication}
          onDeleteApplication={onDeleteApplication}
          deletingApplication={deletingApplication}
        />
      </TabsContent>
    </Tabs>
  );
};

export default SubmissionsStatusTabs;
