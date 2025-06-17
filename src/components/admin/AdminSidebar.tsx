
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { 
  Briefcase, 
  Users, 
  Inbox, 
  Settings, 
  LogOut, 
  Plus,
  BookOpen,
  UserCheck
} from 'lucide-react';

interface AdminSidebarProps {
  currentView: string;
  onViewChange: (view: 'post-job' | 'manage-jobs' | 'submissions' | 'settings' | 'user-guide' | 'onboarding') => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, onViewChange }) => {
  const { logout } = useAppContext();

  const handleLogout = async () => {
    await logout();
  };

  const navigationItems = [
    {
      id: 'post-job',
      label: 'Post Job',
      icon: Plus,
      className: 'sidebar-post-job'
    },
    {
      id: 'manage-jobs',
      label: 'Manage Jobs',
      icon: Briefcase,
      className: 'sidebar-manage-jobs'
    },
    {
      id: 'submissions',
      label: 'Submissions',
      icon: Inbox,
      className: 'sidebar-submissions'
    },
    {
      id: 'onboarding',
      label: 'Onboarding',
      icon: UserCheck,
      className: 'sidebar-onboarding'
    },
    {
      id: 'user-guide',
      label: 'User Guide',
      icon: BookOpen,
      className: 'sidebar-user-guide'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      className: 'sidebar-settings'
    }
  ];

  return (
    <div className="w-64 bg-white h-screen shadow-lg flex flex-col animate-slide-in-left">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">HC</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Admin Panel</h2>
            <p className="text-xs text-gray-600">Management Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-10 ${item.className} ${
                isActive 
                  ? "bg-primary text-white hover:bg-primary/90" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => onViewChange(item.id as any)}
            >
              <IconComponent className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-700"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
