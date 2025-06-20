
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Briefcase, 
  FileText, 
  Settings as SettingsIcon,
  Clock,
  CheckCircle,
  Mail,
  BookOpen,
  Users,
  MapPin,
  ClipboardList,
  Video,
  ChevronDown,
  ChevronRight,
  Home
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

interface AdminSidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, onViewChange }) => {
  const { jobs, applications } = useAppContext();
  const [expandedMenu, setExpandedMenu] = useState<string | null>('job-portal');

  const activeJobs = jobs.filter(job => job.isActive).length;
  const totalJobs = jobs.length;
  const waitingApplications = applications.filter(app => app.status === 'waiting').length;

  const toggleMenu = (menuId: string) => {
    setExpandedMenu(prev => prev === menuId ? null : menuId);
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      type: 'single' as const,
      view: 'dashboard' as AdminView,
    },
    {
      id: 'job-portal',
      label: 'Job Portal',
      icon: Briefcase,
      type: 'group' as const,
      children: [
        {
          id: 'post-job',
          label: 'Post Job',
          icon: Plus,
          view: 'post-job' as AdminView,
        },
        {
          id: 'manage-jobs',
          label: 'Manage Jobs',
          icon: Briefcase,
          view: 'manage-jobs' as AdminView,
          badge: `${activeJobs}/${totalJobs}`,
        },
        {
          id: 'submissions',
          label: 'Submissions',
          icon: FileText,
          view: 'submissions' as AdminView,
          badge: waitingApplications > 0 ? waitingApplications.toString() : undefined,
        },
      ],
    },
    {
      id: 'crm',
      label: 'CRM',
      icon: Users,
      type: 'group' as const,
      children: [
        {
          id: 'salespeople',
          label: 'Salespeople',
          icon: Users,
          view: 'salespeople' as AdminView,
        },
        {
          id: 'visit-logs',
          label: 'Visit Logs',
          icon: MapPin,
          view: 'visit-logs' as AdminView,
        },
        {
          id: 'crm-reports',
          label: 'Reports',
          icon: ClipboardList,
          view: 'crm-reports' as AdminView,
        },
      ],
    },
    {
      id: 'training',
      label: 'Training',
      icon: BookOpen,
      type: 'group' as const,
      children: [
        {
          id: 'training-videos',
          label: 'Videos',
          icon: Video,
          view: 'training-videos' as AdminView,
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      type: 'group' as const,
      children: [
        {
          id: 'email-management',
          label: 'Email & Config',
          icon: Mail,
          view: 'email-management' as AdminView,
        },
        {
          id: 'user-roles',
          label: 'Users & Roles',
          icon: Users,
          view: 'settings' as AdminView,
        },
      ],
    },
  ];

  return (
    <div className="w-80 lg:w-80 w-72 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-4 lg:p-6">
        {/* Navigation Menu */}
        <nav className="space-y-1 lg:space-y-2">
          {menuItems.map((item) => {
            if (item.type === 'single') {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => onViewChange(item.view)}
                  className={`w-full justify-start p-3 lg:p-4 h-auto ${
                    isActive 
                      ? 'bg-primary text-white hover:bg-primary/90' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <div className={`font-medium text-sm lg:text-base ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {item.label}
                    </div>
                  </div>
                </Button>
              );
            }

            // Group menu
            const Icon = item.icon;
            const isExpanded = expandedMenu === item.id;
            
            return (
              <div key={item.id} className="space-y-1">
                <Button
                  variant="ghost"
                  onClick={() => toggleMenu(item.id)}
                  className="w-full justify-between p-3 lg:p-4 h-auto text-gray-700 hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
                    <div className="font-medium text-sm lg:text-base text-gray-900">
                      {item.label}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </Button>
                
                {isExpanded && (
                  <div className="ml-4 space-y-1">
                    {item.children?.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = currentView === child.view;
                      
                      return (
                        <Button
                          key={child.id}
                          variant={isChildActive ? "default" : "ghost"}
                          onClick={() => onViewChange(child.view)}
                          className={`w-full justify-start p-2 lg:p-3 h-auto ${
                            isChildActive 
                              ? 'bg-primary text-white hover:bg-primary/90' 
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <ChildIcon className={`w-4 h-4 ${isChildActive ? 'text-white' : 'text-gray-400'}`} />
                              <div className={`font-medium text-sm ${isChildActive ? 'text-white' : 'text-gray-700'}`}>
                                {child.label}
                              </div>
                            </div>
                            {child.badge && (
                              <Badge 
                                variant={isChildActive ? "secondary" : "outline"}
                                className={`text-xs ${
                                  isChildActive 
                                    ? 'bg-white/20 text-white border-white/30' 
                                    : 'bg-primary/10 text-primary border-primary/20'
                                }`}
                              >
                                {child.badge}
                              </Badge>
                            )}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
