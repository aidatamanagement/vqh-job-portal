
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleAdminLoginClick = () => {
    navigate('/admin/login');
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
            <p className="text-sm text-gray-600">Administrative Portal</p>
          </div>
        </div>

        {/* Admin Login Button */}
        <div className="flex items-center">
          <Button
            onClick={handleAdminLoginClick}
            className="bg-primary hover:bg-primary/90 flex items-center space-x-2"
          >
            <Lock className="w-4 h-4" />
            <span>Admin Login</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
