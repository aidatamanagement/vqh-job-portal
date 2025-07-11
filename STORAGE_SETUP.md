# Profile Images Storage Setup

Since storage bucket creation requires admin privileges, you need to manually set up the storage bucket through the Supabase dashboard.

## Steps to Set Up Profile Images Storage

### 1. Open Supabase Dashboard
- Go to your Supabase project dashboard
- Navigate to **Storage** in the sidebar

### 2. Create the Bucket
- Click **"New bucket"**
- Set the following configuration:
  - **Name**: `profile-images`
  - **Public bucket**: ✅ **Enabled** (checked)
  - **File size limit**: `5 MB`
  - **Allowed MIME types**: 
    - `image/jpeg`
    - `image/png` 
    - `image/webp`

### 3. Set Up Storage Policies
After creating the bucket, you need to set up RLS policies:

1. Go to **Storage** → **Policies** in your Supabase dashboard
2. Create the following policies for the `profile-images` bucket:

#### Policy 1: Allow users to upload their own profile images
- **Policy name**: `Users can upload their own profile images`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**: 
```sql
bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 2: Allow anyone to view profile images
- **Policy name**: `Anyone can view profile images`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **Policy definition**:
```sql
bucket_id = 'profile-images'
```

#### Policy 3: Allow users to update their own profile images
- **Policy name**: `Users can update their own profile images`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 4: Allow users to delete their own profile images
- **Policy name**: `Users can delete their own profile images`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

### 4. Test the Setup
After completing the setup:

1. Run the database migrations:
   ```bash
   npx supabase db reset
   ```

2. In the admin panel, go to Settings and click **"🔧 Debug Profile Images"**

3. Check the browser console - you should see ✅ for all tests

4. Try uploading a profile image

## File Structure
Images will be stored with this structure:
```
profile-images/
├── {user-id-1}/
│   └── profile-{timestamp}.jpg
├── {user-id-2}/
│   └── profile-{timestamp}.png
└── ...
```

This structure ensures that:
- Each user can only access their own images
- Images are organized by user ID
- Old images are automatically cleaned up when new ones are uploaded

## Troubleshooting

If you see errors:
- **"Storage bucket not configured"**: The bucket doesn't exist or isn't named correctly
- **"Failed to upload image: Access denied"**: Check the RLS policies are set up correctly
- **"Profile access failed"**: Check the profiles table has the `profile_image_url` column

Run the debug function in the browser console to get detailed error information. 