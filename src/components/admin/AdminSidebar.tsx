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
  Home,
  Layout,
  Calendar
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { getRolePermissions } from '@/utils/rolePermissions';

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
  | 'content-manager';

interface AdminSidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  type: 'single';
  view: AdminView;
  visible: boolean;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  type: 'group';
  visible: boolean;
  children: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    view: AdminView;
    badge?: string;
    visible: boolean;
  }>;
}

type MenuConfig = MenuItem | MenuGroup;

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, onViewChange }) => {
  const { jobs, applications, userProfile } = useAppContext();
  const [expandedMenu, setExpandedMenu] = useState<string | null>('job-portal');

  const activeJobs = jobs.filter(job => job.isActive).length;
  const totalJobs = jobs.length;
  const pendingApplications = applications.filter(app => app.status === 'application_submitted').length;

  // Get user permissions
  const userRole = userProfile?.role || 'recruiter';
  const permissions = getRolePermissions(userRole);

  const toggleMenu = (menuId: string) => {
    setExpandedMenu(prev => prev === menuId ? null : menuId);
  };

  const menuItems: MenuConfig[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      type: 'single' as const,
      view: 'dashboard' as AdminView,
      visible: permissions.canViewDashboard,
    },
    {
      id: 'job-portal',
      label: 'Job Portal',
      icon: Briefcase,
      type: 'group' as const,
      visible: permissions.canManageJobs || permissions.canViewApplications,
      children: [
        {
          id: 'post-job',
          label: 'Post Job',
          icon: Plus,
          view: 'post-job' as AdminView,
          visible: permissions.canManageJobs,
        },
        {
          id: 'manage-jobs',
          label: 'Manage Jobs',
          icon: Briefcase,
          view: 'manage-jobs' as AdminView,
          badge: `${activeJobs}/${totalJobs}`,
          visible: permissions.canManageJobs,
        },
        {
          id: 'submissions',
          label: 'Submissions',
          icon: FileText,
          view: 'submissions' as AdminView,
          badge: pendingApplications > 0 ? pendingApplications.toString() : undefined,
          visible: permissions.canViewApplications,
        },
        {
          id: 'interviews',
          label: 'Interviews',
          icon: Calendar,
          view: 'interviews' as AdminView,
          visible: permissions.canViewApplications,
        },
      ].filter(child => child.visible),
    },
    {
      id: 'crm',
      label: 'CRM',
      icon: Users,
      type: 'group' as const,
      visible: permissions.canViewSalespeople || permissions.canViewVisitLogs,
      children: [
        {
          id: 'salespeople',
          label: 'Salespeople',
          icon: Users,
          view: 'salespeople' as AdminView,
          visible: permissions.canViewSalespeople,
        },
        {
          id: 'visit-logs',
          label: 'Visit Logs',
          icon: MapPin,
          view: 'visit-logs' as AdminView,
          visible: permissions.canViewVisitLogs,
        },
        {
          id: 'crm-reports',
          label: 'Reports',
          icon: ClipboardList,
          view: 'crm-reports' as AdminView,
          visible: permissions.canViewVisitLogs, // Reports require visit logs access
        },
      ].filter(child => child.visible),
    },
    {
      id: 'training',
      label: 'Training',
      icon: BookOpen,
      type: 'group' as const,
      visible: permissions.canViewTrainingVideos,
      children: [
        {
          id: 'training-videos',
          label: 'Videos',
          icon: Video,
          view: 'training-videos' as AdminView,
          visible: permissions.canViewTrainingVideos,
        },
      ].filter(child => child.visible),
    },
    {
      id: 'content-manager',
      label: 'Content Manager',
      icon: Layout,
      type: 'single' as const,
      view: 'content-manager' as AdminView,
      visible: permissions.canManageContent,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      type: 'group' as const,
      visible: permissions.canManageEmailSettings || permissions.canManageUsers,
      children: [
        {
          id: 'email-management',
          label: 'Email & Config',
          icon: Mail,
          view: 'email-management' as AdminView,
          visible: permissions.canManageEmailSettings,
        },
        {
          id: 'user-roles',
          label: 'Users & Roles',
          icon: Users,
          view: 'settings' as AdminView,
          visible: permissions.canManageUsers,
        },
      ].filter(child => child.visible),
    },
  ].filter(item => item.visible && (item.type === 'single' || item.children.length > 0));

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
