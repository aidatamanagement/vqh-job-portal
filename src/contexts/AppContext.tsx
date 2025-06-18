
import React, { createContext, useContext, useState } from 'react';
import { AppContextType } from './types';
import { useAuth } from './hooks/useAuth';
import { useDataFetching } from './hooks/useDataFetching';
import { useAdminOperations } from './hooks/useAdminOperations';

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
    
    // UI state
    isLoading: isLoading || auth.isLoading,
    setIsLoading,
    isDataLoading: dataFetching.isDataLoading,
    
    // Data fetching functions
    fetchJobs: dataFetching.fetchJobs,
    fetchApplications: dataFetching.fetchApplications,
    fetchMasterData: dataFetching.fetchMasterData,
    
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
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
