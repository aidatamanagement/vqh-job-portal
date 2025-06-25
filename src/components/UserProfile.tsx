
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Clock, 
  Calendar,
  Edit,
  Lock,
  Camera,
  FileText
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import EditProfileModal from './profile/EditProfileModal';
import ChangePasswordModal from './profile/ChangePasswordModal';

const UserProfile: React.FC = () => {
  const { user, userProfile } = useAppContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'recruiter':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const displayName = userProfile?.display_name || userProfile?.admin_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 shadow-lg">
          {/* Header with Role Badge */}
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <Badge variant={getRoleBadgeVariant(userProfile?.role)} className="text-xs">
              {userProfile?.role?.charAt(0).toUpperCase() + userProfile?.role?.slice(1) || 'User'}
            </Badge>
          </div>

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={profileImage || undefined} alt="Profile" />
                <AvatarFallback className="text-lg font-semibold bg-primary text-white">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {displayName}
            </h2>
          </div>

          {/* Profile Information */}
          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>

              {/* Last Sign-in */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Last Sign-in</p>
                  <p className="font-medium text-gray-900">
                    {user?.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                  </p>
                </div>
              </div>

              {/* Account Created */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Account Created</p>
                  <p className="font-medium text-gray-900">
                    {user?.created_at ? formatDate(user.created_at) : 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Full Name */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">
                    {userProfile?.admin_name || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Notes */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-2">Personal Notes</p>
                  <p className="text-gray-900">
                    {userProfile?.personal_notes || 'No personal notes added yet.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile Info
            </Button>
            
            <Button
              onClick={() => setIsPasswordModalOpen(true)}
              variant="outline"
              className="flex-1"
            >
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </div>
        </Card>

        {/* Modals */}
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
        
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default UserProfile;
