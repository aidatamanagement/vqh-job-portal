
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Play, ArrowRight, CheckCircle, Users, FileText, Eye, UserCheck, Briefcase, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const GuideTraining: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const workflowSteps = [
    {
      step: 1,
      title: 'Post Job',
      description: 'Fill in job form & publish',
      icon: Briefcase,
      details: 'Navigate to "Post Job" tab, fill in all required fields including job title, description, requirements, and location. Click "Post Job" to make it live.'
    },
    {
      step: 2,
      title: 'Candidate Applies',
      description: 'Application appears under "Submissions"',
      icon: FileText,
      details: 'When candidates apply through the career page, their applications automatically appear in the "Submissions" section with a "waiting" status.'
    },
    {
      step: 3,
      title: 'Review Application',
      description: 'Click "View" to see full resume + cover',
      icon: Eye,
      details: 'Click the "View" button on any application to open a detailed modal showing the candidate\'s resume, cover letter, and personal information.'
    },
    {
      step: 4,
      title: 'Approve or Reject',
      description: 'Click "Approve" to start workflow',
      icon: UserCheck,
      details: 'After reviewing, click "Approve" to move the candidate forward or "Reject" to decline. Approved candidates enter the hiring workflow.'
    },
    {
      step: 5,
      title: 'Candidate Workflow Tab Appears',
      description: 'Steps: Interview → Offer → Hire → Onboard',
      icon: Users,
      details: 'Once approved, a new workflow tab appears showing the hiring pipeline: Interview, Offer, Hire, and Onboard stages.'
    },
    {
      step: 6,
      title: 'Mark Steps Completed',
      description: 'Manual triggers, auto-status update',
      icon: CheckCircle,
      details: 'Manually mark each workflow step as completed. The system automatically updates the candidate\'s status and sends relevant email notifications.'
    }
  ];

  const dashboardFeatures = [
    {
      title: 'Job Management',
      description: 'Create, edit, and manage job postings with real-time preview',
      features: ['Post new jobs', 'Edit existing positions', 'Activate/deactivate listings', 'View application counts']
    },
    {
      title: 'Application Review',
      description: 'Efficiently review and process candidate applications',
      features: ['View detailed applications', 'Download resumes', 'Approve or reject candidates', 'Track application status']
    },
    {
      title: 'Email Management',
      description: 'Automated email communications with customizable templates',
      features: ['Email templates', 'Automated notifications', 'Email logs', 'Custom sender settings']
    },
    {
      title: 'Settings & Configuration',
      description: 'Manage master data and system preferences',
      features: ['Job positions', 'Locations', 'Facilities', 'System settings']
    }
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Page Header */}
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="p-2 rounded-lg" style={{ backgroundColor: '#005586' }}>
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-bold text-gray-900 text-lg sm:text-xl lg:text-2xl">Guide & Training</h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Admin Dashboard Overview</TabsTrigger>
          <TabsTrigger value="workflow">Career Page Workflow</TabsTrigger>
        </TabsList>

        {/* Tab 1: Admin Dashboard Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Video Section */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Play className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-gray-900">Tutorial Video</h2>
            </div>
            <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center mb-4">
              <div className="text-center">
                <Play className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Admin Portal Overview Video</p>
                <p className="text-sm text-gray-500">Coming Soon</p>
              </div>
            </div>
            <p className="text-gray-600">
              This comprehensive video tutorial will walk you through all the features of the admin portal, 
              showing you how to manage jobs, review applications, and configure system settings.
            </p>
          </Card>

          {/* Dashboard Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardFeatures.map((feature, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Career Page Workflow */}
        <TabsContent value="workflow" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Step-by-Step Workflow</h2>
            <p className="text-gray-600 mb-6">
              Follow this workflow to manage candidates from job posting to onboarding
            </p>

            {/* Workflow Steps */}
            <div className="space-y-6">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === workflowSteps.length - 1;
                
                return (
                  <div key={step.step} className="relative">
                    <div className="flex items-start space-x-4">
                      {/* Step Number and Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {step.step}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <Card className="p-4 bg-gray-50 border-l-4 border-l-primary">
                          <div className="flex items-center space-x-3 mb-2">
                            <Icon className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              Step {step.step}
                            </Badge>
                          </div>
                          <p className="text-primary font-medium mb-2">{step.description}</p>
                          <p className="text-gray-700 text-sm">{step.details}</p>
                        </Card>
                      </div>
                    </div>

                    {/* Arrow to next step */}
                    {!isLast && (
                      <div className="absolute left-6 top-12 transform -translate-x-1/2">
                        <ArrowRight className="w-6 h-6 text-gray-400 rotate-90 mt-2" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <Card className="p-4 bg-green-50 border-green-200 mt-8">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Workflow Complete!</h3>
                  <p className="text-green-700 text-sm">
                    Once all steps are completed, the candidate is successfully onboarded and the process is complete.
                  </p>
                </div>
              </div>
            </Card>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GuideTraining;
