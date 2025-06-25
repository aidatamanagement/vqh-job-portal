
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  User, 
  Lock, 
  Settings as SettingsIcon,
  Edit,
  Camera,
  Eye,
  EyeOff,
  Calendar,
  Mail,
  FileText,
  Crown
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@/types';

const Settings: React.FC = () => {
  const { user, userProfile, updateUserDisplayName } = useAppContext();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Edit profile form state
  const [editForm, setEditForm] = useState({
    adminName: userProfile?.admin_name || '',
    displayName: userProfile?.display_name || '',
    personalNotes: userProfile?.personal_notes || '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
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

  const getRoleDisplayName = (role: UserRole): string => {
    const roleMap = {
      'admin': 'Administrator',
      'recruiter': 'Recruiter',
      'hr': 'HR Manager',
      'trainer': 'Trainer',
      'content_manager': 'Content Manager',
      'user': 'User'
    };
    return roleMap[role] || 'Unknown';
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          display_name: editForm.displayName,
          admin_name: editForm.adminName,
          personal_notes: editForm.personalNotes
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

      // Update display name in context if changed
      if (editForm.displayName !== userProfile?.display_name) {
        updateUserDisplayName(editForm.displayName);
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
    
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match",
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
        newPassword: '',
        confirmPassword: '',
      });

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

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="flex items-center space-x-3 animate-fade-in-up">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900" style={{ fontSize: '1.3rem' }}>Profile Settings</h1>
          </div>
        </div>
      </div>

      {/* Centered Profile Card */}
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-8 animate-fade-in relative">
          {/* Role Badge - Top Right Corner */}
          <div className="absolute top-6 right-6 flex items-center space-x-2">
            <Badge variant={getRoleBadgeVariant(userProfile?.role as UserRole)} className="text-sm">
              {getRoleDisplayName(userProfile?.role as UserRole)}
            </Badge>
            {userProfile?.role === 'admin' && <Crown className="w-4 h-4 text-yellow-500" />}
          </div>

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userProfile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary text-white text-2xl">
                  {getInitials(userProfile?.display_name || userProfile?.admin_name)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            {/* Full Name */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {userProfile?.display_name || userProfile?.admin_name || 'User Name'}
            </h2>
          </div>

          {/* Profile Information Grid */}
          <div className="space-y-6 mb-8">
            {/* Email */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <Label className="text-sm text-gray-600">Email Address</Label>
                <p className="text-gray-900 font-medium">{user?.email}</p>
              </div>
            </div>

            {/* Last Sign-in */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <Label className="text-sm text-gray-600">Last Sign-in</Label>
                <p className="text-gray-900 font-medium">
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Never'}
                </p>
              </div>
            </div>

            {/* Account Creation */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <Label className="text-sm text-gray-600">Account Created</Label>
                <p className="text-gray-900 font-medium">
                  {new Date(user?.created_at || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Personal Notes */}
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-500 mt-1" />
              <div className="flex-1">
                <Label className="text-sm text-gray-600">Personal Notes</Label>
                <p className="text-gray-900 font-medium">
                  {userProfile?.personal_notes || 'No personal notes added yet.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Edit Profile Info Button */}
            <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-primary hover:bg-primary/90">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile Info
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Profile Information</DialogTitle>
                </DialogHeader>
                <form onSubmit={updateProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      value={editForm.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className="mt-1"
                      placeholder="Enter your display name"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="adminName">Full Name</Label>
                    <Input
                      id="adminName"
                      type="text"
                      value={editForm.adminName}
                      onChange={(e) => handleInputChange('adminName', e.target.value)}
                      className="mt-1"
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="personalNotes">Personal Notes</Label>
                    <Input
                      id="personalNotes"
                      type="text"
                      value={editForm.personalNotes}
                      onChange={(e) => handleInputChange('personalNotes', e.target.value)}
                      className="mt-1"
                      placeholder="Add personal notes (optional)"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => setIsEditProfileOpen(false)}
                      variant="outline"
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

            {/* Change Password Button */}
            <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={changePassword} className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                        className="pr-10"
                        placeholder="Minimum 8 characters"
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
                        placeholder="Confirm your new password"
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
                      onClick={() => setIsChangePasswordOpen(false)}
                      variant="outline"
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
        </Card>
      </div>
    </div>
  );
};

export default Settings;
