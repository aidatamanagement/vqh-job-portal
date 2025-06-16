import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Eye, X, FileText, Download, ExternalLink, Inbox } from 'lucide-react';
import { JobApplication } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Submissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [viewingFile, setViewingFile] = useState<{ url: string; name: string } | null>(null);

  // Fetch submissions from Supabase
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      console.log('Fetching submissions from Supabase...');

      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        toast({
          title: "Error",
          description: "Failed to load submissions. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Fetched submissions:', data);

      // Transform data to match the expected format
      const transformedSubmissions: JobApplication[] = data.map(item => ({
        id: item.id,
        jobId: item.job_id,
        firstName: item.first_name,
        lastName: item.last_name,
        email: item.email,
        phone: item.phone || '',
        appliedPosition: item.applied_position,
        earliestStartDate: item.earliest_start_date || '',
        cityState: item.city_state || '',
        coverLetter: item.cover_letter || '',
        resumeUrl: getResumeUrl(item.id), // Use the uploaded resume URL pattern
        additionalDocsUrls: item.additional_docs_urls || [],
        status: item.status as 'waiting' | 'approved' | 'rejected',
        notes: '',
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      setSubmissions(transformedSubmissions);
    } catch (error) {
      console.error('Error in fetchSubmissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get resume URL from Supabase storage
  const getResumeUrl = (applicationId: string) => {
    // Try common file extensions for resume
    const extensions = ['pdf', 'doc', 'docx'];
    // For now, return the most likely URL - in production you might want to query storage
    return `https://dtmwyzrleyevcgtfwrnr.supabase.co/storage/v1/object/public/job-applications/${applicationId}/resume.pdf`;
  };

  // Update application status in Supabase
  const updateApplicationStatus = async (id: string, newStatus: 'waiting' | 'approved' | 'rejected') => {
    try {
      console.log('Updating application status:', { id, newStatus });

      const { error } = await supabase
        .from('job_applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Error",
          description: "Failed to update application status. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setSubmissions(prev => prev.map(app => 
        app.id === id 
          ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
          : app
      ));

      if (selectedApplication && selectedApplication.id === id) {
        setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null);
      }

      toast({
        title: "Status Updated",
        description: `Application status has been updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error in updateApplicationStatus:', error);
      toast({
        title: "Error",
        description: "Failed to update application status. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = searchTerm === '' || 
      submission.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.appliedPosition.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesPosition = positionFilter === 'all' || submission.appliedPosition === positionFilter;
    
    return matchesSearch && matchesStatus && matchesPosition;
  });

  const getSubmissionsByStatus = (status: string) => {
    if (status === 'all') return filteredSubmissions;
    return filteredSubmissions.filter(submission => submission.status === status);
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return submissions.length;
    return submissions.filter(submission => submission.status === status).length;
  };

  const hasActiveFilters = searchTerm !== '' || positionFilter !== 'all';

  const clearAllFilters = () => {
    setSearchTerm('');
    setPositionFilter('all');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUniquePositions = () => {
    const positions = [...new Set(submissions.map(s => s.appliedPosition))];
    return positions;
  };

  const openFileViewer = (url: string, name: string) => {
    setViewingFile({ url, name });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#005586' }}>
              <Inbox className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-bold text-gray-900 text-lg sm:text-xl lg:text-2xl">Submissions</h1>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="spinner" />
          <span className="ml-2">Loading submissions...</span>
        </div>
      </div>
    );
  }

  const renderSubmissionsTable = (submissions: JobApplication[]) => (
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
              <TableHead className="font-semibold text-right min-w-[120px]">Actions</TableHead>
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
                  <TableCell className="text-right min-w-[120px]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApplication(application)}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#005586' }}>
            <Inbox className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-bold text-gray-900 text-lg sm:text-xl lg:text-2xl">Submissions</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm animate-slide-up-delayed">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {getUniquePositions().map(position => (
                <SelectItem key={position} value={position}>{position}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="whitespace-nowrap text-sm px-3"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Status Tabs with Counts */}
      <Tabs 
        value={statusFilter} 
        onValueChange={setStatusFilter}
        className="w-full animate-slide-up-delayed-2"
      >
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="all" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
            <span>All</span>
            <Badge variant="secondary" className="text-xs">
              {getStatusCount('all')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="waiting" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
            <span>Pending</span>
            <Badge variant="secondary" className="text-xs">
              {getStatusCount('waiting')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
            <span>Approved</span>
            <Badge variant="secondary" className="text-xs">
              {getStatusCount('approved')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
            <span>Rejected</span>
            <Badge variant="secondary" className="text-xs">
              {getStatusCount('rejected')}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderSubmissionsTable(getSubmissionsByStatus('all'))}
        </TabsContent>

        <TabsContent value="waiting" className="mt-6">
          {renderSubmissionsTable(getSubmissionsByStatus('waiting'))}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {renderSubmissionsTable(getSubmissionsByStatus('approved'))}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {renderSubmissionsTable(getSubmissionsByStatus('rejected'))}
        </TabsContent>
      </Tabs>

      {/* Application Details Modal */}
      <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto m-2">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Application Details</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Candidate Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Candidate Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="ml-2">{selectedApplication.firstName} {selectedApplication.lastName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="ml-2 break-all">{selectedApplication.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <span className="ml-2">{selectedApplication.phone}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <span className="ml-2">{selectedApplication.cityState}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Earliest Start Date:</span>
                      <span className="ml-2">{selectedApplication.earliestStartDate ? formatDate(selectedApplication.earliestStartDate) : 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Application Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Applied Position:</span>
                      <span className="ml-2">{selectedApplication.appliedPosition}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Applied Date:</span>
                      <span className="ml-2">{formatDate(selectedApplication.createdAt)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Current Status:</span>
                      <Badge 
                        variant={getStatusBadgeVariant(selectedApplication.status)}
                        className="ml-2 text-xs"
                      >
                        {getStatusText(selectedApplication.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Cover Letter</h3>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div className="text-gray-700 whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{ __html: selectedApplication.coverLetter }} />
                </div>
              </div>

              {/* Attachments */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Attachments</h3>
                <div className="space-y-2">
                  {selectedApplication.resumeUrl && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="font-medium text-sm">Resume</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openFileViewer(selectedApplication.resumeUrl!, 'Resume')}
                          className="text-xs px-2 py-1"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">View Online</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedApplication.resumeUrl, '_blank')}
                          className="text-xs px-2 py-1"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.additionalDocsUrls.map((docUrl, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="font-medium text-sm">Additional Document {index + 1}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openFileViewer(docUrl, `Additional Document ${index + 1}`)}
                          className="text-xs px-2 py-1"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">View Online</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(docUrl, '_blank')}
                          className="text-xs px-2 py-1"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'approved')}
                  disabled={selectedApplication.status === 'approved'}
                  className="bg-green-600 hover:bg-green-700 text-sm px-4 py-2"
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                  disabled={selectedApplication.status === 'rejected'}
                  className="text-sm px-4 py-2"
                >
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'waiting')}
                  disabled={selectedApplication.status === 'waiting'}
                  className="text-sm px-4 py-2"
                >
                  Mark as Pending
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* File Viewer Modal */}
      <Dialog open={!!viewingFile} onOpenChange={(open) => !open && setViewingFile(null)}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] p-0 m-2">
          <DialogHeader className="p-4 sm:p-6 pb-0">
            <DialogTitle className="text-base sm:text-lg">{viewingFile?.name}</DialogTitle>
          </DialogHeader>
          {viewingFile && (
            <div className="p-4 sm:p-6 pt-4">
              <div className="w-full h-[60vh] sm:h-[70vh] border rounded-lg overflow-hidden">
                <iframe
                  src={viewingFile.url}
                  className="w-full h-full"
                  title={viewingFile.name}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Submissions;
