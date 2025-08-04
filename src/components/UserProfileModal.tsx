import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  Edit, 
  Lock, 
  Crown,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

import { testProfileImageConnection } from '@/utils/testProfileImageConnection';
import { UserRole } from '@/types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, userProfile, updateUserDisplayName, locations } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    location: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const userRoles: { label: string; value: UserRole; description: string }[] = [
    { label: 'Administrator', value: 'admin', description: 'Full system access' },
    { label: 'Branch Manager', value: 'branch_manager', description: 'Job and application management' },
    { label: 'Manager', value: 'hr', description: 'People and visit management' },
    { label: 'Trainer', value: 'trainer', description: 'Training content management' },
    { label: 'Content Manager', value: 'content_manager', description: 'Content and media management' },
  ];

  // Initialize form data when modal opens or userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        fullName: userProfile.admin_name || userProfile.display_name || '',
        location: userProfile.location || 'none',
      });
    }
  }, [userProfile, isOpen]);

  const handleProfileInputChange = (field: string, value: string) => {
    // Convert "none" back to empty string for location field
    const actualValue = field === 'location' && value === 'none' ? '' : value;
    setProfileForm(prev => ({ ...prev, [field]: actualValue }));
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const updateProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          admin_name: profileForm.fullName,
          display_name: profileForm.fullName,
          location: profileForm.location
        })
        .eq('id', user.id);

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

      setIsEditing(false);
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

  const changePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
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
        password: passwordForm.newPassword
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

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

  const getCurrentUserRole = () => {
    return userRoles.find(r => r.value === userProfile?.role) || { label: 'Unknown', description: 'User' };
  };

  const resetForms = () => {
    setActiveTab('profile');
    setIsEditing(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    // Reset profile form to original values
    if (userProfile) {
      setProfileForm({
        fullName: userProfile.admin_name || userProfile.display_name || '',
        location: userProfile.location || 'none',
      });
    }
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  if (!user || !userProfile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold">My Profile</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile & Info</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
            <TabsContent value="profile" className="space-y-6 mt-0">
              <Card className="p-6">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={userProfile.profile_image_url || ""} />
                        <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                          {(userProfile.admin_name || userProfile.display_name || user.email || '')
                            .split(' ')
                            .map(name => name[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                    </div>

                    {/* Role Badge */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRoleBadgeVariant(userProfile.role as UserRole)} className="text-sm px-3 py-1">
                          {getCurrentUserRole().label}
                        </Badge>
                        {userProfile.role === 'admin'}
                      </div>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {userProfile.admin_name || userProfile.display_name || 'Not set'}
                      </h2>
                      <Button
                        onClick={() => setIsEditing(!isEditing)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                      </Button>
                    </div>
                    <p className="text-gray-600">{getCurrentUserRole().description}</p>
                  </div>
                </div>

                {/* Profile Details */}
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={profileForm.fullName}
                          onChange={(e) => handleProfileInputChange('fullName', e.target.value)}
                          className="mt-1"
                          placeholder="Enter your full name"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
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
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={updateProfile}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <Label className="text-sm text-gray-600">Email Address</Label>
                        <p className="font-medium text-gray-900">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Shield className="w-5 h-5 text-gray-500" />
                      <div>
                        <Label className="text-sm text-gray-600">Role</Label>
                        <p className="font-medium text-gray-900">{getCurrentUserRole().label}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <Label className="text-sm text-gray-600">Full Name</Label>
                        <p className="font-medium text-gray-900">
                          {userProfile.admin_name || userProfile.display_name || 'Not set'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <Label className="text-sm text-gray-600">Location</Label>
                        <p className="font-medium text-gray-900">
                          {userProfile.location || 'Not set'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <Label className="text-sm text-gray-600">Account Created</Label>
                        <p className="font-medium text-gray-900">
                          {new Date(user.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <div>
                        <Label className="text-sm text-gray-600">Last Sign-in</Label>
                        <p className="font-medium text-gray-900">
                          {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6 mt-0">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Lock className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold">Change Password</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
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
                          value={passwordForm.newPassword}
                          onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
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
                          value={passwordForm.confirmPassword}
                          onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
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

                    <div className="flex justify-end">
                      <Button
                        onClick={changePassword}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isLoading ? 'Changing...' : 'Change Password'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal; 