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
  Calendar,
  BarChart3
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
  | 'delayed-emails'
  | 'guide-training'
  | 'salespeople'
  | 'visit-logs'
  | 'crm-reports'
  | 'training-videos'
  | 'content-manager'
  | 'profile-settings'
  | 'web-analytics'
  | 'web-analytics-test';

interface AdminSidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
  isMobile?: boolean;
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

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, onViewChange, isMobile = false }) => {
  const { jobs, applications, userProfile } = useAppContext();
  const [expandedMenu, setExpandedMenu] = useState<string | null>('hr');
  const [isHovered, setIsHovered] = useState(false);

  const activeJobs = jobs.filter(job => job.isActive).length;
  const totalJobs = jobs.length;
  const pendingApplications = applications.filter(app => app.status === 'application_submitted').length;

  // Get user permissions
  const userRole = userProfile?.role || 'branch_manager';
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
      id: 'hr',
      label: 'HR',
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
          visible: permissions.canManageJobs,
        },
        {
          id: 'submissions',
          label: 'Submissions',
          icon: FileText,
          view: 'submissions' as AdminView,
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
      id: 'employee-training',
      label: 'Employee Training',
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
      id: 'marketing',
      label: 'Marketing',
      icon: Layout,
      type: 'group' as const,
      visible: permissions.canManageContent,
      children: [
        {
          id: 'content-manager',
          label: 'Content Manager',
          icon: Layout,
          view: 'content-manager' as AdminView,
          visible: permissions.canManageContent,
        },
        {
          id: 'web-analytics',
          label: 'Web Analytics',
          icon: BarChart3,
          view: 'web-analytics' as AdminView,
          visible: permissions.canManageContent,
        },
      ].filter(child => child.visible),
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
          id: 'delayed-emails',
          label: 'Delayed Emails',
          icon: Clock,
          view: 'delayed-emails' as AdminView,
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

  // For mobile, always show expanded version without hover effects
  if (isMobile) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 h-full">
        <div className="p-4 h-full overflow-y-auto">
          {/* Logo */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-center cursor-pointer group">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <img 
                  src="/images/LOGO.svg" 
                  alt="ViaQuest Hospice Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
          
          {/* Navigation Menu - Mobile (Always Expanded) */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              if (item.type === 'single') {
                const Icon = item.icon;
                const isActive = currentView === item.view;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => onViewChange(item.view)}
                    className={`w-full justify-start p-3 h-auto ${
                      isActive 
                        ? 'bg-primary text-white hover:bg-primary/90' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      <div className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                    </div>
                  </Button>
                );
              }

              // Group menu for mobile
              const Icon = item.icon;
              const isExpanded = expandedMenu === item.id;
              const hasActiveChild = item.children?.some(child => currentView === child.view);
              
              return (
                <div key={item.id} className="space-y-1">
                  <Button
                    variant="ghost"
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full justify-between p-3 h-auto text-gray-700 hover:bg-gray-100 ${
                      hasActiveChild ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 text-gray-500 ${hasActiveChild ? 'text-primary' : ''}`} />
                      <div className={`font-medium text-sm text-gray-900 ${hasActiveChild ? 'text-primary' : ''}`}>
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
                    <div className="ml-6 space-y-1">
                      {item.children?.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildActive = currentView === child.view;
                        
                        return (
                          <Button
                            key={child.id}
                            variant={isChildActive ? "default" : "ghost"}
                            onClick={() => onViewChange(child.view)}
                            className={`w-full justify-start p-2 h-10 ${
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
  }

  // Desktop version with hover-to-expand functionality
  return (
    <div 
      className={`fixed left-0 top-0 h-full border-r border-gray-200 z-40 transition-all duration-300 ease-in-out ${
        isHovered ? 'w-64' : 'w-16'
      } shadow-sm`}
      style={{ backgroundColor: '#FDF9F6' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-3 h-full overflow-y-auto">
        {/* Logo - Show collapsed version when collapsed, full version when expanded */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className={`flex items-center cursor-pointer group ${isHovered ? 'justify-center' : ''}`}>
            <div className={`${isHovered ? 'w-36 h-26' : 'w-8 h-6'} rounded-lg flex items-center justify-center group-hover:scale-105 transition-all duration-200`}>
              <img 
                src={isHovered ? "/images/LOGO.svg" : "/images/collapsed.svg"} 
                alt="ViaQuest Hospice Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            if (item.type === 'single') {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              
              return (
                <div key={item.id} className="relative group">
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => onViewChange(item.view)}
                    className={`w-full h-12 p-0 ${
                      isActive 
                        ? 'bg-primary text-white hover:bg-primary/90' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${isHovered ? 'justify-start px-3' : 'justify-center'}`}
                  >
                    <div className={`flex items-center ${isHovered ? 'space-x-3' : ''}`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'} flex-shrink-0`} />
                      {isHovered && (
                        <div className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-900'} transition-opacity duration-200`}>
                          {item.label}
                        </div>
                      )}
                    </div>
                  </Button>
                  
                  {/* Tooltip for collapsed state */}
                  {!isHovered && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            }

            // Group menu
            const Icon = item.icon;
            const isExpanded = isHovered && expandedMenu === item.id;
            const hasActiveChild = item.children?.some(child => currentView === child.view);
            
            return (
              <div key={item.id} className="space-y-1">
                <div className="relative group">
                  <Button
                    variant="ghost"
                    onClick={() => isHovered && toggleMenu(item.id)}
                    className={`w-full h-12 p-0 text-gray-700 hover:bg-gray-100 ${
                      hasActiveChild ? 'bg-gray-50' : ''
                    } ${isHovered ? 'justify-between px-3' : 'justify-center'}`}
                  >
                    <div className={`flex items-center ${isHovered ? 'space-x-3' : ''}`}>
                      <Icon className={`w-5 h-5 text-gray-500 flex-shrink-0 ${hasActiveChild ? 'text-primary' : ''}`} />
                      {isHovered && (
                        <div className={`font-medium text-sm text-gray-900 transition-opacity duration-200 ${hasActiveChild ? 'text-primary' : ''}`}>
                          {item.label}
                        </div>
                      )}
                    </div>
                    {isHovered && (
                      <div className="transition-transform duration-200">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    )}
                  </Button>
                  
                  {/* Tooltip for collapsed state */}
                  {!isHovered && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
                
                {isExpanded && isHovered && (
                  <div className="ml-6 space-y-1 transition-all duration-200">
                    {item.children?.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = currentView === child.view;
                      
                      return (
                        <Button
                          key={child.id}
                          variant={isChildActive ? "default" : "ghost"}
                          onClick={() => onViewChange(child.view)}
                          className={`w-full justify-start p-2 h-10 ${
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
