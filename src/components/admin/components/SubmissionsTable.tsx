
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye } from 'lucide-react';
import { JobApplication } from '@/types';
import { formatDate, getStatusBadgeVariant, getStatusText } from '../utils/submissionsUtils';

interface SubmissionsTableProps {
  submissions: JobApplication[];
  onViewApplication: (application: JobApplication) => void;
  onDeleteApplication: (applicationId: string) => void;
  deletingApplication: string | null;
}

const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  submissions,
  onViewApplication,
  onDeleteApplication,
  deletingApplication
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold min-w-[200px]">Candidate</TableHead>
              <TableHead className="font-semibold min-w-[150px]">Position</TableHead>
              <TableHead className="font-semibold min-w-[120px]">Applied Date</TableHead>
              <TableHead className="font-semibold min-w-[140px]">Location</TableHead>
              <TableHead className="font-semibold min-w-[100px]">Status</TableHead>
              <TableHead className="font-semibold text-right min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No applications found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((application) => (
                <TableRow key={application.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="min-w-[200px]">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {application.firstName} {application.lastName}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[180px]">{application.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[150px]">
                    <span className="font-medium text-gray-900 text-sm">{application.appliedPosition}</span>
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    <span className="text-gray-600 text-sm">{formatDate(application.createdAt)}</span>
                  </TableCell>
                  <TableCell className="min-w-[140px]">
                    <span className="text-gray-600 text-sm">{application.cityState}</span>
                  </TableCell>
                  <TableCell className="min-w-[100px]">
                    <Badge variant={getStatusBadgeVariant(application.status)} className="text-xs">
                      {getStatusText(application.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right min-w-[100px]">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewApplication(application)}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SubmissionsTable;
