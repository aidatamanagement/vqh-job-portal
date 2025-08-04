# Storage Bucket Policies Setup (Dashboard UI)

Since storage policies cannot be created via SQL in the dashboard due to permission restrictions, you need to set them up manually through the Supabase Dashboard UI.

## Step 1: Run the Dashboard-Safe Migration

First, run the dashboard-safe migration in your Supabase SQL Editor:

**File**: `supabase/migrations/20250103000016_fix_profile_rls_dashboard_safe.sql`

This will fix the profiles table RLS policies.

## Step 2: Create Storage Bucket (if not exists)

1. Go to **Storage** in your Supabase Dashboard
2. If you don't see a `profile-images` bucket:
   - Click **"New bucket"**
   - Name: `profile-images`
   - **Uncheck** "Public bucket" (we'll handle permissions with policies)
   - File size limit: `5242880` (5MB)
   - Allowed MIME types: `image/jpeg, image/png, image/gif, image/webp`
   - Click **"Save"**

## Step 3: Create Storage Policies

Navigate to **Storage** → **Policies** → **profile-images bucket**

### Policy 1: Public View Access
- **Policy Name**: `Profile images public view`
- **Allowed Operation**: `SELECT`
- **Target Roles**: `public`
- **Policy Definition**:
```sql
bucket_id = 'profile-images'
```

### Policy 2: User Upload Access  
- **Policy Name**: `Profile images user upload`
- **Allowed Operation**: `INSERT`
- **Target Roles**: `authenticated`
- **Policy Definition**:
```sql
bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 3: User Update Access
- **Policy Name**: `Profile images user update`  
- **Allowed Operation**: `UPDATE`
- **Target Roles**: `authenticated`
- **USING Expression**:
```sql
bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
```
- **WITH CHECK Expression**:
```sql
bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 4: User Delete Access
- **Policy Name**: `Profile images user delete`
- **Allowed Operation**: `DELETE`  
- **Target Roles**: `authenticated`
- **Policy Definition**:
```sql
bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 5: Admin Full Access
- **Policy Name**: `Profile images admin manage`
- **Allowed Operation**: `ALL`
- **Target Roles**: `authenticated`
- **USING Expression**:
```sql
bucket_id = 'profile-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
```
- **WITH CHECK Expression**:
```sql
bucket_id = 'profile-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
```

## Step 4: Alternative - Use Supabase CLI (Recommended)

If you have the Supabase CLI installed, you can run the complete migration:

```bash
cd /workspace
supabase db push
```

This will apply the original comprehensive migration with storage policies.

## Step 5: Test the Setup

After setting up both parts:

1. Try uploading a profile image
2. Check the browser console for any remaining errors
3. Verify images are stored in the correct folder structure: `{user-id}/profile-{timestamp}.{ext}`

## Troubleshooting

If you still get RLS errors after setup:

1. **Check Policy Order**: Sometimes the order of policies matters
2. **Verify User Authentication**: Ensure you're logged in as an authenticated user
3. **Check User ID**: Verify the user ID matches the folder structure
4. **Test Admin Access**: If you're an admin, test both regular user and admin functionality

## Quick CLI Setup (Alternative)

If you prefer using the CLI instead of manual setup:

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref YOUR_PROJECT_REF`
4. Apply migration: `supabase db push`

The CLI method will handle both profile table and storage policies automatically.