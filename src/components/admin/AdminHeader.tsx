
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminHeader: React.FC = () => {
  const { logout, user } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={handleLogoClick}
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <span className="text-white font-bold text-lg">HC</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">HospiceCare Admin</h1>
            <p className="text-xs text-gray-600">Administrative Dashboard</p>
          </div>
        </div>

        {/* Admin Info and Actions */}
        <div className="flex items-center space-x-4">
          {/* Admin Info */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">Administrator</p>
              <p className="text-gray-600">{user?.email || 'admin@hospicecare.com'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
