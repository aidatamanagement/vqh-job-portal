import React from 'react';
import { Box, Users, Wrench } from 'lucide-react';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Box },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'projects', label: 'Projects', icon: Wrench },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm mx-6 mt-4">
      <div className="flex space-x-1 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-['Open_Sans'] text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#c2dcd8] text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
} 