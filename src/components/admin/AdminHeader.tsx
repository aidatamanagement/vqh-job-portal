
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppContext } from '@/contexts/AppContext';
import { LogOut, User, Menu, BarChart3, Plus, Briefcase, FileText, Calendar, Mail, BookOpen, Users, MapPin, ClipboardList, Video, Settings, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  onMenuClick?: () => void;
  onNavigate?: (view: string) => void;
  currentView?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick, onNavigate, currentView }) => {
  const { logout, userProfile } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleProfileClick = () => {
    onNavigate?.('profile-settings');
  };

  return (
    <header className="border-b border-gray-200 px-6 lg:px-8 h-16 flex items-center" style={{ backgroundColor: '#FDF9F6' }}>
      <div className="flex items-center justify-between w-full">
        {/* Mobile Menu Button and Dashboard Title */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {/* Page Title and Icon - Show for all pages */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                {currentView === 'dashboard' ? <BarChart3 className="w-4 h-4 text-white" /> :
                 currentView === 'post-job' ? <Plus className="w-4 h-4 text-white" /> :
                 currentView === 'manage-jobs' ? <Briefcase className="w-4 h-4 text-white" /> :
                 currentView === 'submissions' ? <FileText className="w-4 h-4 text-white" /> :
                 currentView === 'interviews' ? <Calendar className="w-4 h-4 text-white" /> :
                 currentView === 'email-management' ? <Mail className="w-4 h-4 text-white" /> :
                 currentView === 'guide-training' ? <BookOpen className="w-4 h-4 text-white" /> :
                 currentView === 'salespeople' ? <Users className="w-4 h-4 text-white" /> :
                 currentView === 'visit-logs' ? <MapPin className="w-4 h-4 text-white" /> :
                 currentView === 'crm-reports' ? <ClipboardList className="w-4 h-4 text-white" /> :
                 currentView === 'training-videos' ? <Video className="w-4 h-4 text-white" /> :
                 currentView === 'content-manager' ? <Building className="w-4 h-4 text-white" /> :
                 currentView === 'settings' ? <Settings className="w-4 h-4 text-white" /> :
                 currentView === 'profile-settings' ? <User className="w-4 h-4 text-white" /> :
                 <BarChart3 className="w-4 h-4 text-white" />}
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {currentView === 'dashboard' ? 
                  (userProfile?.role === 'admin' ? 'Admin Dashboard' :
                   userProfile?.role === 'recruiter' ? 'Recruiter Dashboard' :
                   userProfile?.role === 'hr' ? 'HR Dashboard' :
                   userProfile?.role === 'trainer' ? 'Trainer Dashboard' :
                   userProfile?.role === 'content_manager' ? 'Content Manager Dashboard' :
                   'Dashboard') : 
                 currentView === 'post-job' ? 'Post Job' :
                 currentView === 'manage-jobs' ? 'Manage Jobs' :
                 currentView === 'submissions' ? 'Submissions' :
                 currentView === 'interviews' ? 'Interviews' :
                 currentView === 'email-management' ? 'Email Management' :
                 currentView === 'guide-training' ? 'Guide Training' :
                 currentView === 'salespeople' ? 'Salespeople' :
                 currentView === 'visit-logs' ? 'Visit Logs' :
                 currentView === 'crm-reports' ? 'CRM Reports' :
                 currentView === 'training-videos' ? 'Training Videos' :
                 currentView === 'content-manager' ? 'Content Manager' :
                 currentView === 'settings' ? 'Settings' :
                 currentView === 'profile-settings' ? 'Profile Settings' :
                 'Dashboard'}
              </h1>
            </div>
          </div>
        </div>

        {/* Admin Info and Actions */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Welcome Message - Desktop */}
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-800">
              Welcome, {userProfile?.display_name || 'User'}
            </p>
          </div>
          
          {/* Desktop Profile Dropdown */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="cursor-pointer hover:opacity-80 transition-opacity duration-200">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={userProfile?.profile_image_url || ""} />
                    <AvatarFallback className="text-sm font-semibold bg-primary text-white">
                      {(userProfile?.admin_name || userProfile?.display_name || 'A')
                        .split(' ')
                        .map(name => name[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1">
                {/* User Info Header */}
                <div className="px-2 py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={userProfile?.profile_image_url || ""} />
                      <AvatarFallback className="text-xs font-semibold bg-primary text-white">
                        {(userProfile?.admin_name || userProfile?.display_name || 'A')
                          .split(' ')
                          .map(name => name[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{userProfile?.admin_name || userProfile?.display_name || 'Administrator'}</p>
                      <p className="text-xs text-gray-500 truncate">{userProfile?.email || 'No email'}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <DropdownMenuItem onClick={handleProfileClick} className="flex items-center space-x-2 px-2 py-1.5 cursor-pointer text-sm">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="my-1" />
                  
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 px-2 py-1.5 cursor-pointer text-sm text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Welcome Message - Mobile */}
          <div className="md:hidden">
            <p className="text-sm font-medium text-gray-800">
              Welcome, {userProfile?.display_name || 'User'}
            </p>
          </div>
          
          {/* Mobile Profile Dropdown */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity duration-200">
                  <AvatarImage src={userProfile?.profile_image_url || ""} />
                  <AvatarFallback className="text-sm font-semibold bg-primary text-white">
                    {(userProfile?.admin_name || userProfile?.display_name || 'A')
                      .split(' ')
                      .map(name => name[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1">
                <div className="px-2 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{userProfile?.admin_name || userProfile?.display_name || 'Administrator'}</p>
                  <p className="text-xs text-gray-500 truncate">{userProfile?.email || 'No email'}</p>
                </div>
                <div className="py-1">
                  <DropdownMenuItem onClick={handleProfileClick} className="flex items-center space-x-2 px-2 py-1.5 cursor-pointer text-sm">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 px-2 py-1.5 cursor-pointer text-sm text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
