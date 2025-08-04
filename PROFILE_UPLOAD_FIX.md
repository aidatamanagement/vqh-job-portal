# Profile Upload RLS Policy Fix

## Problem Summary

Profile image uploads were failing with "new row violates RLS policy" errors due to multiple conflicting migration files that created inconsistent Row Level Security (RLS) policies.

## Root Causes Identified

1. **Conflicting Migration Files**: Three different migrations (11, 12, and 14) created conflicting RLS policies
2. **Incomplete UPDATE Policy**: Migration 11 had a syntax error missing the `(auth.uid() = id) OR` condition on line 47
3. **Different Storage Policy Patterns**: Migration 12 used `LIKE auth.uid()::text || '/%'` while migration 14 used `(storage.foldername(name))[1]`
4. **Overwritten Profile Policies**: Migration 14 completely replaced crucial profile table policies from migration 11

## Permission Error Explanation

If you got `ERROR: 42501: must be owner of table objects` when running the migration in Supabase Dashboard:

**Why this happens**: The `storage.objects` table is managed by Supabase itself. Regular database users (even with elevated privileges) cannot modify RLS policies on it through the SQL editor. Only the Supabase CLI or Dashboard UI can manage storage policies.

## Solution Options

### ✅ Option 1: Dashboard + Manual Setup (Recommended for Dashboard Users)

1. **Run Dashboard-Safe Migration**: 
   - File: `supabase/migrations/20250103000016_fix_profile_rls_dashboard_safe.sql`
   - This fixes the profiles table policies only

2. **Set Storage Policies Manually**: 
   - Follow instructions in `STORAGE_POLICIES_DASHBOARD_SETUP.md`
   - Create 5 storage policies through the Dashboard UI

### ✅ Option 2: Supabase CLI (Recommended for CLI Users)

```bash
cd /workspace
# Install CLI if needed: npm install -g supabase
supabase db push
```

This applies the complete migration with both profile and storage policies.

## What Each Solution Does

### Dashboard-Safe Migration (`20250103000016_fix_profile_rls_dashboard_safe.sql`):
✅ **Fixes profiles table RLS policies**  
✅ **Adds missing `profile_image_url` column**  
✅ **Fixes the broken UPDATE policy syntax**  
✅ **Maintains admin permissions and security**  
❌ **Does NOT include storage policies** (must be set manually)

### Complete Migration (`20250103000015_fix_profile_upload_rls_final.sql`):
✅ **Everything from dashboard-safe version**  
✅ **Includes storage bucket policies**  
❌ **Only works with Supabase CLI** (not dashboard SQL editor)

## File Path Structure

The fix ensures images are stored with this structure:
```
profile-images/
  ├── {user-id-1}/
  │   └── profile-{timestamp}.{ext}
  ├── {user-id-2}/
  │   └── profile-{timestamp}.{ext}
  └── ...
```

## RLS Policies Created

### Profiles Table
- **SELECT**: Users can view their own profile + Admins can view all
- **UPDATE**: Users can update their own profile + Admins can update any
- **INSERT**: Users can create their own profile + Admins can create any
- **DELETE**: Only admins can delete profiles (not their own)

### Storage Objects (profile-images bucket)
- **SELECT**: Public can view all profile images
- **INSERT**: Users can upload to their own folder only
- **UPDATE**: Users can update their own images only
- **DELETE**: Users can delete their own images only
- **ALL (Admin)**: Admins can manage all profile images

## Quick Start Instructions

### If you got the permission error:

1. **Run the dashboard-safe migration**: Copy and paste `supabase/migrations/20250103000016_fix_profile_rls_dashboard_safe.sql` in your Supabase SQL Editor

2. **Set up storage policies**: Follow the step-by-step guide in `STORAGE_POLICIES_DASHBOARD_SETUP.md`

3. **Test**: Try uploading a profile image

### If you have Supabase CLI:

```bash
cd /workspace
supabase db push
```

## Verification Steps

After applying either solution:

1. **Test Authentication**: Ensure you're logged in
2. **Test Profile Update**: Try updating your profile information  
3. **Test Image Upload**: Upload a profile image
4. **Check Console**: Look for success messages without RLS errors

## Security Features Maintained

✅ **User Isolation**: Users can only access their own profile images  
✅ **Admin Override**: Admins can manage all profiles and images  
✅ **Role Protection**: Users cannot escalate their own roles  
✅ **Public Display**: Profile images are viewable for UI display  

The migration will work whether you have an existing setup or are starting fresh.