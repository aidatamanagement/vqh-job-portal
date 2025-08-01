import React from 'react';
import { Search, Settings, Bell, Edit3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAppContext } from '@/contexts/AppContext';
import { useProfileImage } from '@/hooks/useProfileImage';

export function ProfileHeader() {
  const { userProfile } = useAppContext();
  const { uploadProfileImage, deleteProfileImage, isUploading } = useProfileImage();

  const handleProfilePictureUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && userProfile?.id) {
        await uploadProfileImage(file, userProfile.id);
      }
    };
    input.click();
  };

  return (
    <div className="relative">
      {/* Background Layer - Glassmorphic Banner */}
      <div className="relative w-full h-48 bg-gradient-to-br from-[#609a92] via-[#5a8f87] to-[#4a7a73] rounded-b-3xl overflow-hidden">
        {/* Diagonal Stripe Pattern Overlay */}
        <div className="absolute inset-0 opacity-15">
          <svg className="w-full h-full" viewBox="0 0 1200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diagonal" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="40" stroke="white" strokeWidth="1" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonal)"/>
          </svg>
        </div>
        
        {/* Glassmorphic Effect */}
        <div className="absolute inset-0 backdrop-blur-sm bg-white/5"></div>
        
        {/* Header Content */}
        <div className="relative z-10 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - User info */}
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-white font-bold text-lg font-['Open_Sans']">
                  Profile - {userProfile?.role === 'admin' ? 'Administrator' : 
                             userProfile?.role === 'recruiter' ? 'Recruiter' :
                             userProfile?.role === 'hr' ? 'Manager' :
                             userProfile?.role === 'trainer' ? 'Trainer' :
                             userProfile?.role === 'content_manager' ? 'Content Manager' : 'User'}
                </h1>
                <p className="text-white/90 text-sm font-['Open_Sans']">
                  {userProfile?.role === 'admin' ? 'Full System Access' :
                   userProfile?.role === 'recruiter' ? 'Job and Application Management' :
                   userProfile?.role === 'hr' ? 'People and Visit Management' :
                   userProfile?.role === 'trainer' ? 'Training Content Management' :
                   userProfile?.role === 'content_manager' ? 'Content and Media Management' : 'User Access'}
                </p>
              </div>
            </div>

            {/* Right side - Search and icons */}
            <div className="flex items-center gap-x-4">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search"
                  className="pl-10 bg-white/90 border-0 text-gray-700 font-['Open_Sans'] w-64 backdrop-blur-sm"
                />
              </div>

              {/* Icons */}
              <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Foreground Card - Compact Profile Card */}
      <div className="absolute left-6 right-6 -bottom-12 z-20">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-4">
          <div className="flex items-center space-x-4">
            {/* Profile Picture - Square with small edit icon */}
            <div className="relative">
              <div className="w-16 h-16 rounded-md bg-red-500 flex items-center justify-center text-white font-semibold text-lg shadow-md overflow-hidden">
                {userProfile?.profile_image_url ? (
                  <img 
                    src={userProfile.profile_image_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {(userProfile?.admin_name || userProfile?.display_name || userProfile?.email || '')
                      .split(' ')
                      .map(name => name[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                )}
              </div>
              <button
                onClick={handleProfilePictureUpload}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                disabled={isUploading}
                title="Edit profile picture"
              >
                <Edit3 className="w-3 h-3 text-gray-600" />
              </button>
            </div>

            {/* User Info - Compact and left-aligned */}
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 font-['Open_Sans'] leading-tight">
                {userProfile?.admin_name || userProfile?.display_name || 'Not set'}
              </h2>
              <p className="text-sm text-gray-600 font-['Open_Sans'] leading-tight">
                {userProfile?.email || 'No email'}
              </p>
            </div>

            {/* Navigation Tabs - Compact and horizontal */}
            <div className="flex space-x-2">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'teams', label: 'Teams' },
                { id: 'projects', label: 'Projects' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className="px-3 py-1.5 rounded-lg font-['Open_Sans'] text-sm font-medium transition-colors hover:bg-gray-100 text-gray-700"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 