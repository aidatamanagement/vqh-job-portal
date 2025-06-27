
import { UserRole } from '@/types';

export interface RolePermissions {
  canManageJobs: boolean;
  canViewApplications: boolean;
  canManageApplications: boolean;
  canManageSalespeople: boolean;
  canViewSalespeople: boolean;
  canManageVisitLogs: boolean;
  canViewVisitLogs: boolean;
  canManageTrainingVideos: boolean;
  canViewTrainingVideos: boolean;
  canManageEmailSettings: boolean;
  canViewEmailLogs: boolean;
  canManageUsers: boolean;
  canViewDashboard: boolean;
  canManageContent: boolean;
}

export const getRolePermissions = (role: UserRole): RolePermissions => {
  switch (role) {
    case 'admin':
      return {
        canManageJobs: true,
        canViewApplications: true,
        canManageApplications: true,
        canManageSalespeople: true,
        canViewSalespeople: true,
        canManageVisitLogs: true,
        canViewVisitLogs: true,
        canManageTrainingVideos: true,
        canViewTrainingVideos: true,
        canManageEmailSettings: true,
        canViewEmailLogs: true,
        canManageUsers: true,
        canViewDashboard: true,
        canManageContent: true,
      };
    
    case 'recruiter':
      return {
        canManageJobs: true,
        canViewApplications: true,
        canManageApplications: true,
        canManageSalespeople: false,
        canViewSalespeople: false,
        canManageVisitLogs: false,
        canViewVisitLogs: false,
        canManageTrainingVideos: false,
        canViewTrainingVideos: false,
        canManageEmailSettings: false,
        canViewEmailLogs: false,
        canManageUsers: false,
        canViewDashboard: true,
        canManageContent: false,
      };
    
    case 'hr':
      return {
        canManageJobs: false,
        canViewApplications: true,
        canManageApplications: true,
        canManageSalespeople: true,
        canViewSalespeople: true,
        canManageVisitLogs: true,
        canViewVisitLogs: true,
        canManageTrainingVideos: false,
        canViewTrainingVideos: true,
        canManageEmailSettings: false,
        canViewEmailLogs: false,
        canManageUsers: false,
        canViewDashboard: true,
        canManageContent: false,
      };
    
    case 'trainer':
      return {
        canManageJobs: false,
        canViewApplications: false,
        canManageApplications: false,
        canManageSalespeople: false,
        canViewSalespeople: false,
        canManageVisitLogs: false,
        canViewVisitLogs: false,
        canManageTrainingVideos: true,
        canViewTrainingVideos: true,
        canManageEmailSettings: false,
        canViewEmailLogs: false,
        canManageUsers: false,
        canViewDashboard: true,
        canManageContent: false,
      };
    
    case 'content_manager':
      return {
        canManageJobs: false,
        canViewApplications: false,
        canManageApplications: false,
        canManageSalespeople: false,
        canViewSalespeople: false,
        canManageVisitLogs: false,
        canViewVisitLogs: false,
        canManageTrainingVideos: false,
        canViewTrainingVideos: false,
        canManageEmailSettings: false,
        canViewEmailLogs: false,
        canManageUsers: false,
        canViewDashboard: true,
        canManageContent: true,
      };
    
    case 'user':
      return {
        canManageJobs: false,
        canViewApplications: false,
        canManageApplications: false,
        canManageSalespeople: false,
        canViewSalespeople: false,
        canManageVisitLogs: false,
        canViewVisitLogs: false,
        canManageTrainingVideos: false,
        canViewTrainingVideos: false,
        canManageEmailSettings: false,
        canViewEmailLogs: false,
        canManageUsers: false,
        canViewDashboard: false,
        canManageContent: false,
      };
    
    default:
      // Default to minimal permissions
      return {
        canManageJobs: false,
        canViewApplications: false,
        canManageApplications: false,
        canManageSalespeople: false,
        canViewSalespeople: false,
        canManageVisitLogs: false,
        canViewVisitLogs: false,
        canManageTrainingVideos: false,
        canViewTrainingVideos: false,
        canManageEmailSettings: false,
        canViewEmailLogs: false,
        canManageUsers: false,
        canViewDashboard: false,
        canManageContent: false,
      };
  }
};

export const hasPermission = (userRole: UserRole, permission: keyof RolePermissions): boolean => {
  const permissions = getRolePermissions(userRole);
  return permissions[permission];
};
