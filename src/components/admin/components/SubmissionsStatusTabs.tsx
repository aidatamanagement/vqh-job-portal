
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
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 h-auto">
        <TabsTrigger value="all" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <span>All</span>
          <Badge variant="secondary" className="text-xs">
            {getStatusCount(submissions, 'all')}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="application_submitted" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <span>Submitted</span>
          <Badge variant="secondary" className="text-xs">
            {getStatusCount(submissions, 'application_submitted')}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="under_review" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <span>Review</span>
          <Badge variant="secondary" className="text-xs">
            {getStatusCount(submissions, 'under_review')}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="shortlisted" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <span>Shortlisted</span>
          <Badge variant="secondary" className="text-xs">
            {getStatusCount(submissions, 'shortlisted')}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="interviewed" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <span>Interviewed</span>
          <Badge variant="secondary" className="text-xs">
            {getStatusCount(submissions, 'interviewed')}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="waiting_list" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <span>Waiting</span>
          <Badge variant="secondary" className="text-xs">
            {getStatusCount(submissions, 'waiting_list')}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="hired" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
          <span>Hired</span>
          <Badge variant="secondary" className="text-xs">
            {getStatusCount(submissions, 'hired')}
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

      <TabsContent value="application_submitted" className="mt-6">
        <SubmissionsTable
          submissions={getSubmissionsByStatus(filteredSubmissions, 'application_submitted')}
          onViewApplication={onViewApplication}
          onDeleteApplication={onDeleteApplication}
          deletingApplication={deletingApplication}
        />
      </TabsContent>

      <TabsContent value="under_review" className="mt-6">
        <SubmissionsTable
          submissions={getSubmissionsByStatus(filteredSubmissions, 'under_review')}
          onViewApplication={onViewApplication}
          onDeleteApplication={onDeleteApplication}
          deletingApplication={deletingApplication}
        />
      </TabsContent>

      <TabsContent value="shortlisted" className="mt-6">
        <SubmissionsTable
          submissions={getSubmissionsByStatus(filteredSubmissions, 'shortlisted')}
          onViewApplication={onViewApplication}
          onDeleteApplication={onDeleteApplication}
          deletingApplication={deletingApplication}
        />
      </TabsContent>

      <TabsContent value="interviewed" className="mt-6">
        <SubmissionsTable
          submissions={getSubmissionsByStatus(filteredSubmissions, 'interviewed')}
          onViewApplication={onViewApplication}
          onDeleteApplication={onDeleteApplication}
          deletingApplication={deletingApplication}
        />
      </TabsContent>

      <TabsContent value="waiting_list" className="mt-6">
        <SubmissionsTable
          submissions={getSubmissionsByStatus(filteredSubmissions, 'waiting_list')}
          onViewApplication={onViewApplication}
          onDeleteApplication={onDeleteApplication}
          deletingApplication={deletingApplication}
        />
      </TabsContent>

      <TabsContent value="hired" className="mt-6">
        <SubmissionsTable
          submissions={getSubmissionsByStatus(filteredSubmissions, 'hired')}
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
