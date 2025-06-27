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
  Check,
  X,
  Camera,
  Calendar,
  Mail,
  Clock
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@/types';
import { getRolePermissions, hasPermission } from '@/utils/rolePermissions';
import CalendlySettings from './CalendlySettings';
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
  role: UserRole;
  created_at: string;
  updated_at: string;
}

const Settings: React.FC = () => {
  const { user, userProfile, updateUserDisplayName } = useAppContext();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showAdminConfirmPassword, setShowAdminConfirmPassword] = useState(false);
  const [adminList, setAdminList] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: userProfile?.admin_name || userProfile?.display_name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // New admin form state
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'admin' as UserRole,
  });

  // Edit user form state
  const [editUserForm, setEditUserForm] = useState({
    fullName: '',
    role: 'admin' as UserRole,
  });

  const userRoles: { label: string; value: UserRole; description: string }[] = [
    { label: 'Administrator', value: 'admin', description: 'Full system access' },
    { label: 'Recruiter', value: 'recruiter', description: 'Job and application management' },
    { label: 'HR Manager', value: 'hr', description: 'People and visit management' },
    { label: 'Trainer', value: 'trainer', description: 'Training content management' },
    { label: 'Content Manager', value: 'content_manager', description: 'Content and media management' },
    { label: 'User', value: 'user', description: 'Basic user access' },
  ];

  const canManageUsers = hasPermission(userProfile?.role as UserRole, 'canManageUsers');

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
        .select('id, email, admin_name, display_name, role, created_at, updated_at')
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
      // Cast the role field to UserRole to fix TypeScript error
      const typedUsers = (data || []).map(user => ({
        ...user,
        role: user.role as UserRole
      }));
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

  const handleProfileInputChange = (field: string, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNewAdminInputChange = (field: string, value: string) => {
    setNewAdminForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEditUserInputChange = (field: string, value: string) => {
    setEditUserForm(prev => ({ ...prev, [field]: value }));
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.email) {
      toast({
        title: "Missing Email",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({ 
          admin_name: profileForm.fullName,
          display_name: profileForm.fullName
        })
        .eq('id', user?.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Update display name in context
      if (profileForm.fullName !== userProfile?.display_name) {
        updateUserDisplayName(profileForm.fullName);
      }

      setIsEditProfileOpen(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.currentPassword || !profileForm.newPassword || !profileForm.confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (profileForm.newPassword !== profileForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match",
        variant: "destructive",
      });
      return;
    }

    if (profileForm.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: profileForm.newPassword
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setProfileForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      setIsChangePasswordOpen(false);
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
      console.log('Creating new user via regular signup:', newAdminForm.email, newAdminForm.role);
      
      // Use regular signup but with auto-confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdminForm.email,
        password: newAdminForm.password,
        options: {
          data: {
            display_name: newAdminForm.fullName,
            admin_name: newAdminForm.fullName,
            role: newAdminForm.role
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

      console.log('Auth data:', authData);

      // Update profile with role and name if user was created
      if (authData.user) {
        console.log('Updating profile for user:', authData.user.id);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: newAdminForm.role,
            admin_name: newAdminForm.fullName,
            display_name: newAdminForm.fullName
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        } else {
          console.log('Profile updated successfully');
        }
      }

      setNewAdminForm({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'admin',
      });

      // Refresh user list
      await fetchAllUsers();

      toast({
        title: "User Added",
        description: `New ${newAdminForm.role} ${newAdminForm.fullName} (${newAdminForm.email}) has been added successfully. They will need to check their email to confirm their account.`,
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

      setEditingUser(null);
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

  const removeUser = async (userId: string, userEmail: string) => {
    // Prevent removing the currently logged-in user
    if (userId === user?.id) {
      toast({
        title: "Cannot Remove",
        description: "Cannot remove your own account",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to remove user ${userEmail}?`)) {
      setIsLoading(true);
      
      try {
        // Update the profile role to 'user' instead of deleting
        const { error } = await supabase
          .from('profiles')
          .update({ role: 'user' })
          .eq('id', userId);

        if (error) {
          console.error('Error removing user:', error);
          toast({
            title: "Error",
            description: "Failed to remove user",
            variant: "destructive",
          });
          return;
        }

        // Refresh user list
        await fetchAllUsers();

        toast({
          title: "User Removed",
          description: `User ${userEmail} has been removed`,
        });
      } catch (error) {
        console.error('Error removing user:', error);
        toast({
          title: "Error",
          description: "Failed to remove user",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const startEditUser = (userToEdit: AdminUser) => {
    setEditingUser(userToEdit);
    setEditUserForm({
      fullName: userToEdit.admin_name || userToEdit.display_name || '',
      role: userToEdit.role,
    });
  };

  const getRoleBadgeVariant = (role: UserRole): "default" | "secondary" | "destructive" => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'recruiter':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const filteredUsers = adminList.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.admin_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.display_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleProfilePictureUpload = () => {
    // TODO: Implement profile picture upload functionality
    toast({
      title: "Coming Soon",
      description: "Profile picture upload will be available soon",
    });
  };

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Profile & Security</span>
          </TabsTrigger>
          <TabsTrigger value="calendly" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Calendly</span>
          </TabsTrigger>
          {canManageUsers && (
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>User Management</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Card with Two-Column Layout */}
          <div className="flex justify-center">
            <Card className="w-full max-w-4xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Side - Profile Info in Gray Box */}
                <div className="md:col-span-1">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    {/* Role Badge - Top Right of Gray Box */}
                    <div className="flex justify-end mb-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRoleBadgeVariant(userProfile?.role as UserRole)} className="text-sm px-3 py-1">
                          {userRoles.find(r => r.value === userProfile?.role)?.label || 'Unknown'}
                        </Badge>
                        {userProfile?.role === 'admin' && <Crown className="w-5 h-5 text-yellow-500" />}
                      </div>
                    </div>

                    {/* Profile Picture and Name - Centered in Gray Box */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                            {(userProfile?.admin_name || userProfile?.display_name || user?.email || '')
                              .split(' ')
                              .map(name => name[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          onClick={handleProfilePictureUpload}
                          size="sm"
                          variant="secondary"
                          className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0"
                        >
                          <Camera className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900">
                          {userProfile?.admin_name || userProfile?.display_name || 'Not set'}
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                          {userRoles.find(r => r.value === userProfile?.role)?.description || 'User'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - User Details */}
                <div className="md:col-span-2 space-y-6">
                  {/* User Information Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <Label className="text-sm text-gray-600">Email Address</Label>
                        <p className="font-medium text-gray-900">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <div>
                        <Label className="text-sm text-gray-600">Last Sign-in</Label>
                        <p className="font-medium text-gray-900">
                          {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <Label className="text-sm text-gray-600">Account Created</Label>
                        <p className="font-medium text-gray-900">
                          {new Date(user?.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <Label className="text-sm text-gray-600">Full Name</Label>
                        <p className="font-medium text-gray-900">
                          {userProfile?.admin_name || userProfile?.display_name || 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex-1 bg-primary hover:bg-primary/90 flex items-center justify-center space-x-2">
                          <Edit className="w-4 h-4" />
                          <span>Edit Profile Info</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Profile Information</DialogTitle>
                          <DialogDescription>
                            Update your profile details below.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={updateProfile} className="space-y-4">
                          <div>
                            <Label htmlFor="editFullName">Full Name</Label>
                            <Input
                              id="editFullName"
                              type="text"
                              value={profileForm.fullName}
                              onChange={(e) => handleProfileInputChange('fullName', e.target.value)}
                              className="mt-1"
                              placeholder="Enter your full name"
                              disabled={isLoading}
                            />
                          </div>

                          <div className="flex space-x-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsEditProfileOpen(false)}
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
                              {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 flex items-center justify-center space-x-2">
                          <Lock className="w-4 h-4" />
                          <span>Change Password</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                          <DialogDescription>
                            Enter your current password and choose a new one.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={changePassword} className="space-y-4">
                          <div>
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <div className="relative mt-1">
                              <Input
                                id="currentPassword"
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={profileForm.currentPassword}
                                onChange={(e) => handleProfileInputChange('currentPassword', e.target.value)}
                                className="pr-10"
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative mt-1">
                              <Input
                                id="newPassword"
                                type={showNewPassword ? 'text' : 'password'}
                                value={profileForm.newPassword}
                                onChange={(e) => handleProfileInputChange('newPassword', e.target.value)}
                                className="pr-10"
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Password must be at least 8 characters long
                            </p>
                          </div>

                          <div>
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative mt-1">
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={profileForm.confirmPassword}
                                onChange={(e) => handleProfileInputChange('confirmPassword', e.target.value)}
                                className="pr-10"
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex space-x-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsChangePasswordOpen(false)}
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
                              {isLoading ? 'Changing...' : 'Change Password'}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendly" className="space-y-6">
          <CalendlySettings />
        </TabsContent>

        {canManageUsers && (
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add New User */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-primary" />
                  Add New User
                </h3>
                
                <form onSubmit={addNewUser} className="space-y-4">
                  <div>
                    <Label htmlFor="newUserRole">Role *</Label>
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
                              {role.value === 'admin' && <Crown className="w-4 h-4 text-yellow-500 ml-2" />}
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
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={newAdminForm.fullName}
                      onChange={(e) => handleNewAdminInputChange('fullName', e.target.value)}
                      className="mt-1"
                      placeholder="Enter user's full name"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="newUserEmail">Email Address *</Label>
                    <Input
                      id="newUserEmail"
                      type="email"
                      value={newAdminForm.email}
                      onChange={(e) => handleNewAdminInputChange('email', e.target.value)}
                      className="mt-1"
                      placeholder="user@hospicecare.com"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="newUserPassword">Password *</Label>
                    <div className="relative mt-1">
                      <Input
                        id="newUserPassword"
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
                    <Label htmlFor="newUserConfirmPassword">Confirm Password *</Label>
                    <div className="relative mt-1">
                      <Input
                        id="newUserConfirmPassword"
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

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isLoading ? 'Adding...' : 'Add User'}
                  </Button>
                </form>
              </Card>

              {/* Current Users */}
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
                            {userItem.role === 'admin' && <Crown className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <p className="text-sm text-gray-600">{userItem.email}</p>
                          <p className="text-xs text-gray-500">
                            Added {new Date(userItem.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {userItem.id !== user?.id && (
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
                                onClick={() => removeUser(userItem.id, userItem.email)}
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
            </div>

            {/* Edit User Modal */}
            {editingUser && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Edit className="w-5 h-5 mr-2 text-primary" />
                  Edit User: {editingUser.email}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editFullName">Full Name</Label>
                    <Input
                      id="editFullName"
                      type="text"
                      value={editUserForm.fullName}
                      onChange={(e) => handleEditUserInputChange('fullName', e.target.value)}
                      className="mt-1"
                      placeholder="Enter full name"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="editUserRole">Role</Label>
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
                              {role.value === 'admin' && <Crown className="w-4 h-4 text-yellow-500 ml-2" />}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    onClick={() => setEditingUser(null)}
                    variant="outline"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateUser}
                    className="bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update User'}
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Settings;
