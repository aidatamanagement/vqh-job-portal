import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Users,
  MapPin,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  Plus,
  UserPlus,
  Video,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  FileText,
  Building,
  Award,
  Target,
  Activity,
  BarChart3
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

type AdminView = 
  | 'dashboard'
  | 'post-job' 
  | 'manage-jobs' 
  | 'submissions' 
  | 'settings' 
  | 'email-management' 
  | 'guide-training'
  | 'salespeople'
  | 'visit-logs'
  | 'crm-reports'
  | 'training-videos';

interface DashboardProps {
  onNavigate: (view: AdminView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { jobs, applications } = useAppContext();

  const activeJobs = jobs.filter(job => job.isActive).length;
  const weeklyApplications = applications.filter(app => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(app.createdAt) > oneWeekAgo;
  }).length;

  const monthlyApplications = applications.filter(app => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return new Date(app.createdAt) > oneMonthAgo;
  }).length;

  const approvedApplications = applications.filter(app => app.status === 'approved').length;
  const pendingApplications = applications.filter(app => app.status === 'waiting').length;

  // Mock data for more advanced metrics
  const mockMetrics = {
    salesVisits: 47,
    salesGrowth: 12,
    trainingCompletion: 87,
    trainingGrowth: 5,
    activeTrainees: 23,
    completedCourses: 156,
    avgApplicationTime: '2.3 days',
    conversionRate: '24%'
  };

  const summaryCards = [
    {
      title: 'Total Jobs',
      value: jobs.length,
      subtitle: `${activeJobs} active`,
      icon: Briefcase,
      color: 'bg-blue-500',
      trend: '+12%',
      trendUp: true,
      onClick: () => onNavigate('manage-jobs')
    },
    {
      title: 'Weekly Applications',
      value: weeklyApplications,
      subtitle: `${monthlyApplications} this month`,
      icon: Users,
      color: 'bg-green-500',
      trend: '+18%',
      trendUp: true,
      onClick: () => onNavigate('submissions')
    },
    {
      title: 'CRM Activities',
      value: mockMetrics.salesVisits,
      subtitle: 'Sales visits',
      icon: MapPin,
      color: 'bg-purple-500',
      trend: `+${mockMetrics.salesGrowth}%`,
      trendUp: true,
      onClick: () => onNavigate('crm-reports')
    },
    {
      title: 'Training Progress',
      value: `${mockMetrics.trainingCompletion}%`,
      subtitle: `${mockMetrics.activeTrainees} active trainees`,
      icon: BookOpen,
      color: 'bg-orange-500',
      trend: `+${mockMetrics.trainingGrowth}%`,
      trendUp: true,
      onClick: () => onNavigate('training-videos')
    },
  ];

  const detailedMetrics = [
    {
      title: 'Application Status',
      metrics: [
        { label: 'Pending Review', value: pendingApplications, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { label: 'Approved', value: approvedApplications, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Conversion Rate', value: mockMetrics.conversionRate, color: 'text-blue-600', bg: 'bg-blue-50' },
      ]
    },
    {
      title: 'Performance Metrics',
      metrics: [
        { label: 'Avg. Processing Time', value: mockMetrics.avgApplicationTime, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Active Facilities', value: '12', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Training Courses', value: mockMetrics.completedCourses, color: 'text-orange-600', bg: 'bg-orange-50' },
      ]
    }
  ];

  const recentActivities = [
    {
      type: 'job',
      title: 'New job posted: Registered Nurse - ICU',
      subtitle: 'Memorial Hospital',
      time: '2 hours ago',
      icon: Briefcase,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      type: 'application',
      title: 'Application approved: John Smith',
      subtitle: 'Physical Therapist position',
      time: '4 hours ago',
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      type: 'visit',
      title: 'Sales visit completed',
      subtitle: 'Sarah Johnson at City Medical Center',
      time: '6 hours ago',
      icon: MapPin,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      type: 'training',
      title: 'Training module completed',
      subtitle: '5 staff members completed HIPAA training',
      time: '1 day ago',
      icon: Award,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      type: 'application',
      title: 'New application received',
      subtitle: 'Emily Davis - Respiratory Therapist',
      time: '1 day ago',
      icon: FileText,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
  ];

  const quickActions = [
    {
      label: 'Post New Job',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => onNavigate('post-job'),
      description: 'Create a new job posting'
    },
    {
      label: 'Review Applications',
      icon: Eye,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => onNavigate('submissions'),
      description: 'Check pending applications'
    },
    {
      label: 'Add Salesperson',
      icon: UserPlus,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => onNavigate('salespeople'),
      description: 'Manage sales team'
    },
    {
      label: 'Upload Training',
      icon: Video,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => onNavigate('training-videos'),
      description: 'Add training content'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          const TrendIcon = card.trendUp ? ArrowUpRight : ArrowDownRight;
          return (
            <Card 
              key={index} 
              className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={card.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                      <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        card.trendUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                      }`}>
                        <TrendIcon className="w-3 h-3 mr-1" />
                        {card.trend}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {detailedMetrics.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {section.metrics.map((metric, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${metric.bg} flex justify-between items-center`}>
                    <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                    <span className={`text-lg font-bold ${metric.color}`}>{metric.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('submissions')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-full ${activity.bg}`}>
                      <Icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{activity.subtitle}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    className={`w-full justify-start h-auto p-4 ${action.color} text-white`}
                    variant="default"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">{action.label}</div>
                        <div className="text-xs opacity-90">{action.description}</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Application Trends (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Interactive Line Chart</p>
                <p className="text-sm text-gray-500">Applications over time with trend analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-dashed border-green-200">
              <div className="text-center">
                <Building className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Pie Chart</p>
                <p className="text-sm text-gray-500">Job distribution by category</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
