import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { User, LogOut, Settings, Lock, Menu } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import UserProfileModal from '@/components/UserProfileModal';
const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const {
    isAuthenticated,
    user,
    userProfile,
    logout
  } = useAppContext();
  const handleLogoClick = () => {
    navigate('/');
  };
  const handleAdminLoginClick = () => {
    navigate('/admin/login');
  };
  const handleAdminClick = () => {
    navigate('/admin');
  };
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  return <header className="bg-white border-b border-gray-200 px-2 py-2 animate-slide-down">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center cursor-pointer group" onClick={handleLogoClick}>
          <div className="h-20 w-48 md:h-24 md:w-60 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
             <img 
               src="/images/LOGO.svg" 
               alt="ViaQuest Hospice Logo" 
               className="h-full w-full object-contain"
             />
           </div>
        </div>

        {/* Authentication Controls */}
        <div className="flex items-center space-x-1 md:space-x-2">
          {isAuthenticated ? <>
              {/* Mobile Menu for Authenticated Users */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Menu className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    {userProfile?.role === 'admin' && <DropdownMenuItem onClick={handleAdminClick}>
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>}
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop Menu for Authenticated Users */}
              <div className="hidden md:flex items-center space-x-2">
                {/* User Profile Avatar */}
                <div 
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs font-semibold bg-primary text-white">
                      {(userProfile?.admin_name || userProfile?.display_name || user?.email || 'U')
                        .split(' ')
                        .map(name => name[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {userProfile?.admin_name || userProfile?.display_name || 'User'}
                    </p>
                  </div>
                </div>

                {/* Admin Access */}
                {userProfile?.role === 'admin' && <Button variant="outline" size="sm" onClick={handleAdminClick} className="flex items-center space-x-1">
                    <Settings className="w-4 h-4" />
                    <span className="hidden lg:inline">Admin Panel</span>
                    <span className="lg:hidden">Admin</span>
                  </Button>}

                {/* Logout Button */}
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center space-x-1 hover:bg-red-50 hover:border-red-200 hover:text-red-700">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>
              </div>
            </> : <Button onClick={handleAdminLoginClick} className="bg-primary hover:bg-primary/90 flex items-center space-x-2 text-sm md:text-base px-3 md:px-4 py-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Admin Login</span>
              <span className="sm:hidden">Login</span>
            </Button>}
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </header>;
};
export default Header;