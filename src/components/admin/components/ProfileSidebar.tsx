import React from 'react';
import { User, Bell, Key, Settings } from 'lucide-react';

interface ProfileSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function ProfileSidebar({ activeSection, onSectionChange }: ProfileSidebarProps) {
  const sections = [
    { id: 'edit-profile', label: 'Edit Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'change-password', label: 'Change Password', icon: Key },
    { id: 'platform-settings', label: 'Platform Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white rounded-lg shadow-sm p-4">
      <nav className="space-y-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-['Open_Sans'] text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-green-100 text-black shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
              <span>{section.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
} 