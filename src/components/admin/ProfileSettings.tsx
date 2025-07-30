import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Camera, X, Crown, Mail, Clock, Calendar, MapPin, Lock, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@/types';
import { useProfileImage } from '@/hooks/useProfileImage';

const ProfileSettings: React.FC = () => {
  const { user, userProfile, updateUserDisplayName, locations } = useAppContext();
  const { uploadProfileImage, deleteProfileImage, isUploading } = useProfileImage();
  const [isLoading, setIsLoading] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    location: '',
  });

  // Change password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const userRoles: { label: string; value: UserRole; description: string }[] = [
    { label: 'Administrator', value: 'admin', description: 'Full system access' },
    { label: 'Recruiter', value: 'recruiter', description: 'Job and application management' },
    { label: 'Manager', value: 'hr', description: 'People and visit management' },
    { label: 'Trainer', value: 'trainer', description: 'Training content management' },
    { label: 'Content Manager', value: 'content_manager', description: 'Content and media management' },
  ];

  // Initialize form data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        fullName: userProfile.admin_name || userProfile.display_name || '',
        location: userProfile.location || 'none',
      });
    }
  }, [userProfile]);

  const handleInputChange = (field: string, value: string) => {
    // Convert "none" back to empty string for location field
    const actualValue = field === 'location' && value === 'none' ? '' : value;
    setProfileForm(prev => ({ ...prev, [field]: actualValue }));
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // Password change functionality
  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const validatePassword = () => {
    if (!passwordForm.currentPassword) {
      toast({
        title: "Missing Current Password",
        description: "Please enter your current password",
        variant: "destructive",
      });
      return false;
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      toast({
        title: "Invalid New Password",
        description: "New password must be at least 8 characters long",
        variant: "destructive",
      });
      return false;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation password do not match",
        variant: "destructive",
      });
      return false;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast({
        title: "Same Password",
        description: "New password must be different from your current password",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validatePassword()) return;

    setIsPasswordLoading(true);
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

      // Clear form and close modal
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsPasswordModalOpen(false);

      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'text-red-600' };
    if (password.length < 10) return { strength: 2, label: 'Fair', color: 'text-yellow-600' };
    if (password.length < 12) return { strength: 3, label: 'Good', color: 'text-blue-600' };
    return { strength: 4, label: 'Strong', color: 'text-green-600' };
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
    if (!user?.id || !userProfile?.profile_image_url) return;

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
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
  
          <p className="text-sm text-gray-600">Manage your profile information and preferences</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="flex justify-center">
        <Card className="w-full max-w-4xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Side - Profile Info */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg">
                {/* Role Badge */}
                <div className="flex justify-end mb-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getRoleBadgeVariant(userProfile?.role as UserRole)} className="text-sm px-3 py-1">
                      {userRoles.find(r => r.value === userProfile?.role)?.label || 'Unknown'}
                    </Badge>
                    {userProfile?.role === 'admin'}
                  </div>
                </div>

                {/* Profile Picture and Name */}
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

            {/* Right Side - Profile Details and Form */}
            <div className="md:col-span-2 space-y-6">
              {/* User Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm text-gray-600 block">Email Address</Label>
                    <p className="font-medium text-gray-900 truncate">{user?.email}</p>
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
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <Label className="text-sm text-gray-600">Location</Label>
                    <p className="font-medium text-gray-900">
                      {userProfile?.location || 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Profile Form */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile Information</h3>
                <form onSubmit={updateProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="mt-1"
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Select 
                      value={profileForm.location || 'none'} 
                      onValueChange={(value) => handleInputChange('location', value)}
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

                  <div className="flex justify-between">
                    <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100">
                          <Lock className="w-4 h-4 mr-2" />
                          Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <Shield className="w-5 h-5 text-red-600" />
                            <span>Change Password</span>
                          </DialogTitle>
                        </DialogHeader>
                        
                        {/* Security Notice */}
                        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-3 mb-4">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-yellow-800 mb-1">Security Tips</h4>
                              <ul className="text-xs text-yellow-700 space-y-1">
                                <li>• Use at least 8 characters</li>
                                <li>• Include uppercase, lowercase, numbers, and symbols</li>
                                <li>• Don't reuse passwords from other accounts</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <form onSubmit={changePassword} className="space-y-4">
                          <div>
                            <Label htmlFor="modalCurrentPassword">Current Password</Label>
                            <div className="relative mt-1">
                              <Input
                                id="modalCurrentPassword"
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={passwordForm.currentPassword}
                                onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                                className="pr-10"
                                placeholder="Enter current password"
                                disabled={isPasswordLoading}
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
                            <Label htmlFor="modalNewPassword">New Password</Label>
                            <div className="relative mt-1">
                              <Input
                                id="modalNewPassword"
                                type={showNewPassword ? 'text' : 'password'}
                                value={passwordForm.newPassword}
                                onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                                className="pr-10"
                                placeholder="Enter new password"
                                disabled={isPasswordLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            
                            {passwordForm.newPassword && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Strength:</span>
                                  <span className={`text-xs font-medium ${getPasswordStrength(passwordForm.newPassword).color}`}>
                                    {getPasswordStrength(passwordForm.newPassword).label}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div 
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                      getPasswordStrength(passwordForm.newPassword).strength === 1 ? 'bg-red-500 w-1/4' :
                                      getPasswordStrength(passwordForm.newPassword).strength === 2 ? 'bg-yellow-500 w-2/4' :
                                      getPasswordStrength(passwordForm.newPassword).strength === 3 ? 'bg-blue-500 w-3/4' :
                                      getPasswordStrength(passwordForm.newPassword).strength === 4 ? 'bg-green-500 w-full' : 'w-0'
                                    }`}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="modalConfirmPassword">Confirm New Password</Label>
                            <div className="relative mt-1">
                              <Input
                                id="modalConfirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={passwordForm.confirmPassword}
                                onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                                className="pr-10"
                                placeholder="Confirm new password"
                                disabled={isPasswordLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                              <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                            )}
                          </div>

                          <div className="flex justify-end space-x-2 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsPasswordModalOpen(false)}
                              disabled={isPasswordLoading}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              disabled={isPasswordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                            >
                              {isPasswordLoading ? 'Updating...' : 'Update Password'}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings; 