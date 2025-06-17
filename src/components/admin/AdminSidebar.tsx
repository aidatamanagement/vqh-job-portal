
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Briefcase, 
  FileText, 
  Settings as SettingsIcon,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  MailCheck,
  MailX
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

type AdminView = 'post-job' | 'manage-jobs' | 'submissions' | 'settings' | 'email-templates' | 'email-logs' | 'email-settings';

interface AdminSidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, onViewChange }) => {
  const { jobs, applications } = useAppContext();

  const activeJobs = jobs.filter(job => job.isActive).length;
  const totalJobs = jobs.length;
  const waitingApplications = applications.filter(app => app.status === 'waiting').length;
  const approvedApplications = applications.filter(app => app.status === 'approved').length;
  const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

  const menuItems = [
    {
      id: 'post-job' as AdminView,
      label: 'Post Job',
      icon: Plus,
    },
    {
      id: 'manage-jobs' as AdminView,
      label: 'Manage Jobs',
      icon: Briefcase,
      badge: `${activeJobs}/${totalJobs}`,
    },
    {
      id: 'submissions' as AdminView,
      label: 'Submissions',
      icon: FileText,
      badge: waitingApplications > 0 ? waitingApplications.toString() : undefined,
    },
    // Email Management Section
    {
      id: 'email-templates' as AdminView,
      label: 'Email Templates',
      icon: Mail,
    },
    {
      id: 'email-logs' as AdminView,
      label: 'Email Logs',
      icon: MailCheck,
    },
    {
      id: 'email-settings' as AdminView,
      label: 'Email Settings',
      icon: MailX,
    },
    {
      id: 'settings' as AdminView,
      label: 'Settings',
      icon: SettingsIcon,
    },
  ];

  return (
    <div className="w-80 lg:w-80 w-72 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-4 lg:p-6">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Admin Dashboard</h2>
        
        {/* Quick Stats */}
        <Card className="p-3 lg:p-4 mb-4 lg:mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2 lg:mb-3 flex items-center">
            <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-primary" />
            Quick Stats
          </h3>
          <div className="space-y-2 lg:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs lg:text-sm text-gray-600">Active Jobs</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                {activeJobs}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs lg:text-sm text-gray-600">Total Applications</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                {applications.length}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs lg:text-sm text-gray-600 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Waiting Review
              </span>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                {waitingApplications}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs lg:text-sm text-gray-600 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Approved
              </span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                {approvedApplications}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Navigation Menu */}
        <nav className="space-y-1 lg:space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isEmailSection = ['email-templates', 'email-logs', 'email-settings'].includes(item.id);
            
            return (
              <div key={item.id}>
                {/* Email section divider */}
                {index === 3 && (
                  <div className="py-2">
                    <div className="flex items-center space-x-2 px-2 py-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email Management
                      </span>
                    </div>
                  </div>
                )}
                
                <Button
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full justify-start p-3 lg:p-4 h-auto ${
                    isActive 
                      ? 'bg-primary text-white hover:bg-primary/90' 
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${isEmailSection ? 'ml-4' : ''}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      <div className={`font-medium text-sm lg:text-base ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                    </div>
                    {item.badge && (
                      <Badge 
                        variant={isActive ? "secondary" : "outline"}
                        className={`text-xs ${
                          isActive 
                            ? 'bg-white/20 text-white border-white/30' 
                            : 'bg-primary/10 text-primary border-primary/20'
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Button>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
