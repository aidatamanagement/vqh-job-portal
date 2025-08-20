
import { useState, useCallback, useRef, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Job, JobApplication, JobPosition, JobLocation, JobFacility } from '@/types';

export const useDataFetching = (user: User | null, userProfile: any | null) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [locations, setLocations] = useState<JobLocation[]>([]);
  const [facilities, setFacilities] = useState<JobFacility[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // Use refs for loading states to prevent infinite loops
  const isFetchingJobs = useRef(false);
  const isFetchingApplications = useRef(false);
  const isFetchingMasterData = useRef(false);
  const isMounted = useRef(true);

  // Helper function to map old status values to new ones
  const mapStatusToNewFlow = (status: string): JobApplication['status'] => {
    switch (status) {
      case 'interview_scheduled':
      case 'decisioning':
        return 'manager_interviewed';
      case 'under_review':
        return 'shortlisted_for_hr'; // Map under_review to shortlisted_for_hr
      case 'shortlisted':
        return 'shortlisted_for_hr'; // Map old shortlisted to shortlisted_for_hr
      case 'interviewed':
        return 'manager_interviewed'; // Map old interviewed to manager_interviewed
      case 'application_submitted':
      case 'shortlisted_for_hr':
      case 'hr_interviewed':
      case 'shortlisted_for_manager':
      case 'manager_interviewed':
      case 'hired':
      case 'rejected':
      case 'waiting_list':
        return status as JobApplication['status'];
      default:
        return 'application_submitted';
    }
  };

  // Fetch jobs from database
  const fetchJobs = useCallback(async () => {
    if (isFetchingJobs.current) return;
    
    isFetchingJobs.current = true;
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          hr_manager:profiles!hr_manager_id (
            id,
            email,
            admin_name,
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        return;
      }

      // Transform data to match existing Job interface
      const transformedJobs = data.map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        position: job.position,
        officeLocation: job.office_location || job.location, // Fallback to old location field for backward compatibility
        workLocation: job.work_location || job.location, // Fallback to old location field for backward compatibility
        facilities: job.facilities || [],
        isActive: job.is_active,
        isUrgent: job.is_urgent || false,
        applicationDeadline: job.application_deadline,
        hrManagerId: job.hr_manager_id,
        hrManagerName: job.hr_manager ? (job.hr_manager.admin_name || job.hr_manager.display_name || job.hr_manager.email) : undefined,
        hrManagerEmail: job.hr_manager?.email,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
      }));

      console.log('Fetched jobs:', transformedJobs);
      if (isMounted.current) {
        setJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      isFetchingJobs.current = false;
    }
  }, []);

  // Fetch applications from database
  const fetchApplications = useCallback(async () => {
    if (!user || isFetchingApplications.current) return;
    
    isFetchingApplications.current = true;
    try {
      let query = supabase.from('job_applications').select('*');
      
      // If user is admin, fetch all applications, otherwise only their own
      if (userProfile?.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        return;
      }

      // Transform data to match existing JobApplication interface
      const transformedApplications = data.map(app => ({
        id: app.id,
        jobId: app.job_id,
        firstName: app.first_name,
        lastName: app.last_name,
        email: app.email,
        phone: app.phone,
        appliedPosition: app.applied_position,
        earliestStartDate: app.earliest_start_date,
        cityState: app.city_state,
        coverLetter: app.cover_letter,
        coverLetterUrl: app.cover_letter_url,
        resumeUrl: app.resume_url,
        additionalDocsUrls: app.additional_docs_urls || [],
        isReferredByEmployee: app.is_referred_by_employee || false,
        referredByEmployeeName: app.referred_by_employee_name || undefined,
        hasPreviouslyWorkedAtViaQuest: app.has_previously_worked_at_viaquest || false,
        lastDayOfEmployment: app.last_day_of_employment || undefined,
        certificationSignature: app.certification_signature || undefined,
        optInToSMS: app.opt_in_to_sms || false,
        privacyPolicyAccepted: app.privacy_policy_accepted || false,
        status: mapStatusToNewFlow(app.status),
        trackingToken: app.tracking_token,
        createdAt: app.created_at,
        updatedAt: app.updated_at,
      }));

      if (isMounted.current) {
        setApplications(transformedApplications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      isFetchingApplications.current = false;
    }
  }, [user, userProfile?.role]);

  // Fetch master data
  const fetchMasterData = useCallback(async () => {
    if (isFetchingMasterData.current) return;
    
    isFetchingMasterData.current = true;
    try {
      console.log('Fetching master data...');
      
      // Try to fetch positions with authentication if available, otherwise try without
      let positionsQuery = supabase.from('job_positions').select('*').order('name');
      
      // For non-authenticated users, we might get RLS errors, so we'll handle them gracefully
      const { data: positionsData, error: positionsError } = await positionsQuery;

      if (positionsData && !positionsError) {
        const transformedPositions = positionsData.map(p => ({
          id: p.id,
          name: p.name,
          createdAt: p.created_at,
        }));
        if (isMounted.current) {
          setPositions(transformedPositions);
        }
        console.log('Fetched positions:', positionsData.length, 'items');
      } else {
        console.log('Could not fetch positions from database, will extract from jobs');
        console.log('Positions error:', positionsError);
        if (isMounted.current) {
          setPositions([]);
        }
      }

      // Try to fetch locations
      console.log('Attempting to fetch locations from job_locations table...');
      const { data: locationsData, error: locationsError } = await supabase
        .from('job_locations')
        .select('*')
        .order('name');

      if (locationsData && !locationsError) {
        const transformedLocations = locationsData.map(l => ({
          id: l.id,
          name: l.name,
          createdAt: l.created_at,
        }));
        if (isMounted.current) {
          setLocations(transformedLocations);
        }
        console.log('✅ Successfully fetched locations:', locationsData.length, 'items');
        console.log('Location names:', locationsData.map(l => l.name));
      } else {
        console.log('❌ Could not fetch locations from database, will extract from jobs');
        console.log('Locations error:', locationsError);
        if (isMounted.current) {
          setLocations([]);
        }
      }

      // Try to fetch facilities
      const { data: facilitiesData, error: facilitiesError } = await supabase
        .from('job_facilities')
        .select('*')
        .order('name');

      if (facilitiesData && !facilitiesError) {
        const transformedFacilities = facilitiesData.map(f => ({
          id: f.id,
          name: f.name,
          createdAt: f.created_at,
        }));
        if (isMounted.current) {
          setFacilities(transformedFacilities);
        }
        console.log('Fetched facilities:', facilitiesData.length, 'items');
      } else {
        console.log('Could not fetch facilities from database');
        if (isMounted.current) {
          setFacilities([]);
        }
      }
    } catch (error) {
      console.error('Error fetching master data:', error);
      // Set empty arrays so the fallback logic in JobFilters can work
      if (isMounted.current) {
        setPositions([]);
        setLocations([]);
        setFacilities([]);
      }
    } finally {
      isFetchingMasterData.current = false;
      if (isMounted.current) {
        setIsDataLoading(false);
      }
    }
  }, []);

  // Initialize data on mount - fetch jobs and master data for all users ONLY ONCE
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchJobs(), fetchMasterData()]);
    };
    
    initializeData();
  }, []); // Empty dependency array - only run once on mount

  // Fetch applications when user AND userProfile changes
  useEffect(() => {
    if (user && userProfile) {
      fetchApplications();
    }
  }, [user, userProfile, fetchApplications]);

  // Cleanup function to prevent state updates after unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    jobs,
    setJobs,
    applications,
    setApplications,
    positions,
    setPositions,
    locations,
    setLocations,
    facilities,
    setFacilities,
    isDataLoading,
    fetchJobs,
    fetchApplications,
    fetchMasterData,
  };
};
