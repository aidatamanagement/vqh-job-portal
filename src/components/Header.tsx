import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { User, LogOut, Settings, Lock, Menu } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
const Header: React.FC = () => {
  const navigate = useNavigate();
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
  return <header className="bg-white border-b border-gray-200 px-4 py-4 animate-slide-down">
      <div className="container mx-auto p-0 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={handleLogoClick}>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <span className="text-white font-bold text-sm md:text-lg">VQH</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">ViaQuest Hospice</h1>
            <p className="text-xs md:text-sm text-gray-600">Compassionate Career Opportunities</p>
          </div>
          <div className="sm:hidden">
            <h1 className="text-lg font-bold text-gray-900">ViaQuest Hospice</h1>
          </div>
        </div>

        {/* Authentication Controls */}
        <div className="flex items-center space-x-2 md:space-x-4">
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
              <div className="hidden md:flex items-center space-x-4">
                {/* Admin Access */}
                {userProfile?.role === 'admin' && <Button variant="outline" size="sm" onClick={handleAdminClick} className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span className="hidden lg:inline">
                      {userProfile?.display_name || userProfile?.email || 'Admin'}
                    </span>
                    <span className="lg:hidden">Admin</span>
                  </Button>}

                {/* Logout Button */}
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700">
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
    </header>;
};
export default Header;