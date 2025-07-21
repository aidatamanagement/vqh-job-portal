# Location Fields Update - Job Posting Enhancement

## Overview
Updated the VQH Job Portal to have separate **Office Location** and **Work Location** fields instead of a single location field. This provides better clarity between:
- **Office Location**: Where the company office/branch is located
- **Work Location**: Where the actual work will be performed (e.g., Remote, On-site, Hybrid, etc.)

## Database Changes

### Migration: `20250103000003_update_job_location_fields.sql`
- Renamed existing `location` column to `office_location`
- Added new `work_location` column 
- Added descriptive comments for both fields
- Updated existing data to maintain consistency

## TypeScript Interface Updates

### `src/types/index.ts`
- Updated `Job` interface:
  - Changed `location: string` to `officeLocation: string` and `workLocation: string`

### `src/integrations/supabase/types.ts`
- Updated jobs table types to include:
  - `office_location: string`
  - `work_location: string | null`
  - Kept old `location` field as nullable for backward compatibility

## Frontend Component Updates

### 1. **PostJob Component** (`src/components/admin/PostJob.tsx`)
- Updated job form state to include both `officeLocation` and `workLocation`
- Added new "Location Information" section with:
  - Office Location dropdown (linked to existing locations master data)
  - Work Location text input (free text for flexibility)
- Updated validation to require both location fields
- Updated HR manager filtering to use office location
- Updated document parsing to set both fields

### 2. **ManageJobs Component** (`src/components/admin/ManageJobs.tsx`)
- Updated location filtering to use office location
- Updated job form initialization for editing

### 3. **ManageJobCard Component** (`src/components/admin/ManageJobCard.tsx`)
- Updated location display to show both:
  - "Office: [office location]"
  - "Work: [work location]"

### 4. **EditJobModal Component** (`src/components/admin/EditJobModal.tsx`)
- Added separate fields for office location and work location
- Updated HR manager filtering to use office location
- Updated validation messages

### 5. **JobCard Component** (`src/components/JobCard.tsx`)
- Updated location display to show both office and work locations

### 6. **JobDetails Page** (`src/pages/JobDetails.tsx`)
- Updated header section to display both locations
- Updated sidebar information to show both locations

## Backend Updates

### `src/contexts/hooks/useAdminOperations.ts`
- Updated `createJob` function to use `office_location` and `work_location` fields
- Updated `updateJob` function to handle both location fields

### `src/contexts/hooks/useDataFetching.ts`
- Updated job data transformation to map database fields to interface:
  - `office_location` → `officeLocation`
  - `work_location` → `workLocation`
- Added fallback to old `location` field for backward compatibility

## User Experience Improvements

### Form Design
- Clear separation between office and work locations
- Helpful placeholder text and descriptions
- Office location linked to existing master data
- Work location as free text for maximum flexibility

### Display Consistency
- All job displays now show both locations clearly labeled
- Consistent formatting across all components
- Mobile-responsive design maintained

## Backward Compatibility
- Old `location` field maintained in database during transition
- Fallback logic in data fetching to handle existing data
- Graceful handling of missing work location data

## Validation Rules
- Both office location and work location are required for new jobs
- Office location must be selected from existing master data
- Work location can be any text (e.g., "Remote", "On-site", "Hybrid", "Field work")

## Benefits
1. **Clarity**: Clear distinction between company office and actual work location
2. **Flexibility**: Work location can specify remote work, hybrid arrangements, etc.
3. **Better Filtering**: HR managers can be filtered by office location
4. **Improved UX**: Users get more specific location information
5. **Data Quality**: More structured and meaningful location data

## Testing Status
- ✅ TypeScript compilation successful
- ✅ Build process completed without errors
- ✅ All component updates implemented
- ✅ Database migration ready for deployment

## Next Steps
1. Apply database migration in production environment
2. Test form submission and editing functionality
3. Verify HR manager filtering works correctly
4. Ensure existing job data displays properly with fallback logic