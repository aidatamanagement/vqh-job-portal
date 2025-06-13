
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Eye, X, FileText, Download, ExternalLink, Inbox } from 'lucide-react';
import { JobApplication } from '@/types';

// Mock data for submissions
const mockSubmissions: JobApplication[] = [
  {
    id: '1',
    jobId: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    appliedPosition: 'Registered Nurse',
    earliestStartDate: '2024-07-01',
    cityState: 'New York, NY',
    coverLetter: 'I am passionate about providing compassionate care...',
    resumeUrl: 'https://example.com/resume.pdf',
    additionalDocsUrls: ['https://example.com/license.pdf', 'https://example.com/references.pdf'],
    status: 'waiting',
    notes: '',
    createdAt: '2024-06-15T10:30:00Z',
    updatedAt: '2024-06-15T10:30:00Z',
  },
  {
    id: '2',
    jobId: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 987-6543',
    appliedPosition: 'Social Worker',
    earliestStartDate: '2024-08-01',
    cityState: 'Los Angeles, CA',
    coverLetter: 'With my background in social work and dedication to helping others...',
    resumeUrl: 'https://example.com/resume2.pdf',
    additionalDocsUrls: ['https://example.com/certification.pdf'],
    status: 'approved',
    notes: 'Great candidate with excellent references',
    createdAt: '2024-06-10T14:20:00Z',
    updatedAt: '2024-06-12T09:15:00Z',
  },
  {
    id: '3',
    jobId: '1',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@email.com',
    phone: '(555) 456-7890',
    appliedPosition: 'Registered Nurse',
    earliestStartDate: '2024-09-01',
    cityState: 'Chicago, IL',
    coverLetter: 'I have been working in healthcare for over 10 years...',
    resumeUrl: 'https://example.com/resume3.pdf',
    additionalDocsUrls: [],
    status: 'declined',
    notes: 'Not a good fit for the current position',
    createdAt: '2024-06-08T16:45:00Z',
    updatedAt: '2024-06-09T11:30:00Z',
  },
];

const Submissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<JobApplication[]>(mockSubmissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [viewingFile, setViewingFile] = useState<{ url: string; name: string } | null>(null);

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
      case 'declined':
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
      case 'declined':
        return 'Declined';
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

  const updateApplicationStatus = (id: string, newStatus: 'waiting' | 'approved' | 'declined') => {
    setSubmissions(prev => prev.map(app => 
      app.id === id 
        ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
        : app
    ));
    if (selectedApplication && selectedApplication.id === id) {
      setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const getUniquePositions = () => {
    const positions = [...new Set(submissions.map(s => s.appliedPosition))];
    return positions;
  };

  const openFileViewer = (url: string, name: string) => {
    setViewingFile({ url, name });
  };

  const renderSubmissionsTable = (submissions: JobApplication[]) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Candidate</TableHead>
            <TableHead className="font-semibold">Position</TableHead>
            <TableHead className="font-semibold">Applied Date</TableHead>
            <TableHead className="font-semibold">Location</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
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
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">
                      {application.firstName} {application.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{application.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-gray-900">{application.appliedPosition}</span>
                </TableCell>
                <TableCell>
                  <span className="text-gray-600">{formatDate(application.createdAt)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-gray-600">{application.cityState}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(application.status)}>
                    {getStatusText(application.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedApplication(application)}
                    className="inline-flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Inbox className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="font-bold text-gray-900" style={{ fontSize: '1.3rem' }}>Submissions</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
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
            <SelectTrigger className="w-full lg:w-48">
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
              className="whitespace-nowrap"
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
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All
            <Badge variant="secondary" className="text-xs">
              {getStatusCount('all')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="waiting" className="flex items-center gap-2">
            Pending
            <Badge variant="secondary" className="text-xs">
              {getStatusCount('waiting')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            Approved
            <Badge variant="secondary" className="text-xs">
              {getStatusCount('approved')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="declined" className="flex items-center gap-2">
            Declined
            <Badge variant="secondary" className="text-xs">
              {getStatusCount('declined')}
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

        <TabsContent value="declined" className="mt-6">
          {renderSubmissionsTable(getSubmissionsByStatus('declined'))}
        </TabsContent>
      </Tabs>

      {/* Application Details Modal */}
      <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Candidate Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Candidate Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="ml-2">{selectedApplication.firstName} {selectedApplication.lastName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="ml-2">{selectedApplication.email}</span>
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
                      <span className="ml-2">{formatDate(selectedApplication.earliestStartDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Application Details</h3>
                  <div className="space-y-2">
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
                        className="ml-2"
                      >
                        {getStatusText(selectedApplication.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cover Letter</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Attachments</h3>
                <div className="space-y-2">
                  {selectedApplication.resumeUrl && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Resume</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openFileViewer(selectedApplication.resumeUrl!, 'Resume')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Online
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedApplication.resumeUrl, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.additionalDocsUrls.map((docUrl, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Additional Document {index + 1}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openFileViewer(docUrl, `Additional Document ${index + 1}`)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Online
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(docUrl, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedApplication.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-gray-700">{selectedApplication.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'approved')}
                  disabled={selectedApplication.status === 'approved'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'declined')}
                  disabled={selectedApplication.status === 'declined'}
                >
                  Decline
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'waiting')}
                  disabled={selectedApplication.status === 'waiting'}
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
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{viewingFile?.name}</DialogTitle>
          </DialogHeader>
          {viewingFile && (
            <div className="p-6 pt-4">
              <div className="w-full h-[70vh] border rounded-lg overflow-hidden">
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
