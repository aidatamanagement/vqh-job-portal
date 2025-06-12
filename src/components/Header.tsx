
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdminClick = () => {
    if (isAuthenticated) {
      navigate('/admin');
    } else {
      navigate('/admin/login');
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold text-xl">HC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">HospiceCare</h1>
              <p className="text-sm text-gray-600">Career Portal</p>
            </div>
          </div>

          {/* Admin Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && location.pathname.startsWith('/admin') ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            ) : (
              <Button
                onClick={handleAdminClick}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                {isAuthenticated ? 'Admin Dashboard' : 'Admin Login'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
