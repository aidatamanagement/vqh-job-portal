
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
  const { isAuthenticated, userProfile } = useAppContext();
  const [currentView, setCurrentView] = useState<AdminView>('post-job');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading while checking authentication
  if (isAuthenticated && userProfile === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user is admin (only redirect after we have profile data)
  if (userProfile && userProfile.role !== 'admin') {
    return <Navigate to="/" replace />;
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
    <div className="min-h-screen bg-gray-50 animate-slide-up">
      <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 animate-slide-in-right
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <AdminSidebar 
            currentView={currentView} 
            onViewChange={(view) => {
              setCurrentView(view);
              setSidebarOpen(false); // Close sidebar on mobile after selection
            }} 
          />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 w-full lg:w-auto animate-slide-up-delayed">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
