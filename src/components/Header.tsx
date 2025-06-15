
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { User, LogOut, Settings, Lock } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, userProfile, logout } = useAppContext();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleAdminLoginClick = () => {
    navigate('/admin/login');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleUserInfoClick = () => {
    if (userProfile?.role === 'admin') {
      navigate('/admin');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 animate-slide-down">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and Title */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={handleLogoClick}
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <span className="text-white font-bold text-lg">HC</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">HospiceCare</h1>
            <p className="text-sm text-gray-600">Compassionate Career Opportunities</p>
          </div>
        </div>

        {/* Authentication Controls */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {/* User Info - Now clickable for admins */}
              <div 
                className={`hidden sm:flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg ${
                  userProfile?.role === 'admin' ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
                }`}
                onClick={handleUserInfoClick}
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {userProfile?.display_name || user?.email?.split('@')[0] || 'Admin'}
                  </p>
                  {userProfile?.role && (
                    <Badge 
                      variant={userProfile.role === 'admin' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {userProfile.role}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Admin Access */}
              {userProfile?.role === 'admin' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdminClick}
                  className="flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={handleAdminLoginClick}
              className="bg-primary hover:bg-primary/90 flex items-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>Admin Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
