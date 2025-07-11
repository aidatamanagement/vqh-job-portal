# ⚠️ IMPORTANT: Storage Policies Must Be Created Via Dashboard

## Why SQL Doesn't Work
The error `ERROR: 42501: must be owner of table objects` occurs because:
- Storage policies can only be created through the Supabase Dashboard
- The `storage.objects` table requires special permissions
- Regular SQL access is restricted for security reasons

## ✅ SOLUTION: Use Dashboard Only

### Step 1: Go to Storage Policies
1. Open your **Supabase Dashboard**
2. Click **Storage** in the left sidebar  
3. Click **Policies** tab
4. Find **storage.objects** table

### Step 2: Create Policy 1 - Upload Permission
Click **"New Policy"** and fill in:
- **Policy name**: `Users can upload their own profile images`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **USING expression**: (leave empty)
- **WITH CHECK expression**:
```
bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Step 3: Create Policy 2 - View Permission  
Click **"New Policy"** and fill in:
- **Policy name**: `Anyone can view profile images`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **USING expression**:
```
bucket_id = 'profile-images'
```
- **WITH CHECK expression**: (leave empty)

### Step 4: Create Policy 3 - Update Permission
Click **"New Policy"** and fill in:
- **Policy name**: `Users can update their own profile images`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**:
```
bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
```
- **WITH CHECK expression**:
```
bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Step 5: Create Policy 4 - Delete Permission
Click **"New Policy"** and fill in:
- **Policy name**: `Users can delete their own profile images`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**:
```
bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
```
- **WITH CHECK expression**: (leave empty)

## 🎯 What Each Policy Does
1. **Upload**: Users can upload files to their own folder (`{user-id}/filename`)
2. **View**: Anyone can view profile images (needed for displaying them)
3. **Update**: Users can update their own images
4. **Delete**: Users can delete their own images

## 🧪 Testing
After creating all 4 policies:
1. Use the **"🔍 Test Bucket Connection"** button in your app
2. Check browser console for test results
3. Try uploading a profile image

## ❌ Don't Use SQL
- ~~SQL CREATE POLICY statements~~ → **Won't work**
- ✅ Dashboard UI → **Only way that works**

The dashboard has special permissions that SQL Editor doesn't have for storage operations. 