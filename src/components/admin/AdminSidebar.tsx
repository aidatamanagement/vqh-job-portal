import React from 'react';
import { BarChart3, Briefcase, Plus, FileText, Mail, BookOpen, Users, MapPin, TrendingUp, Play, Edit, Settings, Calendar } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface AdminSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, onViewChange }) => {
  const { userProfile } = useAppContext();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      requiredPermissions: ['canViewDashboard'],
    },
    {
      id: 'post-job',
      label: 'Post Job',
      icon: Plus,
      requiredPermissions: ['canCreateJob'],
    },
    {
      id: 'manage-jobs',
      label: 'Manage Jobs',
      icon: Briefcase,
      requiredPermissions: ['canViewJobs'],
    },
    {
      id: 'submissions',
      label: 'Submissions',
      icon: FileText,
      requiredPermissions: ['canViewApplications'],
    },
    {
      id: 'interviews',
      label: 'Interviews',
      icon: Calendar,
      requiredPermissions: ['canViewApplications'],
    },
    {
      id: 'email-management',
      label: 'Email Management',
      icon: Mail,
      requiredPermissions: ['canManageEmails'],
    },
    {
      id: 'guide-training',
      label: 'Guide & Training',
      icon: BookOpen,
      requiredPermissions: ['canViewTraining'],
    },
    {
      id: 'salespeople',
      label: 'Salespeople',
      icon: Users,
      requiredPermissions: ['canViewSalespeople'],
    },
    {
      id: 'visit-logs',
      label: 'Visit Logs',
      icon: MapPin,
      requiredPermissions: ['canViewVisitLogs'],
    },
    {
      id: 'crm-reports',
      label: 'CRM Reports',
      icon: TrendingUp,
      requiredPermissions: ['canViewReports'],
    },
    {
      id: 'training-videos',
      label: 'Training Videos',
      icon: Play,
      requiredPermissions: ['canViewTrainingVideos'],
    },
    {
      id: 'content-manager',
      label: 'Content Manager',
      icon: Edit,
      requiredPermissions: ['canManageContent'],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      requiredPermissions: ['canViewSettings'],
    },
  ];

  const hasPermission = (requiredPermissions: string[]) => {
    if (!userProfile || !userProfile.role) {
      return false;
    }

    // Map roles to permissions
    const rolePermissions: { [key: string]: string[] } = {
      'admin': [
        'canViewDashboard', 'canCreateJob', 'canViewJobs', 'canViewApplications', 'canManageEmails',
        'canViewTraining', 'canViewSalespeople', 'canViewVisitLogs', 'canViewReports', 'canViewTrainingVideos',
        'canManageContent', 'canViewSettings'
      ],
      'recruiter': [
        'canViewDashboard', 'canCreateJob', 'canViewJobs', 'canViewApplications',
      ],
      'hr': [
        'canViewDashboard', 'canViewApplications', 'canManageEmails',
      ],
      'trainer': [
        'canViewDashboard', 'canViewTraining', 'canViewTrainingVideos',
      ],
      'content_manager': [
        'canViewDashboard', 'canManageContent',
      ],
    };

    const userPermissions = rolePermissions[userProfile.role] || [];
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  };

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen flex flex-col py-4">
      <div className="px-4 mb-8">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
        <p className="text-gray-400">Manage your content</p>
      </div>
      <nav className="flex-1">
        <ul>
          {menuItems.map(item => (
            hasPermission(item.requiredPermissions) && (
              <li key={item.id} className="mb-1">
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`
                    w-full text-left py-3 px-4 rounded-md
                    hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600
                    ${currentView === item.id ? 'bg-gray-700' : ''}
                    flex items-center space-x-3
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            )
          ))}
        </ul>
      </nav>
      <div className="mt-auto px-4 py-2">
        {userProfile && (
          <div className="text-center">
            <p className="text-sm text-gray-400">Logged in as:</p>
            <p className="text-white font-semibold">{userProfile.admin_name || userProfile.email}</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
