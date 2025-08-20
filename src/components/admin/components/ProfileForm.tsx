import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProfileFormProps {
  userProfile: any;
  locations: any[];
}

export function ProfileForm({ userProfile, locations }: ProfileFormProps) {
  const { updateUserDisplayName } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    location: '',
  });

  // Initialize form data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        fullName: userProfile.admin_name || userProfile.display_name || '',
        email: userProfile.email || '',
        location: userProfile.location || '',
      });
    }
  }, [userProfile]);

  const handleInputChange = (field: string, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          admin_name: profileForm.fullName,
          display_name: profileForm.fullName,
          location: profileForm.location
        })
        .eq('id', userProfile.id);

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

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 font-['Open_Sans']">
        Edit Profile Information
      </h2>
      
      <form onSubmit={updateProfile} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 font-['Open_Sans'] mb-2 block">
              Full Name
            </Label>
            <Input
              id="fullName"
              value={profileForm.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="font-['Open_Sans'] bg-white shadow-sm border-gray-300 focus:border-[#005188] focus:ring-[#005188] focus:ring-opacity-20"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 font-['Open_Sans'] mb-2 block">
              Email
            </Label>
            <Input
              id="email"
              value={profileForm.email}
              disabled
              className="font-['Open_Sans'] bg-gray-50 border-gray-300"
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-sm font-medium text-gray-700 font-['Open_Sans'] mb-2 block">
              Location
            </Label>
            <Select value={profileForm.location} onValueChange={(value) => handleInputChange('location', value)}>
              <SelectTrigger className="font-['Open_Sans'] bg-white shadow-sm border-gray-300 focus:border-[#005188] focus:ring-[#005188] focus:ring-opacity-20">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.name}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#005188] hover:bg-[#004070] text-white font-['Open_Sans'] font-medium px-6 py-2"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
} 