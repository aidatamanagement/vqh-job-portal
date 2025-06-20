
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
  Video
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { jobs, applications } = useAppContext();

  const activeJobs = jobs.filter(job => job.isActive).length;
  const weeklyApplications = applications.filter(app => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(app.applicationDate) > oneWeekAgo;
  }).length;

  const summaryCards = [
    {
      title: 'Total Jobs',
      value: jobs.length,
      subtitle: `${activeJobs} active`,
      icon: Briefcase,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Weekly Applicants',
      value: weeklyApplications,
      subtitle: 'This week',
      icon: Users,
      color: 'bg-green-500',
      trend: '+8%',
    },
    {
      title: 'Sales Visits',
      value: 24,
      subtitle: 'This month',
      icon: MapPin,
      color: 'bg-purple-500',
      trend: '+15%',
    },
    {
      title: 'Training Completion',
      value: '87%',
      subtitle: 'Average rate',
      icon: BookOpen,
      color: 'bg-orange-500',
      trend: '+5%',
    },
  ];

  const recentActivities = [
    {
      type: 'job',
      title: 'New job posted: Registered Nurse',
      time: '2 hours ago',
      icon: Briefcase,
      color: 'text-blue-600',
    },
    {
      type: 'application',
      title: 'New application from John Smith',
      time: '4 hours ago',
      icon: Users,
      color: 'text-green-600',
    },
    {
      type: 'visit',
      title: 'Sales visit logged by Sarah Johnson',
      time: '6 hours ago',
      icon: MapPin,
      color: 'text-purple-600',
    },
    {
      type: 'training',
      title: 'Training module completed by 5 users',
      time: '1 day ago',
      icon: BookOpen,
      color: 'text-orange-600',
    },
  ];

  const quickActions = [
    {
      label: 'Post New Job',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => onNavigate('post-job'),
    },
    {
      label: 'Add Salesperson',
      icon: UserPlus,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => onNavigate('salespeople'),
    },
    {
      label: 'Log Sales Visit',
      icon: MapPin,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => onNavigate('visit-logs'),
    },
    {
      label: 'Upload Training',
      icon: Video,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => onNavigate('training-videos'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        {card.trend}
                      </Badge>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Icon className={`w-5 h-5 ${activity.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
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
              <TrendingUp className="w-5 h-5 mr-2" />
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
                    className={`w-full justify-start ${action.color} text-white`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Placeholder for now */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart placeholder - Line chart for application trends</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart placeholder - Pie chart for training completion</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
