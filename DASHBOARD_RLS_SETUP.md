# Setting Up RLS Policies via Supabase Dashboard

If you prefer using the Supabase Dashboard instead of SQL, follow these steps:

## Step 1: Navigate to Storage Policies
1. Go to your **Supabase Dashboard**
2. Click **Storage** in the left sidebar
3. Click **Policies** tab
4. Look for the **storage.objects** table

## Step 2: Create Policy 1 - Upload Permission
Click **"New Policy"** and set:
- **Policy name**: `Users can upload their own profile images`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **USING expression**: (leave empty)
- **WITH CHECK expression**:
```sql
bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

## Step 3: Create Policy 2 - View Permission  
Click **"New Policy"** and set:
- **Policy name**: `Anyone can view profile images`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **USING expression**:
```sql
bucket_id = 'profile-images'
```
- **WITH CHECK expression**: (leave empty)

## Step 4: Create Policy 3 - Update Permission
Click **"New Policy"** and set:
- **Policy name**: `Users can update their own profile images`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
```
- **WITH CHECK expression**:
```sql
bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

## Step 5: Create Policy 4 - Delete Permission
Click **"New Policy"** and set:
- **Policy name**: `Users can delete their own profile images`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
```
- **WITH CHECK expression**: (leave empty)

## Important Notes:
- The file path structure is `{user-id}/filename.ext`
- The `(storage.foldername(name))[1]` extracts the user ID from the file path
- This ensures users can only access their own images
- Public read access allows profile images to be displayed to anyone

## Testing:
After creating all policies, use the **"🔍 Test Bucket Connection"** button in your app to verify everything works. 