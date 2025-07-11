import { supabase } from '@/integrations/supabase/client';

export const testProfileImageConnection = async () => {
  console.log('🔍 Testing Profile Image Bucket Connectivity...');
  console.log('===============================================');
  
  try {
    // Test 1: Check authentication
    console.log('1️⃣ Testing authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return { success: false, error: 'Authentication required' };
    }
    
    console.log('✅ User authenticated:', user.email);
    console.log('📋 User ID:', user.id);

    // Test 2: List all buckets
    console.log('\n2️⃣ Checking available storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError);
      return { success: false, error: 'Cannot access storage' };
    }
    
    console.log('✅ Available buckets:', buckets?.map(b => b.name));
    
    // Test 3: Check if profile-images bucket exists
    console.log('\n3️⃣ Checking profile-images bucket...');
    const profileBucket = buckets?.find(b => b.name === 'profile-images');
    
    if (!profileBucket) {
      console.error('❌ profile-images bucket not found!');
      console.log('Available buckets:', buckets?.map(b => b.name));
      return { success: false, error: 'profile-images bucket not found' };
    }
    
    console.log('✅ profile-images bucket found:', profileBucket);

    // Test 4: Test upload permissions
    console.log('\n4️⃣ Testing upload permissions...');
    const testFile = new Blob(['test-content'], { type: 'text/plain' });
    const testPath = `${user.id}/connectivity-test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(testPath, testFile);
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
      console.log('🔧 This might be a permissions issue. Check your bucket policies.');
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }
    
    console.log('✅ Upload test successful:', uploadData);

    // Test 5: Test public URL generation
    console.log('\n5️⃣ Testing public URL generation...');
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(testPath);
    
    console.log('✅ Public URL generated:', publicUrl);

    // Test 6: Test file deletion
    console.log('\n6️⃣ Testing file deletion...');
    const { error: deleteError } = await supabase.storage
      .from('profile-images')
      .remove([testPath]);
    
    if (deleteError) {
      console.warn('⚠️ Delete test failed:', deleteError);
    } else {
      console.log('✅ Delete test successful');
    }

    // Test 7: Check profile table
    console.log('\n7️⃣ Testing profile table access...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, profile_image_url')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile access failed:', profileError);
      if (profileError.message?.includes('column "profile_image_url" does not exist')) {
        console.log('🔧 Need to add profile_image_url column to profiles table');
        return { success: false, error: 'Database schema needs update - profile_image_url column missing' };
      }
      return { success: false, error: `Profile access failed: ${profileError.message}` };
    }
    
    console.log('✅ Profile access successful:', profile);

    // Test 8: Test profile update
    console.log('\n8️⃣ Testing profile update...');
    const testImageUrl = `${publicUrl}?test=true`;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_image_url: testImageUrl })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('❌ Profile update failed:', updateError);
      return { success: false, error: `Profile update failed: ${updateError.message}` };
    }
    
    console.log('✅ Profile update successful');

    // Reset the test URL
    await supabase
      .from('profiles')
      .update({ profile_image_url: profile.profile_image_url })
      .eq('id', user.id);

    console.log('\n🎉 All connectivity tests passed!');
    console.log('✨ Profile image functionality should work correctly.');
    
    return { success: true };

  } catch (error) {
    console.error('💥 Connectivity test failed with error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Simple function to test just image upload
export const testImageUpload = async (file: File) => {
  console.log('🖼️ Testing actual image upload...');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `profile-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    console.log('📁 Upload path:', filePath);
    
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file);

    if (error) {
      console.error('❌ Upload failed:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Upload successful:', data);
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    console.log('🔗 Public URL:', publicUrl);

    return { success: true, url: publicUrl, path: filePath };
    
  } catch (error) {
    console.error('💥 Image upload test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}; 