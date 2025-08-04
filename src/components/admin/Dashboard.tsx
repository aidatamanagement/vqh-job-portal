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
import { getRolePermissions } from '@/utils/rolePermissions';
import { StatCard } from './components/StatCard'

type AdminView = 
  | 'dashboard'
  | 'post-job' 
  | 'manage-jobs' 
  | 'submissions'
  | 'interviews' 
  | 'settings' 
  | 'email-management' 
  | 'guide-training'
  | 'salespeople'
  | 'visit-logs'
  | 'crm-reports'
  | 'training-videos'
  | 'content-manager'
  | 'profile-settings';

interface DashboardProps {
  onNavigate: (view: AdminView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { jobs, applications, salespeople, visitLogs, trainingVideos, userProfile } = useAppContext();

  // Get user permissions
  const userRole = userProfile?.role || 'branch_manager';
  const permissions = getRolePermissions(userRole);

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

  const hiredApplications = applications.filter(app => app.status === 'hired').length;
  const pendingApplications = applications.filter(app => app.status === 'application_submitted').length;

  // Real CRM metrics from actual data
  const salesVisits = visitLogs.length;
  const salesGrowth = 12; // Could be calculated from historical data
  const trainingCompletion = trainingVideos.length > 0 ? 87 : 0; // Mock percentage
  const trainingGrowth = 5;
  const activeTrainees = 23; // Mock data - could be calculated from user activity
  const completedCourses = trainingVideos.length;
  const avgApplicationTime = '2.3 days'; // Mock data
  const conversionRate = visitLogs.length > 0 
    ? `${Math.round((visitLogs.filter(log => log.status === 'closed').length / visitLogs.length) * 100)}%`
    : '0%';

  // Filter summary cards based on user permissions
  const allSummaryCards = [
    {
      title: 'Total Jobs',
      value: jobs.length,
      subtitle: `${activeJobs} active`,
      icon: Briefcase,
      color: 'bg-blue-500',
      trend: '+12%',
      trendUp: true,
      onClick: () => onNavigate('manage-jobs'),
      permission: 'canManageJobs' as const
    },
    {
      title: 'Weekly Applications',
      value: weeklyApplications,
      subtitle: `${monthlyApplications} this month`,
      icon: Users,
      color: 'bg-green-500',
      trend: '+18%',
      trendUp: true,
      onClick: () => onNavigate('submissions'),
      permission: 'canViewApplications' as const
    },
    {
      title: 'CRM Activities',
      value: salesVisits,
      subtitle: 'Sales visits',
      icon: MapPin,
      color: 'bg-purple-500',
      trend: `+${salesGrowth}%`,
      trendUp: true,
      onClick: () => onNavigate('crm-reports'),
      permission: 'canViewVisitLogs' as const
    },
    {
      title: 'Training Progress',
      value: `${trainingCompletion}%`,
      subtitle: `${activeTrainees} active trainees`,
      icon: BookOpen,
      color: 'bg-orange-500',
      trend: `+${trainingGrowth}%`,
      trendUp: true,
      onClick: () => onNavigate('training-videos'),
      permission: 'canViewTrainingVideos' as const
    },
  ];

  const summaryCards = allSummaryCards.filter(card => permissions[card.permission]);

  // Filter detailed metrics based on permissions
  const detailedMetrics = [];
  
  if (permissions.canViewApplications) {
    detailedMetrics.push({
      title: 'Application Status',
      metrics: [
        { label: 'Pending Review', value: pendingApplications, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { label: 'Hired', value: hiredApplications, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Conversion Rate', value: conversionRate, color: 'text-blue-600', bg: 'bg-blue-50' },
      ]
    });
  }

  if (permissions.canViewSalespeople || permissions.canViewTrainingVideos) {
    detailedMetrics.push({
      title: 'Performance Metrics',
      metrics: [
        ...(permissions.canViewApplications 
          ? [{ label: 'Avg. Processing Time', value: avgApplicationTime, color: 'text-purple-600', bg: 'bg-purple-50' }]
          : []
        ),
        ...(permissions.canViewSalespeople 
          ? [{ label: 'Active Salespeople', value: salespeople.filter(p => p.status === 'active').length, color: 'text-indigo-600', bg: 'bg-indigo-50' }]
          : []
        ),
        ...(permissions.canViewTrainingVideos 
          ? [{ label: 'Training Videos', value: completedCourses, color: 'text-orange-600', bg: 'bg-orange-50' }]
          : []
        ),
      ]
    });
  }

  // Filter quick actions based on permissions
  const allQuickActions = [
    {
      label: 'Post New Job',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => onNavigate('post-job'),
      permission: 'canManageJobs' as const
    },
    {
      label: 'Review Applications',
      icon: Eye,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => onNavigate('submissions'),
      permission: 'canViewApplications' as const
    },
    {
      label: 'Add Salesperson',
      icon: UserPlus,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => onNavigate('salespeople'),
      permission: 'canManageSalespeople' as const
    },
    {
      label: 'Upload Training',
      icon: Video,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => onNavigate('training-videos'),
      permission: 'canManageTrainingVideos' as const
    },
  ];

  const quickActions = allQuickActions.filter(action => permissions[action.permission]);

  // Module cards configuration
  const moduleCards = [
    {
      title: 'HR',
      icon: Briefcase,
      color: 'bg-[#D8E5E3]',
      borderColor: 'outline-[#A1C6C0]',
      textColor: 'text-[#000000]',
      items: [
        { label: 'Post Job', onClick: () => onNavigate('post-job'), permission: 'canManageJobs' },
        { label: 'Manage Jobs', onClick: () => onNavigate('manage-jobs'), permission: 'canManageJobs' },
        { label: 'Submissions', onClick: () => onNavigate('submissions'), permission: 'canViewApplications' },
        { label: 'Interviews', onClick: () => onNavigate('interviews'), permission: 'canViewApplications' }
      ]
    },
    {
      title: 'CRM',
      icon: Users,
      color: 'bg-[#E8E3ED]',
      borderColor: 'outline-[#9F9FF8]',
      textColor: 'text-[#000000]',
      items: [
        { label: 'Salespeople', onClick: () => onNavigate('salespeople'), permission: 'canViewSalespeople' },
        { label: 'Reports', onClick: () => onNavigate('crm-reports'), permission: 'canViewVisitLogs' },
        { label: 'Visit Logs', onClick: () => onNavigate('visit-logs'), permission: 'canViewVisitLogs' }
      ]
    },
    {
      title: 'Employee Training',
      icon: BookOpen,
      color: 'bg-[#EED5D6]',
      borderColor: 'outline-[#DFA0A0]',
      textColor: 'text-[#000000]',
      items: [
        { label: 'Videos', onClick: () => onNavigate('training-videos'), permission: 'canViewTrainingVideos' },
        { label: 'Coming Soon', onClick: () => {}, permission: 'canViewTrainingVideos' },
        { label: 'Coming Soon', onClick: () => {}, permission: 'canViewTrainingVideos' }
      ]
    },
    {
      title: 'Marketing',
      icon: Building,
      color: 'bg-[#D9E7F0]',
      borderColor: 'outline-[#92BFFF]',
      textColor: 'text-[#000000]',
      items: [
        { label: 'Coming Soon', onClick: () => {}, permission: 'canManageContent' },
        { label: 'Coming Soon', onClick: () => {}, permission: 'canManageContent' },
        { label: 'Coming Soon', onClick: () => {}, permission: 'canManageContent' }
      ]
    }
  ];

  return (
    <div className="space-y-6" style={{ backgroundColor: '#FDF9F6', minHeight: '100vh', padding: '24px' }}>
      {/* Module Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {moduleCards
          .map((module, index) => {
            const Icon = module.icon;
            const filteredItems = module.items.filter(item => permissions[item.permission]);
            
            // Only render module card if user has access to at least one item
            if (filteredItems.length === 0) return null;
            
            return (
              <div key={index} className={`w-64 h-32 relative ${module.color || 'bg-zinc-200'} rounded-2xl outline outline-1 outline-offset-[-1px] ${module.borderColor || 'outline-slate-400'} hover:shadow-lg transition-all duration-200`}>
                {/* Title */}
                <div className="w-52 left-[48px] top-[18px] absolute rounded-lg inline-flex flex-col justify-center items-start">
                  <div className={`self-stretch h-5 justify-start ${module.textColor || 'text-black'} text-sm font-semibold font-['Open_Sans'] leading-tight`}>
                    {module.title}
                  </div>
                </div>
                
                {/* Icon */}
                <div className="left-[24px] top-[20px] absolute rounded-lg inline-flex justify-center items-center">
                  <div className="w-4 h-4 rounded-lg flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${module.textColor || 'text-gray-600'}`} />
                  </div>
                </div>
                
                {/* Menu Items */}
                <div className="absolute left-0 right-0 top-[52px] px-6">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    {filteredItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                          <path fillRule="evenodd" clipRule="evenodd" d="M5.65967 12.3536C5.44678 12.1583 5.44678 11.8417 5.65967 11.6464L9.25 8.35355C9.4629 8.15829 9.4629 7.84171 9.25 7.64645L5.65968 4.35355C5.44678 4.15829 5.44678 3.84171 5.65968 3.64645C5.87257 3.45118 6.21775 3.45118 6.43065 3.64645L10.021 6.93934C10.6597 7.52513 10.6597 8.47487 10.021 9.06066L6.43065 12.3536C6.21775 12.5488 5.87257 12.5488 5.65967 12.3536Z" fill="#333333"/>
                        </svg>
                        <div className={`text-xs font-normal font-['Open_Sans'] leading-none cursor-pointer hover:text-gray-900 ${module.textColor || 'text-zinc-800'}`} onClick={item.onClick}>
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
          .filter(Boolean) // Remove null values from cards that shouldn't be shown
        }
      </div>

      {/* Summary Cards */}
      {summaryCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryCards.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              count={card.value}
              subtext={card.subtitle}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={card.onClick}
            />
          ))}
        </div>
      )}

      {/* Detailed Metrics */}
      {detailedMetrics.length > 0 && (
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
      )}
    </div>
  );
};

export default Dashboard;
