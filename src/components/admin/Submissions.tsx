import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Eye, 
  Download,
  FileText,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
  StickyNote
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { JobApplication } from '@/types';
import { toast } from '@/hooks/use-toast';

const Submissions: React.FC = () => {
  const { applications, setApplications, jobs, positions, locations } = useAppContext();
  const [activeTab, setActiveTab] = useState('waiting');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJob, setFilterJob] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [viewingApplication, setViewingApplication] = useState<JobApplication | null>(null);
  const [notes, setNotes] = useState('');

  // Filter applications by status
  const getFilteredApplications = (status: 'waiting' | 'approved' | 'declined') => {
    return applications.filter(app => {
      const matchesStatus = app.status === status;
      const matchesSearch = app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.appliedPosition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesJob = filterJob === 'all' || app.appliedPosition === filterJob;
      const matchesLocation = filterLocation === 'all' || app.cityState.includes(filterLocation);
      
      return matchesStatus && matchesSearch && matchesJob && matchesLocation;
    });
  };

  const updateApplicationStatus = (applicationId: string, newStatus: 'waiting' | 'approved' | 'declined') => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
        : app
    ));

    const application = applications.find(app => app.id === applicationId);
    const statusText = newStatus === 'waiting' ? 'moved to waiting' : newStatus;
    
    toast({
      title: "Application Status Updated",
      description: `${application?.firstName} ${application?.lastName}'s application has been ${statusText}`,
    });

    if (newStatus === 'approved') {
      toast({
        title: "Calendly Link Sent",
        description: "A congratulatory email with scheduling link has been sent to the candidate",
      });
    }
  };

  const openApplicationModal = (application: JobApplication) => {
    setViewingApplication(application);
    setNotes(application.notes || '');
  };

  const saveNotes = () => {
    if (!viewingApplication) return;

    setApplications(prev => prev.map(app => 
      app.id === viewingApplication.id 
        ? { ...app, notes, updatedAt: new Date().toISOString() }
        : app
    ));

    toast({
      title: "Notes Saved",
      description: "Application notes have been updated",
    });
  };

  const downloadAllDocuments = (application: JobApplication) => {
    // Simulate download
    toast({
      title: "Download Started",
      description: `Downloading all documents for ${application.firstName} ${application.lastName}`,
    });
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'declined':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const waitingApplications = getFilteredApplications('waiting');
  const approvedApplications = getFilteredApplications('approved');
  const declinedApplications = getFilteredApplications('declined');

  const renderApplicationCard = (application: JobApplication) => {
    const job = jobs.find(j => j.id === application.jobId);
    
    return (
      <Card key={application.id} className="p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {application.firstName} {application.lastName}
                </h3>
                <p className="text-primary font-medium">{application.appliedPosition}</p>
                <p className="text-sm text-gray-600">{job?.title}</p>
              </div>
              <Badge 
                variant={getStatusBadgeVariant(application.status)}
                className="flex items-center space-x-1"
              >
                {getStatusIcon(application.status)}
                <span className="capitalize">{application.status}</span>
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{application.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>{application.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{application.cityState}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Start: {new Date(application.earliestStartDate).toLocaleDateString()}</span>
                </div>
                {application.notes && (
                  <div className="flex items-center space-x-1 text-primary">
                    <StickyNote className="w-4 h-4" />
                    <span>Has notes</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openApplicationModal(application)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadAllDocuments(application)}
              className="text-green-600 hover:text-green-700"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 animate-fade-in-up">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Submissions</h1>
          <p className="text-gray-600">Review and manage job applications</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, email, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={filterJob} onValueChange={setFilterJob}>
            <SelectTrigger>
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map((position) => (
                <SelectItem key={position.id} value={position.name}>
                  {position.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.name}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Submissions Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="waiting" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Waiting ({waitingApplications.length})</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Approved ({approvedApplications.length})</span>
          </TabsTrigger>
          <TabsTrigger value="declined" className="flex items-center space-x-2">
            <XCircle className="w-4 h-4" />
            <span>Declined ({declinedApplications.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="waiting" className="space-y-4 mt-6">
          {waitingApplications.length === 0 ? (
            <Card className="p-8 text-center">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No waiting applications</h3>
              <p className="text-gray-600">All applications have been reviewed</p>
            </Card>
          ) : (
            waitingApplications.map(renderApplicationCard)
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {approvedApplications.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No approved applications</h3>
              <p className="text-gray-600">No applications have been approved yet</p>
            </Card>
          ) : (
            approvedApplications.map(renderApplicationCard)
          )}
        </TabsContent>

        <TabsContent value="declined" className="space-y-4 mt-6">
          {declinedApplications.length === 0 ? (
            <Card className="p-8 text-center">
              <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No declined applications</h3>
              <p className="text-gray-600">No applications have been declined</p>
            </Card>
          ) : (
            declinedApplications.map(renderApplicationCard)
          )}
        </TabsContent>
      </Tabs>

      {/* Application Detail Modal */}
      <Dialog open={!!viewingApplication} onOpenChange={() => setViewingApplication(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Application Details: {viewingApplication?.firstName} {viewingApplication?.lastName}
            </DialogTitle>
          </DialogHeader>

          {viewingApplication && (
            <div className="space-y-6 mt-6">
              {/* Personal Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-600">Full Name</Label>
                    <p className="font-medium">{viewingApplication.firstName} {viewingApplication.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Email</Label>
                    <p className="font-medium">{viewingApplication.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Phone</Label>
                    <p className="font-medium">{viewingApplication.phone}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Location</Label>
                    <p className="font-medium">{viewingApplication.cityState}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Applied Position</Label>
                    <p className="font-medium">{viewingApplication.appliedPosition}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Earliest Start Date</Label>
                    <p className="font-medium">{new Date(viewingApplication.earliestStartDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>

              {/* Cover Letter */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {viewingApplication.coverLetter}
                  </p>
                </div>
              </Card>

              {/* Documents */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    Documents
                  </span>
                  <Button
                    onClick={() => downloadAllDocuments(viewingApplication)}
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:text-green-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </h3>
                <div className="space-y-3">
                  {viewingApplication.resumeUrl && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Resume</span>
                        <span className="text-sm text-gray-600">({viewingApplication.resumeUrl})</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {viewingApplication.additionalDocsUrls.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Additional Document {index + 1}</span>
                        <span className="text-sm text-gray-600">({doc})</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Notes */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <StickyNote className="w-5 h-5 mr-2 text-primary" />
                  Private Notes
                </h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add private notes about this application..."
                  className="min-h-[100px] mb-4"
                />
                <Button
                  onClick={saveNotes}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Save Notes
                </Button>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Current Status:</span>
                  <Badge variant={getStatusBadgeVariant(viewingApplication.status)}>
                    {viewingApplication.status.charAt(0).toUpperCase() + viewingApplication.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex space-x-3">
                  {viewingApplication.status !== 'declined' && (
                    <Button
                      onClick={() => updateApplicationStatus(viewingApplication.id, 'declined')}
                      variant="outline"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  )}
                  {viewingApplication.status !== 'waiting' && (
                    <Button
                      onClick={() => updateApplicationStatus(viewingApplication.id, 'waiting')}
                      variant="outline"
                      className="text-yellow-600 hover:text-yellow-700 border-yellow-200 hover:border-yellow-300"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Move to Waiting
                    </Button>
                  )}
                  {viewingApplication.status !== 'approved' && (
                    <Button
                      onClick={() => updateApplicationStatus(viewingApplication.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Send Calendly
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Submissions;
