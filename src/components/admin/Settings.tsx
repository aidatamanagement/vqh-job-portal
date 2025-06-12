import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Lock, 
  Settings as SettingsIcon,
  Shield,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

const Settings: React.FC = () => {
  const { user, updateUserDisplayName } = useAppContext();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || '',
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
  });

  // Mock admin list
  const [adminList] = useState([
    { id: '1', email: 'admin@hospicecare.com', role: 'Super Admin', createdAt: '2024-01-01' },
    { id: '2', email: 'manager@hospicecare.com', role: 'Admin', createdAt: '2024-01-15' },
  ]);

  const handleProfileInputChange = (field: string, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNewAdminInputChange = (field: string, value: string) => {
    setNewAdminForm(prev => ({ ...prev, [field]: value }));
  };

  const updateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.email) {
      toast({
        title: "Missing Email",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Update display name if changed
    if (profileForm.displayName !== user?.displayName) {
      updateUserDisplayName(profileForm.displayName);
    }

    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated",
    });
  };

  const changePassword = (e: React.FormEvent) => {
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

    setProfileForm(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));

    toast({
      title: "Password Changed",
      description: "Your password has been successfully updated",
    });
  };

  const addNewAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminForm.email || !newAdminForm.password || !newAdminForm.confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields",
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

    if (adminList.find(admin => admin.email === newAdminForm.email)) {
      toast({
        title: "Email Already Exists",
        description: "An admin with this email already exists",
        variant: "destructive",
      });
      return;
    }

    setNewAdminForm({
      email: '',
      password: '',
      confirmPassword: '',
    });

    toast({
      title: "Admin Added",
      description: `New admin ${newAdminForm.email} has been added successfully`,
    });
  };

  const removeAdmin = (adminId: string, adminEmail: string) => {
    if (adminId === '1') {
      toast({
        title: "Cannot Remove",
        description: "Cannot remove the super admin account",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to remove admin ${adminEmail}?`)) {
      toast({
        title: "Admin Removed",
        description: `Admin ${adminEmail} has been removed`,
      });
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
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and system settings</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Profile & Security</span>
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Admin Management</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Profile Information
              </h3>
              
              <form onSubmit={updateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={profileForm.displayName}
                    onChange={(e) => handleProfileInputChange('displayName', e.target.value)}
                    className="mt-1"
                    placeholder="Enter your display name"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This name will be shown in the admin header
                  </p>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => handleProfileInputChange('email', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-600">Role</Label>
                  <p className="text-sm text-gray-900 font-medium mt-1">Super Admin</p>
                </div>
                
                <div>
                  <Label className="text-gray-600">Account Created</Label>
                  <p className="text-sm text-gray-900 font-medium mt-1">
                    {new Date(user?.createdAt || '').toLocaleDateString()}
                  </p>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Update Profile
                </Button>
              </form>
            </Card>

            {/* Change Password */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-primary" />
                Change Password
              </h3>
              
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

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Change Password
                </Button>
              </form>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="admins" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add New Admin */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-primary" />
                Add New Admin
              </h3>
              
              <form onSubmit={addNewAdmin} className="space-y-4">
                <div>
                  <Label htmlFor="newAdminEmail">Email Address</Label>
                  <Input
                    id="newAdminEmail"
                    type="email"
                    value={newAdminForm.email}
                    onChange={(e) => handleNewAdminInputChange('email', e.target.value)}
                    className="mt-1"
                    placeholder="new.admin@hospicecare.com"
                  />
                </div>

                <div>
                  <Label htmlFor="newAdminPassword">Password</Label>
                  <Input
                    id="newAdminPassword"
                    type="password"
                    value={newAdminForm.password}
                    onChange={(e) => handleNewAdminInputChange('password', e.target.value)}
                    className="mt-1"
                    placeholder="Minimum 8 characters"
                  />
                </div>

                <div>
                  <Label htmlFor="newAdminConfirmPassword">Confirm Password</Label>
                  <Input
                    id="newAdminConfirmPassword"
                    type="password"
                    value={newAdminForm.confirmPassword}
                    onChange={(e) => handleNewAdminInputChange('confirmPassword', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Admin
                </Button>
              </form>
            </Card>

            {/* Current Admins */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Current Admins
              </h3>
              
              <div className="space-y-3">
                {adminList.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{admin.email}</p>
                      <p className="text-sm text-gray-600">{admin.role}</p>
                      <p className="text-xs text-gray-500">
                        Added {new Date(admin.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {admin.id !== '1' && (
                      <Button
                        onClick={() => removeAdmin(admin.id, admin.email)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* System Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-900">Application Auto-Archive</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Automatically archive applications after a certain period
                  </p>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90" selected>90 days</option>
                    <option value="never">Never</option>
                  </select>
                </div>
                
                <div>
                  <Label className="text-gray-900">Email Notifications</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Send email notifications for new applications
                  </p>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="emailNotifications" defaultChecked className="rounded" />
                    <Label htmlFor="emailNotifications" className="text-sm">
                      Enable email notifications
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-900">Calendly Integration</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Calendly link sent to approved candidates
                  </p>
                  <Input
                    defaultValue="https://calendly.com/hospicecare"
                    placeholder="Enter your Calendly link"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-900">Max File Upload Size</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Maximum file size for document uploads
                  </p>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="5">5 MB</option>
                    <option value="10" selected>10 MB</option>
                    <option value="15">15 MB</option>
                    <option value="20">20 MB</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button className="bg-primary hover:bg-primary/90">
                Save System Settings
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
