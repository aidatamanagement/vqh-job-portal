
import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Dashboard from '@/components/admin/Dashboard';
import PostJob from '@/components/admin/PostJob';
import ManageJobs from '@/components/admin/ManageJobs';
import Submissions from '@/components/admin/Submissions';
import Settings from '@/components/admin/Settings';
import EmailManagement from '@/components/admin/EmailManagement';
import Salespeople from '@/components/admin/Salespeople';
import VisitLogs from '@/components/admin/VisitLogs';
import TrainingVideos from '@/components/admin/TrainingVideos';
import CrmReports from '@/components/admin/CrmReports';
import GuideTraining from '@/components/admin/GuideTraining';
import ContentManager from '@/components/admin/ContentManager';
import Interviews from '@/components/admin/Interviews';

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
  | 'content-manager';

const AdminDashboard: React.FC = () => {
  const { isAuthenticated } = useAppContext();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show login page if not authenticated - handled by AdminLogin route
  if (!isAuthenticated) {
    return null;
  }

  const handleNavigate = (view: AdminView) => {
    setCurrentView(view);
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
      default:
        return <Dashboard onNavigate={handleNavigate} />;
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
              setCurrentView(view as AdminView);
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
