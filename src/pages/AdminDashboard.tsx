
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import PostJob from '@/components/admin/PostJob';
import ManageJobs from '@/components/admin/ManageJobs';
import Submissions from '@/components/admin/Submissions';
import Settings from '@/components/admin/Settings';
import EmailManagement from '@/components/admin/EmailManagement';

type AdminView = 'post-job' | 'manage-jobs' | 'submissions' | 'settings' | 'email-management';

const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('post-job');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      navigate('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'post-job':
        return <PostJob />;
      case 'manage-jobs':
        return <ManageJobs />;
      case 'submissions':
        return <Submissions />;
      case 'email-management':
        return <EmailManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <PostJob />;
    }
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 flex flex-col">
        <AdminHeader onLogout={handleLogout} />
        <main className="flex-1 overflow-auto">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
