
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Trash2, Sparkles } from 'lucide-react';
import { JobApplication } from '@/types';
import { formatDate, getStatusBadgeVariant, getStatusText } from '../utils/submissionsUtils';

interface SubmissionsTableProps {
  submissions: JobApplication[];
  onViewApplication: (application: JobApplication) => void;
  onDeleteApplication: (applicationId: string) => void;
  deletingApplication: string | null;
}

// Function to check if application is new (within 7 days)
const isNewApplication = (createdAt: string): boolean => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return new Date(createdAt) > oneWeekAgo;
};

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
              <TableHead className="font-semibold min-w-[140px]">Job Location</TableHead>
              <TableHead className="font-semibold min-w-[130px]">Manager</TableHead>
              <TableHead className="font-semibold min-w-[100px]">Referral</TableHead>
              <TableHead className="font-semibold min-w-[100px]">Status</TableHead>
              <TableHead className="font-semibold text-right min-w-[160px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No applications found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((application) => {
                const isNew = isNewApplication(application.createdAt);
                return (
                  <TableRow 
                    key={application.id} 
                    className={`hover:bg-gray-50 transition-colors ${isNew ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''}`}
                  >
                    <TableCell className="min-w-[200px]">
                      <div>
                        <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                          {application.firstName} {application.lastName}
                          {isNew && (
                            <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-0.5 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[180px]">{application.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      <span className="font-medium text-gray-900 text-sm">{application.appliedPosition}</span>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <div className="flex flex-col">
                        <span className="text-gray-600 text-sm">{formatDate(application.createdAt)}</span>
                        {isNew && (
                          <span className="text-xs text-blue-600 font-medium">Recent</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      <span className="text-gray-600 text-sm">{application.jobLocation || 'Unknown Location'}</span>
                    </TableCell>
                    <TableCell className="min-w-[130px]">
                      <span className="text-gray-600 text-sm">{application.hrManagerName || 'Unassigned'}</span>
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <Badge variant={application.isReferredByEmployee ? "default" : "secondary"} className="text-xs">
                        {application.isReferredByEmployee ? "Referred" : "No Referral"}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <Badge variant={getStatusBadgeVariant(application.status)} className="text-xs">
                        {getStatusText(application.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right min-w-[160px]">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onViewApplication(application)}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-primary hover:bg-primary/90 text-white"
                        >
                          <Eye className="w-3 h-3" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={deletingApplication === application.id}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span className="hidden sm:inline">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Application</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this application from {application.firstName} {application.lastName}? 
                                This will permanently delete the application record and all uploaded files. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteApplication(application.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deletingApplication === application.id ? 'Deleting...' : 'Delete Application'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SubmissionsTable;
