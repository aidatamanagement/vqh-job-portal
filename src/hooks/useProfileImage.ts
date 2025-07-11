import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useProfileImage = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadProfileImage = async (file: File, userId: string) => {
    setIsUploading(true);

    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, or WebP)');
      }

      // Validate file size (5MB max)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeInBytes) {
        throw new Error('Image size must be less than 5MB');
      }

      // Generate unique filename with user ID as folder
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const fileName = `profile-${Date.now()}.${fileExtension}`;
      const filePath = `${userId}/${fileName}`;

      console.log(`Uploading profile image: ${filePath}`);

      // Bucket exists - proceeding with upload
      console.log('Using existing profile-images bucket for upload...');

      // Delete existing profile image if it exists
      console.log('Checking for existing profile image...');
      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('profile_image_url')
          .eq('id', userId)
          .single();

        if (existingProfile?.profile_image_url) {
          console.log('Found existing profile image, attempting to delete:', existingProfile.profile_image_url);
          // Extract filename from URL
          const existingFileName = existingProfile.profile_image_url.split('/').pop();
          if (existingFileName) {
            const existingPath = `${userId}/${existingFileName}`;
            const { error: deleteError } = await supabase.storage
              .from('profile-images')
              .remove([existingPath]);
            
            if (deleteError) {
              console.warn('Warning: Could not delete existing image:', deleteError);
              // Don't throw error - continue with upload
            } else {
              console.log('✅ Deleted existing profile image successfully');
            }
          }
        } else {
          console.log('No existing profile image found');
        }
      } catch (profileError) {
        console.warn('Warning: Could not check for existing profile image:', profileError);
        // Don't throw error - continue with upload
      }

      // Upload new image
      console.log('Starting file upload to storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      console.log('File uploaded to storage successfully:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);

      // Update profile with new image URL
      console.log('Updating profile with new image URL...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          profile_image_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      console.log('Profile updated successfully with new image URL');

      toast({
        title: "Profile Image Updated",
        description: "Your profile image has been successfully updated",
      });

      return { success: true, imageUrl: publicUrl };

    } catch (error) {
      console.error('Profile image upload error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile image';
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
    }
  };

  const deleteProfileImage = async (userId: string) => {
    setIsUploading(true);

    try {
      // Get current profile image URL
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('profile_image_url')
        .eq('id', userId)
        .single();

      if (fetchError) {
        throw new Error('Failed to fetch profile information');
      }

      if (!profile?.profile_image_url) {
        throw new Error('No profile image to delete');
      }

      // Extract filename from URL
      const fileName = profile.profile_image_url.split('/').pop();
      if (!fileName) {
        throw new Error('Invalid image URL');
      }

      const filePath = `${userId}/${fileName}`;

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('profile-images')
        .remove([filePath]);

      if (deleteError) {
        console.error('Storage deletion error:', deleteError);
        throw new Error(`Failed to delete image: ${deleteError.message}`);
      }

      // Update profile to remove image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          profile_image_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      toast({
        title: "Profile Image Removed",
        description: "Your profile image has been successfully removed",
      });

      return { success: true };

    } catch (error) {
      console.error('Profile image deletion error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete profile image';
      
      toast({
        title: "Deletion Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadProfileImage,
    deleteProfileImage,
    isUploading,
  };
}; 