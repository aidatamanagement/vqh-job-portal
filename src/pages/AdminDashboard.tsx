
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Dashboard from '@/components/admin/Dashboard';
import PostJob from '@/components/admin/PostJob';
import ManageJobs from '@/components/admin/ManageJobs';
import Submissions from '@/components/admin/Submissions';
import ArchiveSubmissions from '@/components/admin/ArchiveSubmissions';
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
import WebAnalytics from '@/components/admin/WebAnalytics';
import WebAnalyticsTest from '@/components/admin/WebAnalyticsTest';
import { File, Star, Bell } from 'lucide-react'; // Added lucide-react imports for icons

type AdminView = 
  | 'dashboard'
  | 'post-job' 
  | 'manage-jobs' 
  | 'submissions'
  | 'archive-submissions'
  | 'interviews'
  | 'settings' 
  | 'email-management' 
  | 'guide-training'
  | 'salespeople'
  | 'visit-logs'
  | 'crm-reports'
  | 'training-videos'
  | 'content-manager'
  | 'profile-settings'
  | 'web-analytics'
  | 'web-analytics-test';

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
      'archive-submissions': 'archive-submissions',
      'interviews': 'interviews',
      'email-management': 'email-management',
      'guide-training': 'guide-training',
      'salespeople': 'salespeople',
      'visit-logs': 'visit-logs',
      'crm-reports': 'crm-reports',
      'training-videos': 'training-videos',
      'content-manager': 'content-manager',
      'settings': 'settings',
      'profile-settings': 'profile-settings',
      'web-analytics': 'web-analytics',
      'web-analytics-test': 'web-analytics-test'
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
      case 'archive-submissions':
        return <ArchiveSubmissions />;
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
      case 'web-analytics':
        return <WebAnalytics />;
      case 'web-analytics-test':
        return <WebAnalyticsTest />;
      case 'settings':
        return <Settings />;
      case 'profile-settings':
        return <ProfileSettings />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="h-screen overflow-hidden animate-slide-up" style={{ backgroundColor: '#FDF9F6' }}>
      {/* Layout Container - Full height */}
      <div className="h-full flex relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Desktop Sidebar - Always visible, hover to expand, starts from top */}
        <div className="hidden lg:block relative z-40">
          <AdminSidebar 
            currentView={currentView} 
            onViewChange={handleNavigate} 
          />
        </div>
        
        {/* Mobile Sidebar - Toggle visibility, starts from top */}
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
        
        {/* Main Content Area with header inside */}
        <main className="flex-1 flex flex-col overflow-hidden animate-slide-up-delayed transition-all duration-300 lg:ml-8" style={{ backgroundColor: '#FDF9F6' }}>
          {/* Header - Inside main content area, doesn't affect sidebar */}
          <AdminHeader 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            onNavigate={handleNavigate}
            currentView={currentView}
          />
          
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-2 lg:px-4 py-2 lg:py-4">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
