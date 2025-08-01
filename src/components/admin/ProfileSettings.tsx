import React, { useState } from 'react';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileSidebar } from './components/ProfileSidebar';
import { ProfileForm } from './components/ProfileForm';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ProfileSettings: React.FC = () => {
  const { userProfile, locations } = useAppContext();
  const [activeSection, setActiveSection] = useState('edit-profile');

  // Change password state
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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
    if (!validatePassword()) return;

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

      // Clear form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Glassmorphic Banner and Compact Profile Card */}
      <ProfileHeader />
      
      {/* Main Content with proper spacing for compact card */}
      <div className="flex space-x-6 mx-6 mt-16">
        {/* Left Sidebar */}
        <ProfileSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        {/* Main Content Area */}
        <div className="flex-1">
          {activeSection === 'edit-profile' && (
            <ProfileForm userProfile={userProfile} locations={locations} />
          )}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-['Open_Sans']">Notifications</h2>
              <p className="text-gray-600 font-['Open_Sans']">Notification settings coming soon...</p>
            </div>
          )}
          {activeSection === 'change-password' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 font-['Open_Sans']">Change Password</h2>
              
              {/* Security Notice */}
              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Security Tips</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Use at least 8 characters</li>
                      <li>• Include uppercase, lowercase, numbers, and symbols</li>
                      <li>• Don't reuse passwords from other accounts</li>
                    </ul>
                  </div>
                </div>
              </div>

              <form onSubmit={changePassword} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 font-['Open_Sans'] mb-2 block">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                        className="font-['Open_Sans'] bg-white shadow-sm border-gray-300 focus:border-[#005188] focus:ring-[#005188] focus:ring-opacity-20 pr-10"
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
                    <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 font-['Open_Sans'] mb-2 block">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                        className="font-['Open_Sans'] bg-white shadow-sm border-gray-300 focus:border-[#005188] focus:ring-[#005188] focus:ring-opacity-20 pr-10"
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
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 font-['Open_Sans'] mb-2 block">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                        className="font-['Open_Sans'] bg-white shadow-sm border-gray-300 focus:border-[#005188] focus:ring-[#005188] focus:ring-opacity-20 pr-10"
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
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isPasswordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="bg-[#005188] hover:bg-[#004070] text-white font-['Open_Sans'] font-medium px-6 py-2"
                  >
                    {isPasswordLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </div>
          )}
          {activeSection === 'platform-settings' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-['Open_Sans']">Platform Settings</h2>
              <p className="text-gray-600 font-['Open_Sans']">Platform settings coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings; 