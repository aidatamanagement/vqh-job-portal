
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContextType } from './types';
import { useAuth } from './hooks/useAuth';
import { useDataFetching } from './hooks/useDataFetching';
import { useAdminOperations } from './hooks/useAdminOperations';
import { useCrmDataFetching } from './hooks/useCrmDataFetching';
import { useCrmOperations } from './hooks/useCrmOperations';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Use custom hooks for different concerns
  const auth = useAuth();
  const dataFetching = useDataFetching(auth.user, auth.userProfile);
  const adminOperations = useAdminOperations(dataFetching.fetchJobs, dataFetching.fetchMasterData);
  const crmDataFetching = useCrmDataFetching(auth.user, auth.userProfile);
  const crmOperations = useCrmOperations(
    crmDataFetching.fetchSalespeople,
    crmDataFetching.fetchVisitLogs,
    crmDataFetching.fetchTrainingVideos
  );

  // Fetch CRM data when user and userProfile are available
  useEffect(() => {
    if (auth.user && auth.userProfile) {
      if (auth.userProfile.role === 'admin') {
        crmDataFetching.fetchSalespeople();
        crmDataFetching.fetchVisitLogs();
      }
      crmDataFetching.fetchTrainingVideos();
    }
  }, [auth.user, auth.userProfile, crmDataFetching.fetchSalespeople, crmDataFetching.fetchVisitLogs, crmDataFetching.fetchTrainingVideos]);

  const value: AppContextType = {
    // Auth state
    user: auth.user,
    session: auth.session,
    isAuthenticated: auth.isAuthenticated,
    userProfile: auth.userProfile,
    login: auth.login,
    signup: auth.signup,
    logout: async () => {
      await auth.logout();
      dataFetching.setApplications([]);
      crmDataFetching.setSalespeople([]);
      crmDataFetching.setVisitLogs([]);
      crmDataFetching.setTrainingVideos([]);
    },
    updateUserDisplayName: auth.updateUserDisplayName,
    
    // Jobs state
    jobs: dataFetching.jobs,
    setJobs: dataFetching.setJobs,
    
    // Applications state
    applications: dataFetching.applications,
    setApplications: dataFetching.setApplications,
    
    // Master data
    positions: dataFetching.positions,
    setPositions: dataFetching.setPositions,
    locations: dataFetching.locations,
    setLocations: dataFetching.setLocations,
    facilities: dataFetching.facilities,
    setFacilities: dataFetching.setFacilities,

    // CRM and Training data
    salespeople: crmDataFetching.salespeople,
    setSalespeople: crmDataFetching.setSalespeople,
    visitLogs: crmDataFetching.visitLogs,
    setVisitLogs: crmDataFetching.setVisitLogs,
    trainingVideos: crmDataFetching.trainingVideos,
    setTrainingVideos: crmDataFetching.setTrainingVideos,
    
    // UI state
    isLoading: isLoading || auth.isLoading,
    setIsLoading,
    isDataLoading: dataFetching.isDataLoading,
    
    // Data fetching functions
    fetchJobs: dataFetching.fetchJobs,
    fetchApplications: dataFetching.fetchApplications,
    fetchMasterData: dataFetching.fetchMasterData,
    fetchHRManagers: adminOperations.fetchHRManagers,
    fetchSalespeople: crmDataFetching.fetchSalespeople,
    fetchVisitLogs: crmDataFetching.fetchVisitLogs,
    fetchTrainingVideos: crmDataFetching.fetchTrainingVideos,
    
    // Admin operations
    createJob: adminOperations.createJob,
    updateJob: adminOperations.updateJob,
    deleteJob: adminOperations.deleteJob,
    createPosition: adminOperations.createPosition,
    deletePosition: adminOperations.deletePosition,
    createLocation: adminOperations.createLocation,
    deleteLocation: adminOperations.deleteLocation,
    createFacility: adminOperations.createFacility,
    deleteFacility: adminOperations.deleteFacility,

    // CRM operations
    createSalesperson: crmOperations.createSalesperson,
    updateSalesperson: crmOperations.updateSalesperson,
    deleteSalesperson: crmOperations.deleteSalesperson,
    createVisitLog: crmOperations.createVisitLog,
    updateVisitLog: crmOperations.updateVisitLog,
    deleteVisitLog: crmOperations.deleteVisitLog,
    createTrainingVideo: crmOperations.createTrainingVideo,
    updateTrainingVideo: crmOperations.updateTrainingVideo,
    deleteTrainingVideo: crmOperations.deleteTrainingVideo,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
