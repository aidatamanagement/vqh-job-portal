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
import { useProfileImage } from '@/hooks/useProfileImage';
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
  role: UserRole;
  created_at: string;
  updated_at: string;
}

const Settings: React.FC = () => {
  const { user, userProfile, updateUserDisplayName, locations } = useAppContext();
  const { uploadProfileImage, deleteProfileImage, isUploading } = useProfileImage();
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
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'add' | 'edit'>('add');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: user?.email || '',
    location: 'none',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Update profile form when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfileForm(prev => ({
        ...prev,
        fullName: userProfile.admin_name || userProfile.display_name || '',
        location: userProfile.location || 'none',
      }));
    }
  }, [userProfile]);

  // New admin form state
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    location: 'none',
    role: 'recruiter' as UserRole,
  });

  // Edit user form state
  const [editUserForm, setEditUserForm] = useState({
    fullName: '',
    location: '',
    role: 'recruiter' as UserRole,
  });

  const userRoles: { label: string; value: UserRole; description: string }[] = [
    { label: 'Administrator', value: 'admin', description: 'Full system access' },
    { label: 'Recruiter', value: 'recruiter', description: 'Job and application management' },
    { label: 'Manager', value: 'hr', description: 'People and visit management' },
    { label: 'Trainer', value: 'trainer', description: 'Training content management' },
    { label: 'Content Manager', value: 'content_manager', description: 'Content and media management' },
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
    // Convert "none" back to empty string for location field
    const actualValue = field === 'location' && value === 'none' ? '' : value;
    setProfileForm(prev => ({ ...prev, [field]: actualValue }));
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
          display_name: profileForm.fullName,
          location: profileForm.location
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
        console.error('Function error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to create user account",
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
      role: 'recruiter',
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
      case 'recruiter':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const filteredUsers = adminList.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.admin_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.display_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleProfilePictureUpload = () => {
    if (!user?.id) return;

    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.multiple = false;

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      console.log('Starting profile image upload...');
      const result = await uploadProfileImage(file, user.id);
      
      if (result.success) {
        // Fetch updated profile data to refresh the UI
        try {
          const { data: updatedProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (!error && updatedProfile) {
            // Update the context with new profile data
            console.log('Profile updated successfully:', updatedProfile);
            // Force a small delay to ensure storage URL is accessible
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        } catch (error) {
          console.error('Error fetching updated profile:', error);
        }
      }
    };

    input.click();
  };

  const handleDeleteProfileImage = async () => {
    if (!user?.id) return;

    console.log('Starting profile image deletion...');
    const result = await deleteProfileImage(user.id);
    
    if (result.success) {
      // Fetch updated profile data to refresh the UI
      try {
        const { data: updatedProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!error && updatedProfile) {
          console.log('Profile image deleted successfully:', updatedProfile);
          // Force a small delay to ensure changes are reflected
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      } catch (error) {
        console.error('Error fetching updated profile after deletion:', error);
      }
    }
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
                        {userProfile?.role === 'admin'}
                      </div>
                    </div>

                    {/* Profile Picture and Name - Centered in Gray Box */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={userProfile?.profile_image_url || ""} />
                          <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                            {(userProfile?.admin_name || userProfile?.display_name || user?.email || '')
                              .split(' ')
                              .map(name => name[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 flex space-x-1">
                          <Button
                            onClick={handleProfilePictureUpload}
                            size="sm"
                            variant="secondary"
                            className="rounded-full w-8 h-8 p-0"
                            disabled={isUploading}
                            title="Change profile picture"
                          >
                            <Camera className="w-3 h-3" />
                          </Button>
                          {userProfile?.profile_image_url && (
                            <Button
                              onClick={handleDeleteProfileImage}
                              size="sm"
                              variant="destructive"
                              className="rounded-full w-8 h-8 p-0"
                              disabled={isUploading}
                              title="Remove profile picture"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
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

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <Label className="text-sm text-gray-600">Location</Label>
                        <p className="font-medium text-gray-900">
                          {userProfile?.location || 'Not set'}
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

                          <div>
                            <Label htmlFor="editLocation">Location</Label>
                            <Select 
                              value={profileForm.location} 
                              onValueChange={(value) => handleProfileInputChange('location', value)}
                              disabled={isLoading}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select your location" />
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
                          {userItem.location && (
                            <p className="text-xs text-gray-500 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {userItem.location}
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
