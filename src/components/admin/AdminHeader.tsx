
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppContext } from '@/contexts/AppContext';
import { LogOut, User, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  onMenuClick?: () => void;
  onNavigate?: (view: string) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick, onNavigate }) => {
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
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center">
      <div className="flex items-center justify-between w-full">
        {/* Mobile Menu Button and Logo */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {/* Logo and Title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold text-sm lg:text-lg">VQH</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base lg:text-lg font-bold text-gray-900">ViaQuest Hospice</h1>
              <p className="text-xs text-gray-600">Administrative Dashboard</p>
            </div>
          </div>
        </div>

        {/* Admin Info and Actions */}
        <div className="flex items-center space-x-2 lg:space-x-4">
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
