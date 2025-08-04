# Profile Upload RLS Policy Fix

## Problem Summary

Profile image uploads were failing with "new row violates RLS policy" errors due to multiple conflicting migration files that created inconsistent Row Level Security (RLS) policies.

## Root Causes Identified

1. **Conflicting Migration Files**: Three different migrations (11, 12, and 14) created conflicting RLS policies
2. **Incomplete UPDATE Policy**: Migration 11 had a syntax error missing the `(auth.uid() = id) OR` condition on line 47
3. **Different Storage Policy Patterns**: Migration 12 used `LIKE auth.uid()::text || '/%'` while migration 14 used `(storage.foldername(name))[1]`
4. **Overwritten Profile Policies**: Migration 14 completely replaced crucial profile table policies from migration 11

## Solution

Created a comprehensive migration `20250103000015_fix_profile_upload_rls_final.sql` that:

✅ **Consolidates all conflicting policies**
✅ **Fixes the broken UPDATE policy syntax**
✅ **Uses consistent storage policy patterns**
✅ **Ensures both profiles table and storage bucket policies work together**
✅ **Maintains admin permissions and role escalation protection**

## How to Apply the Fix

### Option 1: Using Supabase CLI (Recommended)

```bash
# Navigate to your project directory
cd /workspace

# Apply the migration
supabase db push

# Or if you want to see what will be applied first:
supabase db diff
```

### Option 2: Manual Application via Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20250103000015_fix_profile_upload_rls_final.sql`
4. Paste and execute the SQL

### Option 3: Reset and Apply All Migrations

If you have persistent issues:

```bash
# Reset the database (WARNING: This will delete all data)
supabase db reset

# This will reapply all migrations in order, including the fix
```

## Verification Steps

After applying the migration, test the profile upload functionality:

1. **Test Authentication**: Ensure you're logged in
2. **Test Profile Update**: Try updating your profile information
3. **Test Image Upload**: Upload a profile image
4. **Check Console**: Look for success messages without RLS errors

### Debug Commands

If you still have issues, run these in your browser console:

```javascript
// Test storage connectivity (available in your utils)
import { testProfileImageConnection } from '@/utils/testProfileImageConnection';
await testProfileImageConnection();

// Debug storage setup
import { debugProfileImageStorage } from '@/utils/profileImageDebug';
await debugProfileImageStorage();
```

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

## Security Features Maintained

✅ **User Isolation**: Users can only access their own profile images
✅ **Admin Override**: Admins can manage all profiles and images
✅ **Role Protection**: Users cannot escalate their own roles
✅ **Public Display**: Profile images are viewable for UI display

## Migration File Details

- **File**: `supabase/migrations/20250103000015_fix_profile_upload_rls_final.sql`
- **Date**: 2025-01-03
- **Purpose**: Comprehensive fix for all profile upload RLS issues
- **Safe**: Uses `IF EXISTS` and `IF NOT EXISTS` clauses to prevent conflicts

The migration will work whether you have an existing setup or are starting fresh.