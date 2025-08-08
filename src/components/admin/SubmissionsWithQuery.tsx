import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Trash2, Loader2 } from 'lucide-react';
import { useSubmissionsQuery } from '@/hooks/useSubmissionsQuery';
import { JobApplication } from '@/types';
import { 
  formatDate, 
  getStatusBadgeVariant, 
  getStatusText, 
  getValidNextStatuses, 
  validateStatusTransition,
  getUniquePositions,
  getUniqueHrManagers,
  filterSubmissions,
  sortSubmissions,
  getSubmissionsByStatus,
  getStatusCount,
} from '@/components/admin/utils/submissionsUtils';
import ApplicationModal from '@/components/admin/components/modal/ApplicationModal';
import StatusUpdateModal from '@/components/admin/components/modal/StatusUpdateModal';
import { toast } from '@/hooks/use-toast';

const SubmissionsWithQuery: React.FC = () => {
  // TanStack Query hook for submissions with automatic background updates
  const {
    submissions,
    isLoading,
    error,
    refetch,
    deleteSubmission,
    isDeleting,
    deleteError
  } = useSubmissionsQuery();

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [hrManagerFilter, setHrManagerFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [deletingApplication, setDeletingApplication] = useState<string | null>(null);

  // Derived data using useMemo for performance
  const filteredSubmissions = useMemo(() => {
    return filterSubmissions(submissions, {
      searchTerm,
      statusFilter,
      positionFilter,
      hrManagerFilter,
      sortBy
    });
  }, [submissions, searchTerm, statusFilter, positionFilter, hrManagerFilter, sortBy]);

  const statusCounts = useMemo(() => getStatusCount(submissions), [submissions]);
  const uniquePositions = useMemo(() => getUniquePositions(submissions), [submissions]);
  const uniqueHrManagers = useMemo(() => getUniqueHrManagers(submissions), [submissions]);

  // Handle application deletion
  const handleDeleteApplication = async (applicationId: string) => {
    if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      setDeletingApplication(applicationId);
      try {
        await deleteSubmission(applicationId);
        toast({
          title: "Application Deleted",
          description: "The application has been successfully deleted.",
        });
      } catch (error) {
        console.error('Error deleting application:', error);
        toast({
          title: "Deletion Failed",
          description: "Failed to delete the application. Please try again.",
          variant: "destructive",
        });
      } finally {
        setDeletingApplication(null);
      }
    }
  };

  // Handle status update
  const handleStatusUpdate = (applicationId: string, newStatus: string) => {
    const application = submissions.find(app => app.id === applicationId);
    if (application) {
      setSelectedApplication(application);
      setShowStatusModal(true);
    }
  };

  // Handle status update success
  const handleStatusUpdateSuccess = () => {
    setShowStatusModal(false);
    setSelectedApplication(null);
    // TanStack Query will automatically refetch the data
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Error loading submissions</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Submissions</h1>
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : `${filteredSubmissions.length} applications`}
          </p>
        </div>
        <Button 
          onClick={() => refetch()} 
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status} className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm text-gray-600">{getStatusText(status as any)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.keys(statusCounts).map(status => (
                    <SelectItem key={status} value={status}>
                      {getStatusText(status as any)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Position</label>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {uniquePositions.map(position => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">HR Manager</label>
              <Select value={hrManagerFilter} onValueChange={setHrManagerFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Managers</SelectItem>
                  {uniqueHrManagers.map(manager => (
                    <SelectItem key={manager} value={manager}>
                      {manager}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Position</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">HR Manager</th>
                    <th className="text-left p-2">Applied</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((application) => (
                    <tr key={application.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">
                            {application.firstName} {application.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{application.email}</div>
                        </div>
                      </td>
                      <td className="p-2">{application.appliedPosition}</td>
                      <td className="p-2">
                        <Badge variant={getStatusBadgeVariant(application.status)}>
                          {getStatusText(application.status)}
                        </Badge>
                      </td>
                      <td className="p-2">{application.hrManagerName}</td>
                      <td className="p-2">{formatDate(application.createdAt)}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowApplicationModal(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(application.id, application.status)}
                          >
                            Update Status
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteApplication(application.id)}
                            disabled={deletingApplication === application.id}
                          >
                            {deletingApplication === application.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedApplication && showApplicationModal && (
        <ApplicationModal
          application={selectedApplication}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedApplication(null);
          }}
        />
      )}

      {selectedApplication && showStatusModal && (
        <StatusUpdateModal
          application={selectedApplication}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedApplication(null);
          }}
          onUpdateSuccess={handleStatusUpdateSuccess}
        />
      )}
    </div>
  );
};

export default SubmissionsWithQuery; 