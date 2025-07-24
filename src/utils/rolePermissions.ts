
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
        canManageTrainingVideos: true,
        canViewTrainingVideos: true,
        canManageEmailSettings: false,
        canViewEmailLogs: false,
        canManageUsers: false,
        canViewDashboard: true,
        canManageContent: false,
      };
    
    case 'hr':
      return {
        canManageJobs: true, // ✅ Give managers access to all job portal features
        canViewApplications: true,
        canManageApplications: true,
        canManageSalespeople: false, // ❌ Remove CRM access
        canViewSalespeople: false, // ❌ Remove CRM access
        canManageVisitLogs: false, // ❌ Remove CRM access
        canViewVisitLogs: false, // ❌ Remove CRM access
        canManageTrainingVideos: true, // ✅ Give managers training access
        canViewTrainingVideos: true,
        canManageEmailSettings: true, // ✅ Give managers email settings access
        canViewEmailLogs: true, // ✅ Give managers email logs access
        canManageUsers: false, // Keep user management restricted to admins only
        canViewDashboard: true,
        canManageContent: false, // ❌ Remove content manager access
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
    
    default:
      // Default to minimal permissions for any undefined role
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
