
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, Download, Video, ChevronRight, CheckCircle, Users, FileText, Settings, Briefcase } from 'lucide-react';

const UserGuide: React.FC = () => {
  const [activeGuide, setActiveGuide] = useState<'overview' | 'getting-started' | 'managing-applications' | 'onboarding'>('overview');

  const guides = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Admin setup and first job posting',
      icon: Settings,
      duration: '5 min read',
      steps: [
        'Log into admin dashboard',
        'Navigate to Post Job section',
        'Fill out job details and requirements',
        'Set application deadline (optional)',
        'Mark as urgent if needed',
        'Publish the job posting'
      ]
    },
    {
      id: 'managing-applications',
      title: 'Managing Applications',
      description: 'Review, approve, and reject workflow',
      icon: FileText,
      duration: '10 min read',
      steps: [
        'Access Submissions tab',
        'Filter by status and position',
        'Review candidate details',
        'Download resumes and documents',
        'Update application status',
        'Send status notifications'
      ]
    },
    {
      id: 'onboarding',
      title: 'Onboarding Process',
      description: 'From approval to candidate onboarding',
      icon: Users,
      duration: '15 min read',
      steps: [
        'Schedule interviews for approved candidates',
        'Assign supervisors to hired candidates',
        'Set onboarding start dates',
        'Track onboarding progress',
        'Complete final onboarding steps',
        'Generate completion reports'
      ]
    }
  ];

  const workflowSteps = [
    { step: 1, title: 'Job Posting', description: 'Create and publish job listings', status: 'completed' },
    { step: 2, title: 'Application Review', description: 'Evaluate candidate submissions', status: 'completed' },
    { step: 3, title: 'Interview Scheduling', description: 'Schedule and conduct interviews', status: 'in-progress' },
    { step: 4, title: 'Hiring Decision', description: 'Approve candidates and assign supervisors', status: 'pending' },
    { step: 5, title: 'Onboarding Setup', description: 'Configure onboarding timeline', status: 'pending' },
    { step: 6, title: 'Completion Tracking', description: 'Monitor progress and completion', status: 'pending' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin User Guide</h2>
        <p className="text-gray-600">Step-by-step guides to help you manage the recruitment process efficiently</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {guides.map((guide) => {
          const IconComponent = guide.icon;
          return (
            <Card 
              key={guide.id} 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20"
              onClick={() => setActiveGuide(guide.id as any)}
            >
              <div className="text-center">
                <IconComponent className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">{guide.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{guide.description}</p>
                <Badge variant="secondary" className="mb-3">{guide.duration}</Badge>
                <Button variant="outline" size="sm" className="w-full">
                  Start Guide <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Recruitment Workflow</h3>
        <div className="space-y-4">
          {workflowSteps.map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                item.status === 'completed' ? 'bg-green-100 text-green-700' :
                item.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-500'
              }`}>
                {item.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : item.step}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <Badge variant={
                item.status === 'completed' ? 'default' :
                item.status === 'in-progress' ? 'secondary' :
                'outline'
              }>
                {item.status.replace('-', ' ')}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Video className="w-6 h-6 text-primary" />
            <h3 className="font-semibold text-gray-900">Video Tutorials</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Watch step-by-step video guides for common tasks</p>
          <Button variant="outline" size="sm" className="w-full">
            <Play className="w-4 h-4 mr-2" />
            View Tutorials
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Download className="w-6 h-6 text-primary" />
            <h3 className="font-semibold text-gray-900">Download Guide</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Download PDF version for offline reference</p>
          <Button variant="outline" size="sm" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </Card>
      </div>
    </div>
  );

  const renderGuideContent = (guideId: string) => {
    const guide = guides.find(g => g.id === guideId);
    if (!guide) return null;

    const IconComponent = guide.icon;

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveGuide('overview')}
          >
            ← Back to Overview
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{guide.title}</h2>
              <p className="text-gray-600">{guide.description}</p>
            </div>
            <Badge variant="secondary">{guide.duration}</Badge>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-3">Step-by-Step Instructions:</h3>
            {guide.steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                  {index + 1}
                </div>
                <p className="text-gray-700 flex-1">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <Button size="sm">
                <Play className="w-4 h-4 mr-2" />
                Watch Video Guide
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download Section
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {activeGuide === 'overview' ? renderOverview() : renderGuideContent(activeGuide)}
    </div>
  );
};

export default UserGuide;
