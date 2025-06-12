
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import PostJob from '@/components/admin/PostJob';
import ManageJobs from '@/components/admin/ManageJobs';
import Submissions from '@/components/admin/Submissions';
import Settings from '@/components/admin/Settings';

type AdminView = 'post-job' | 'manage-jobs' | 'submissions' | 'settings';

const AdminDashboard: React.FC = () => {
  const { isAuthenticated } = useAppContext();
  const [currentView, setCurrentView] = useState<AdminView>('post-job');

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'post-job':
        return <PostJob />;
      case 'manage-jobs':
        return <ManageJobs />;
      case 'submissions':
        return <Submissions />;
      case 'settings':
        return <Settings />;
      default:
        return <PostJob />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
