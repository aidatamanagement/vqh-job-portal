import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Lock, 
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Edit,
  UserPlus,
  Users,
  Crown,
  Search,
  Filter,
  Camera,
  Calendar,
  Mail,
  Clock,
  MapPin,
  X
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@/types';
import { hasPermission } from '@/utils/rolePermissions';
import CalendlySettings from './CalendlySettings';

import { testProfileImageConnection } from '@/utils/testProfileImageConnection';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AdminUser {
  id: string;
  email: string;
  admin_name: string | null;
  display_name: string | null;
  location: string | null;
  locationName?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

const Settings: React.FC = () => {
  const { user, userProfile, updateUserDisplayName, locations } = useAppContext();

  const [activeTab, setActiveTab] = useState('users');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showAdminConfirmPassword, setShowAdminConfirmPassword] = useState(false);
  const [adminList, setAdminList] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'add' | 'edit'>('add');



  // New admin form state
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    location: 'none',
    role: 'branch_manager' as UserRole,
  });

  // Edit user form state
  const [editUserForm, setEditUserForm] = useState({
    fullName: '',
    location: '',
    role: 'branch_manager' as UserRole,
  });

  const userRoles: { label: string; value: UserRole; description: string }[] = [
    { label: 'Admin', value: 'admin', description: 'Full system access' },
    { label: 'Branch Manager', value: 'branch_manager', description: 'Job and application management' },
    { label: 'HR Manager', value: 'hr', description: 'HR and training management' },
    { label: 'Trainer', value: 'trainer', description: 'Training video management' },
    { label: 'Content Manager', value: 'content_manager', description: 'Content management' },
  ];

  const roleOptions = [
    { label: 'Admin', value: 'admin', description: 'Full system access' },
    { label: 'Branch Manager', value: 'branch_manager', description: 'Job and application management' },
    { label: 'HR Manager', value: 'hr', description: 'HR and training management' },
    { label: 'Trainer', value: 'trainer', description: 'Training video management' },
    { label: 'Content Manager', value: 'content_manager', description: 'Content management' },
  ];

  const canManageUsers = hasPermission(userProfile?.role as UserRole, 'canManageUsers');
  const isAdmin = userProfile?.role === 'admin';

  // Fetch admin users on component mount
  useEffect(() => {
    if (canManageUsers) {
      fetchAllUsers();
    }
  }, [canManageUsers]);

  const fetchAllUsers = async () => {
    console.log('Fetching all users...');
    setIsLoadingAdmins(true);
    
    try {
      // Fetch all users from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, admin_name, display_name, location, role, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
        return;
      }

      console.log('Users fetched:', data);
      // Cast the role field to UserRole and map location names
      const typedUsers = (data || []).map(user => {
        // Find the location name from the locations context
        const locationObj = locations.find(loc => loc.id === user.location);
        return {
          ...user,
          role: user.role as UserRole,
          locationName: locationObj?.name || user.location || 'No Location'
        };
      });
      setAdminList(typedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAdmins(false);
    }
  };



  const handleNewAdminInputChange = (field: string, value: string) => {
    // For location field, keep "none" as is - don't convert to empty string
    setNewAdminForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEditUserInputChange = (field: string, value: string) => {
    // Convert "none" back to empty string for location field
    const actualValue = field === 'location' && value === 'none' ? '' : value;
    setEditUserForm(prev => ({ ...prev, [field]: actualValue }));
  };



  const addNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminForm.email || !newAdminForm.password || !newAdminForm.confirmPassword || !newAdminForm.fullName) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (newAdminForm.password !== newAdminForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Password and confirmation do not match",
        variant: "destructive",
      });
      return;
    }

    if (newAdminForm.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    if (adminList.find(admin => admin.email === newAdminForm.email)) {
      toast({
        title: "Email Already Exists",
        description: "A user with this email already exists",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Creating new user via admin function:', newAdminForm.email, newAdminForm.role);
      console.log('Location being sent:', newAdminForm.location);
      console.log('Location after conversion:', newAdminForm.location === 'none' ? null : newAdminForm.location);
      console.log('Full user_metadata:', {
        display_name: newAdminForm.fullName,
        admin_name: newAdminForm.fullName,
        role: newAdminForm.role,
        location: newAdminForm.location === 'none' ? null : newAdminForm.location
      });
      
      // Use the admin function to create user without auto-login
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: newAdminForm.email,
          password: newAdminForm.password,
          user_metadata: {
            display_name: newAdminForm.fullName,
            admin_name: newAdminForm.fullName,
            role: newAdminForm.role,
            location: newAdminForm.location === 'none' ? null : newAdminForm.location
          }
        }
      });

      if (error) {
        console.error('Function error details:', error);
        console.error('Error message:', error.message);
        console.error('Error status:', error.status);
        console.error('Error name:', error.name);
        
        // Try to get more details from the error
        if (error.context) {
          console.error('Error context:', error.context);
        }
        
        toast({
          title: "Error",
          description: `Failed to create user: ${error.message || 'Unknown error'}`,
          variant: "destructive",
        });
        return;
      }

      console.log('User created successfully:', data);

      // If the edge function doesn't exist, fall back to regular signup but immediately sign out
      if (error && error.message.includes('not found')) {
        console.log('Admin function not found, using fallback method');
        
        // Store current session
        const { data: currentSession } = await supabase.auth.getSession();
        
        // Create user with regular signup
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: newAdminForm.email,
          password: newAdminForm.password,
          options: {
            data: {
              display_name: newAdminForm.fullName,
              admin_name: newAdminForm.fullName,
              role: newAdminForm.role,
              location: newAdminForm.location === 'none' ? null : newAdminForm.location
            }
          }
        });

        if (authError) {
          console.error('Auth error:', authError);
          toast({
            title: "Error",
            description: authError.message,
            variant: "destructive",
          });
          return;
        }

        // Immediately sign out the new user and restore admin session
        await supabase.auth.signOut();
        
        // Restore the admin session
        if (currentSession.session) {
          await supabase.auth.setSession(currentSession.session);
        }

        // Update profile with role and name if user was created
        if (authData.user) {
          console.log('Updating profile for user:', authData.user.id);
          
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              role: newAdminForm.role,
              admin_name: newAdminForm.fullName,
              display_name: newAdminForm.fullName,
              location: newAdminForm.location === 'none' ? null : newAdminForm.location
            })
            .eq('id', authData.user.id);

          if (profileError) {
            console.error('Error updating profile:', profileError);
          } else {
            console.log('Profile updated successfully');
          }
        }
      }

      // Close modal and reset form
      closeUserModal();

      // Refresh user list
      await fetchAllUsers();

      toast({
        title: "User Added",
        description: `New ${newAdminForm.role} ${newAdminForm.fullName} (${newAdminForm.email}) has been added successfully.`,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async () => {
    if (!editingUser) return;

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          admin_name: editUserForm.fullName,
          display_name: editUserForm.fullName,
          location: editUserForm.location,
          role: editUserForm.role
        })
        .eq('id', editingUser.id);

      if (error) {
        console.error('Error updating user:', error);
        toast({
          title: "Error",
          description: "Failed to update user",
          variant: "destructive",
        });
        return;
      }

      closeUserModal();
      await fetchAllUsers();

      toast({
        title: "User Updated",
        description: `User ${editUserForm.fullName} has been updated successfully`,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    // Prevent deleting the currently logged-in user
    if (userId === user?.id) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete your own account",
        variant: "destructive",
      });
      return;
    }

    // Only allow admins to delete users
    if (!isAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only administrators can delete users",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete user ${userEmail}? This action cannot be undone and will remove the user from both the database and authentication system.`)) {
      setIsLoading(true);
      
      try {
        // Delete user from both profiles table and auth table using admin API
        const { data, error } = await supabase.functions.invoke('admin-delete-user', {
          body: {
            user_id: userId
          }
        });

        if (error) {
          console.error('Error deleting user:', error);
          toast({
            title: "Error",
            description: error.message || "Failed to delete user",
            variant: "destructive",
          });
          return;
        }

        // Refresh user list
        await fetchAllUsers();

        toast({
          title: "User Deleted",
          description: `User ${userEmail} has been permanently deleted from the system`,
        });
      } catch (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openAddUserModal = () => {
    setUserModalMode('add');
    setEditingUser(null);
    setNewAdminForm({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      location: 'none',
      role: 'branch_manager',
    });
    setIsUserModalOpen(true);
  };

  const startEditUser = (userToEdit: AdminUser) => {
    // Only allow admins to edit users
    if (!isAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only administrators can edit users",
        variant: "destructive",
      });
      return;
    }

    setUserModalMode('edit');
    setEditingUser(userToEdit);
    setEditUserForm({
      fullName: userToEdit.admin_name || userToEdit.display_name || '',
      location: userToEdit.location || 'none',
      role: userToEdit.role,
    });
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
    setUserModalMode('add');
  };

  const getRoleBadgeVariant = (role: UserRole): "default" | "secondary" | "destructive" => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'branch_manager':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const filteredUsers = adminList.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.admin_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.display_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.locationName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 animate-fade-in-up">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900" style={{ fontSize: '1.3rem' }}>Settings</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
        <TabsList className="grid w-full grid-cols-2">
          {canManageUsers && (
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>User Management</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="calendly" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Calendly</span>
          </TabsTrigger>
        </TabsList>



        <TabsContent value="calendly" className="space-y-6">
          <CalendlySettings />
        </TabsContent>

        {canManageUsers && (
          <TabsContent value="users" className="space-y-6">
            {/* Header with Add New User Button */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  User Management
                </h3>
                <p className="text-sm text-gray-600">Manage system users and their roles</p>
              </div>
              {isAdmin && (
                <Button 
                  onClick={openAddUserModal}
                  className="bg-primary hover:bg-primary/90"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add New User
                </Button>
              )}
            </div>

            {/* Users List */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    All Users ({filteredUsers.length})
                  </h3>
                </div>

                {/* Search and Filter */}
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <div className="flex items-center">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by role" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {userRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {isLoadingAdmins ? (
                    <p className="text-gray-500 text-sm">Loading users...</p>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">No users found.</p>
                      <Button 
                        onClick={fetchAllUsers}
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-primary"
                      >
                        Refresh
                      </Button>
                    </div>
                  ) : (
                    filteredUsers.map((userItem) => (
                      <div key={userItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium text-gray-900">
                              {userItem.admin_name || userItem.display_name || userItem.email}
                            </p>
                            <Badge variant={getRoleBadgeVariant(userItem.role)} className="text-xs">
                              {userRoles.find(r => r.value === userItem.role)?.label || userItem.role}
                            </Badge>
                            {userItem.role === 'admin'}
                          </div>
                          <p className="text-sm text-gray-600">{userItem.email}</p>
                          {userItem.locationName && userItem.locationName !== 'No Location' && (
                            <p className="text-xs text-gray-500 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {userItem.locationName}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Added {new Date(userItem.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {userItem.id !== user?.id && isAdmin && (
                            <>
                              <Button
                                onClick={() => startEditUser(userItem)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                disabled={isLoading}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => deleteUser(userItem.id, userItem.email)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={isLoading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* User Management Modal */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {userModalMode === 'add' ? 'Add New User' : 'Edit User'}
            </DialogTitle>
            <DialogDescription>
              {userModalMode === 'add' 
                ? 'Create a new user account with role and permissions.' 
                : 'Update user information and role.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={userModalMode === 'add' ? addNewUser : (e) => { e.preventDefault(); updateUser(); }} className="space-y-4">
            {userModalMode === 'add' && (
              <>
                <div>
                  <Label htmlFor="modalUserRole">Role *</Label>
                  <Select 
                    value={newAdminForm.role} 
                    onValueChange={(value: UserRole) => handleNewAdminInputChange('role', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{role.label}</span>
                            {role.value === 'admin'}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {userRoles.find(r => r.value === newAdminForm.role)?.description}
                  </p>
                </div>

                <div>
                  <Label htmlFor="modalFullName">Full Name *</Label>
                  <Input
                    id="modalFullName"
                    type="text"
                    value={newAdminForm.fullName}
                    onChange={(e) => handleNewAdminInputChange('fullName', e.target.value)}
                    className="mt-1"
                    placeholder="Enter user's full name"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="modalUserEmail">Email Address *</Label>
                  <Input
                    id="modalUserEmail"
                    type="email"
                    value={newAdminForm.email}
                    onChange={(e) => handleNewAdminInputChange('email', e.target.value)}
                    className="mt-1"
                    placeholder="user@hospicecare.com"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="modalUserLocation">Location</Label>
                  <Select 
                    value={newAdminForm.location} 
                    onValueChange={(value) => handleNewAdminInputChange('location', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select user's location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No location specified</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="modalUserPassword">Password *</Label>
                  <div className="relative mt-1">
                    <Input
                      id="modalUserPassword"
                      type={showAdminPassword ? 'text' : 'password'}
                      value={newAdminForm.password}
                      onChange={(e) => handleNewAdminInputChange('password', e.target.value)}
                      className="pr-10"
                      placeholder="Minimum 8 characters"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="modalUserConfirmPassword">Confirm Password *</Label>
                  <div className="relative mt-1">
                    <Input
                      id="modalUserConfirmPassword"
                      type={showAdminConfirmPassword ? 'text' : 'password'}
                      value={newAdminForm.confirmPassword}
                      onChange={(e) => handleNewAdminInputChange('confirmPassword', e.target.value)}
                      className="pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminConfirmPassword(!showAdminConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showAdminConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {userModalMode === 'edit' && (
              <>
                <div>
                  <Label htmlFor="modalEditFullName">Full Name</Label>
                  <Input
                    id="modalEditFullName"
                    type="text"
                    value={editUserForm.fullName}
                    onChange={(e) => handleEditUserInputChange('fullName', e.target.value)}
                    className="mt-1"
                    placeholder="Enter full name"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="modalEditUserLocation">Location</Label>
                  <Select 
                    value={editUserForm.location} 
                    onValueChange={(value) => handleEditUserInputChange('location', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No location specified</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="modalEditUserRole">Role</Label>
                  <Select 
                    value={editUserForm.role} 
                    onValueChange={(value: UserRole) => handleEditUserInputChange('role', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{role.label}</span>
                            {role.value === 'admin'}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeUserModal}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading 
                  ? (userModalMode === 'add' ? 'Adding...' : 'Updating...') 
                  : (userModalMode === 'add' ? 'Add User' : 'Update User')
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
