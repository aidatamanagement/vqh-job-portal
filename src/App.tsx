
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import JobsList from '@/pages/JobsList';
import JobDetails from '@/pages/JobDetails';
import AdminDashboard from '@/pages/AdminDashboard';
import ApplicationTracker from '@/pages/ApplicationTracker';
import NotFound from '@/pages/NotFound';
import { AppProvider } from '@/contexts/AppContext';
import CursorGlow from '@/components/CursorGlow';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <div className="App relative">
            <CursorGlow />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/jobs" element={<JobsList />} />
              <Route path="/job/:id" element={<JobDetails />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/track/:token" element={<ApplicationTracker />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
