
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Dashboard from '@/components/admin/Dashboard';
import PostJob from '@/components/admin/PostJob';
import ManageJobs from '@/components/admin/ManageJobs';
import Submissions from '@/components/admin/Submissions';
import Interviews from '@/components/admin/Interviews';
import Settings from '@/components/admin/Settings';
import EmailManagement from '@/components/admin/EmailManagement';
import Salespeople from '@/components/admin/Salespeople';
import VisitLogs from '@/components/admin/VisitLogs';
import TrainingVideos from '@/components/admin/TrainingVideos';
import CrmReports from '@/components/admin/CrmReports';
import GuideTraining from '@/components/admin/GuideTraining';
import ContentManager from '@/components/admin/ContentManager';
import ProfileSettings from '@/components/admin/ProfileSettings';

type AdminView = 
  | 'dashboard'
  | 'post-job' 
  | 'manage-jobs' 
  | 'submissions'
  | 'interviews'
  | 'settings' 
  | 'email-management' 
  | 'guide-training'
  | 'salespeople'
  | 'visit-logs'
  | 'crm-reports'
  | 'training-videos'
  | 'content-manager'
  | 'profile-settings';

const AdminDashboard: React.FC = () => {
  const { isAuthenticated } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Extract current view from URL path
  const getCurrentViewFromPath = (pathname: string): AdminView => {
    const path = pathname.split('/').pop() || 'dashboard';
    
    // Map URL paths to AdminView types
    const pathToView: Record<string, AdminView> = {
      'admin': 'dashboard',
      'dashboard': 'dashboard',
      'post-job': 'post-job',
      'manage-jobs': 'manage-jobs',
      'submissions': 'submissions',
      'interviews': 'interviews',
      'email-management': 'email-management',
      'guide-training': 'guide-training',
      'salespeople': 'salespeople',
      'visit-logs': 'visit-logs',
      'crm-reports': 'crm-reports',
      'training-videos': 'training-videos',
      'content-manager': 'content-manager',
      'settings': 'settings',
      'profile-settings': 'profile-settings'
    };
    
    return pathToView[path] || 'dashboard';
  };

  const currentView = getCurrentViewFromPath(location.pathname);

  // Show login page if not authenticated - handled by AdminLogin route
  if (!isAuthenticated) {
    return null;
  }

  const handleNavigate = (view: AdminView) => {
    // Navigate to the appropriate URL
    if (view === 'dashboard') {
      navigate('/admin');
    } else {
      navigate(`/admin/${view}`);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'post-job':
        return <PostJob />;
      case 'manage-jobs':
        return <ManageJobs />;
      case 'submissions':
        return <Submissions />;
      case 'interviews':
        return <Interviews />;
      case 'email-management':
        return <EmailManagement />;
      case 'guide-training':
        return <GuideTraining />;
      case 'salespeople':
        return <Salespeople />;
      case 'visit-logs':
        return <VisitLogs />;
      case 'crm-reports':
        return <CrmReports />;
      case 'training-videos':
        return <TrainingVideos />;
      case 'content-manager':
        return <ContentManager />;
      case 'settings':
        return <Settings />;
      case 'profile-settings':
        return <ProfileSettings />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 overflow-hidden animate-slide-up">
      {/* Fixed Header */}
      <div className="h-16 bg-white border-b border-gray-200 relative z-50">
        <AdminHeader 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          onNavigate={(view) => handleNavigate(view as AdminView)}
        />
      </div>
      
      {/* Layout Container - Takes remaining height after header */}
      <div className="h-[calc(100vh-4rem)] flex relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Desktop Sidebar - Always visible, hover to expand */}
        <div className="hidden lg:block relative z-40">
          <AdminSidebar 
            currentView={currentView} 
            onViewChange={handleNavigate} 
          />
        </div>
        
        {/* Mobile Sidebar - Toggle visibility */}
        <div className={`
          absolute left-0 top-0 h-full z-40 shadow-lg lg:hidden transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <AdminSidebar 
            currentView={currentView} 
            onViewChange={(view) => {
              handleNavigate(view);
              setSidebarOpen(false); // Close sidebar on mobile after selection
            }}
            isMobile={true}
          />
        </div>
        
        {/* Main Content Area - Only this scrolls */}
        <main className="flex-1 overflow-y-auto bg-gray-50 animate-slide-up-delayed transition-all duration-300 lg:ml-16">
          <div className="px-4 lg:px-8 py-4 lg:py-8">
            <div className="max-w-7xl mx-auto pt-4">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
