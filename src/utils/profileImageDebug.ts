import { supabase } from '@/integrations/supabase/client';

export const debugProfileImageStorage = async () => {
  console.log('=== Profile Image Storage Debug ===');
  
  try {
    // Test 1: Check if we can access storage
    console.log('1. Testing storage access...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Storage access failed:', bucketsError);
      return;
    }
    
    console.log('✅ Storage access successful. Buckets:', buckets?.map(b => b.name));
    
    // Test 2: Check profile-images bucket
    console.log('2. Checking profile-images bucket...');
    const profileBucket = buckets?.find(b => b.name === 'profile-images');
    
    if (!profileBucket) {
      console.error('❌ profile-images bucket does not exist!');
      console.log('📋 SETUP REQUIRED: You need to manually create the storage bucket.');
      console.log('📖 Please follow the instructions in STORAGE_SETUP.md');
      console.log('🔗 Or go to your Supabase dashboard → Storage → Create "profile-images" bucket');
      return;
    } else {
      console.log('✅ profile-images bucket exists:', profileBucket);
    }
    
    // Test 3: Check current user profile
    console.log('3. Testing profile access...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ User authentication failed:', userError);
      return;
    }
    
    console.log('✅ User authenticated:', user.email);
    
    // Test 4: Check profile data
    console.log('4. Testing profile data access...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile access failed:', profileError);
      return;
    }
    
    console.log('✅ Profile data:', profile);
    
    // Test 5: Check RLS policies
    console.log('5. Testing RLS policies...');
    const { data: testUpdate, error: updateError } = await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('❌ Profile update failed (RLS issue?):', updateError);
      return;
    }
    
    console.log('✅ Profile update test successful');
    
    // Test 6: Check storage permissions
    console.log('6. Testing storage permissions...');
    try {
      const testFile = new Blob(['test'], { type: 'text/plain' });
      const testPath = `${user.id}/test-file.txt`;
      
      const { error: uploadTestError } = await supabase.storage
        .from('profile-images')
        .upload(testPath, testFile);
      
      if (uploadTestError) {
        console.error('❌ Storage upload test failed:', uploadTestError);
        console.log('📋 This might be an RLS policy issue. Check STORAGE_SETUP.md for policy configuration.');
      } else {
        console.log('✅ Storage upload test successful');
        // Clean up test file
        await supabase.storage.from('profile-images').remove([testPath]);
        console.log('✅ Test file cleaned up');
      }
    } catch (storageError) {
      console.error('❌ Storage permission test failed:', storageError);
    }
    
    console.log('=== Debug Complete ===');
    console.log('If you see ✅ for all tests, the storage should work.');
    console.log('If you see ❌ for storage tests, follow STORAGE_SETUP.md instructions.');
    console.log('Try uploading an image now and watch for detailed logs.');
    
  } catch (error) {
    console.error('❌ Debug failed with error:', error);
  }
};

// Helper function to create a test file
export const createTestImageFile = (): File => {
  // Create a small test image (1x1 pixel PNG)
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 1, 1);
  }
  
  // Convert to blob then to file
  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'test-image.png', { type: 'image/png' });
        resolve(file);
      }
    }, 'image/png');
  }) as any; // Type assertion for simplicity
}; 