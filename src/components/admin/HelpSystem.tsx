
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCircle, Search, BookOpen, Video, Play, ExternalLink } from 'lucide-react';
import UserGuide from './UserGuide';
import { useInteractiveTour, adminTourSteps, jobPostingTourSteps, submissionsTourSteps } from '@/hooks/useInteractiveTour';

const HelpSystem: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const adminTour = useInteractiveTour(adminTourSteps);
  const jobPostingTour = useInteractiveTour(jobPostingTourSteps);
  const submissionsTour = useInteractiveTour(submissionsTourSteps);

  const helpTopics = [
    {
      id: 'posting-jobs',
      title: 'How to post a new job',
      category: 'Getting Started',
      description: 'Step-by-step guide to creating your first job posting',
      content: 'Navigate to Post Job → Fill in job details → Set requirements → Publish',
      tags: ['jobs', 'posting', 'create']
    },
    {
      id: 'managing-applications',
      title: 'Managing job applications',
      category: 'Applications',
      description: 'Review, approve, and reject candidate applications',
      content: 'Go to Submissions → Filter by status → Review details → Update status',
      tags: ['applications', 'candidates', 'review']
    },
    {
      id: 'email-notifications',
      title: 'Email notification system',
      category: 'Communications',
      description: 'How automatic emails work for candidates and supervisors',
      content: 'Emails are sent automatically when application status changes',
      tags: ['email', 'notifications', 'brevo']
    },
    {
      id: 'onboarding-process',
      title: 'Candidate onboarding',
      category: 'Onboarding',
      description: 'Setting up new hire onboarding workflow',
      content: 'Approve candidate → Assign supervisor → Set start date → Track progress',
      tags: ['onboarding', 'hiring', 'workflow']
    }
  ];

  const videoTutorials = [
    {
      id: 'dashboard-overview',
      title: 'Admin Dashboard Overview',
      duration: '3:45',
      thumbnail: '/placeholder.svg',
      url: '#'
    },
    {
      id: 'posting-first-job',
      title: 'Posting Your First Job',
      duration: '5:20',
      thumbnail: '/placeholder.svg',
      url: '#'
    },
    {
      id: 'managing-candidates',
      title: 'Managing Candidates',
      duration: '7:15',
      thumbnail: '/placeholder.svg',
      url: '#'
    }
  ];

  const filteredTopics = helpTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const startTour = (tourType: 'admin' | 'job-posting' | 'submissions') => {
    setIsOpen(false);
    setTimeout(() => {
      switch (tourType) {
        case 'admin':
          adminTour.startTour();
          break;
        case 'job-posting':
          jobPostingTour.startTour();
          break;
        case 'submissions':
          submissionsTour.startTour();
          break;
      }
    }, 300);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Help</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span>Help & Support</span>
            </DialogTitle>
            <DialogDescription>
              Find guides, tutorials, and get help with the admin dashboard
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="guides" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="guides">Guides</TabsTrigger>
              <TabsTrigger value="tours">Interactive Tours</TabsTrigger>
              <TabsTrigger value="search">Search Help</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
            </TabsList>

            <TabsContent value="guides" className="mt-6">
              <UserGuide />
            </TabsContent>

            <TabsContent value="tours" className="mt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Tours</h3>
                  <p className="text-gray-600 mb-6">Take a guided tour of the admin dashboard features</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Dashboard Overview</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Get familiar with the main dashboard navigation and features
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => startTour('admin')}
                    >
                      Start Tour
                    </Button>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Job Posting</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Learn how to create and publish job postings step-by-step
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => startTour('job-posting')}
                    >
                      Start Tour
                    </Button>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Managing Applications</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Review applications and manage the hiring workflow
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => startTour('submissions')}
                    >
                      Start Tour
                    </Button>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="search" className="mt-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search help topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-3">
                  {filteredTopics.map((topic) => (
                    <Card key={topic.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{topic.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {topic.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{topic.description}</p>
                          <p className="text-sm text-gray-700">{topic.content}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {topic.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {filteredTopics.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No help topics found for "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="videos" className="mt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <Video className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Tutorials</h3>
                  <p className="text-gray-600 mb-6">Watch step-by-step video guides</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videoTutorials.map((video) => (
                    <Card key={video.id} className="overflow-hidden">
                      <div className="relative aspect-video bg-gray-100">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                          <Button size="sm" variant="secondary">
                            <Play className="w-4 h-4 mr-2" />
                            Play
                          </Button>
                        </div>
                        <Badge className="absolute top-2 right-2 bg-black bg-opacity-60">
                          {video.duration}
                        </Badge>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-gray-900 text-sm">{video.title}</h4>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="p-4 text-center">
                  <ExternalLink className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 mb-1">More Tutorials</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Visit our YouTube channel for more comprehensive tutorials
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View All Videos
                  </Button>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Tour Components */}
      <adminTour.TourComponent />
      <jobPostingTour.TourComponent />
      <submissionsTour.TourComponent />
    </>
  );
};

export default HelpSystem;
