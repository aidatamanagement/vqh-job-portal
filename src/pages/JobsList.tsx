
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, Pin } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Job } from '@/types';

interface FilterState {
  search: string;
  location: string;
  position: string;
  employmentType: string;
  sortBy: 'newest' | 'oldest';
}

const JobsList: React.FC = () => {
  const { jobs, positions, locations, facilities, isDataLoading } = useAppContext();
  const navigate = useNavigate();

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    location: '',
    position: '',
    employmentType: '',
    sortBy: 'newest'
  });

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const activeJobs = jobs.filter(job => job.isActive);
    
    // Use master data for locations and positions, fallback to job data if master data is empty
    const availableLocations = locations.length > 0 
      ? locations.map(loc => loc.name).sort()
      : [...new Set(activeJobs.map(job => job.officeLocation))].sort();
    
    const availablePositions = positions.length > 0 
      ? positions.map(pos => pos.name).sort()
      : [...new Set(activeJobs.map(job => job.position))].sort();
    
    // Use facilities from database, but filter for actual employment types only
    const employmentTypes = facilities.length > 0 
      ? facilities
          .map(facility => facility.name)
          .filter(facility => 
            facility.toLowerCase().includes('time') || 
            facility.toLowerCase().includes('remote') ||
            facility.toLowerCase().includes('contract') ||
            facility.toLowerCase().includes('temporary') ||
            facility.toLowerCase().includes('volunteer') ||
            facility.toLowerCase().includes('permanent') ||
            facility.toLowerCase().includes('seasonal')
          )
          .sort()
      : [...new Set(
          activeJobs.flatMap(job => job.facilities)
        )].filter(facility => 
          facility.toLowerCase().includes('time') || 
          facility.toLowerCase().includes('remote') ||
          facility.toLowerCase().includes('contract') ||
          facility.toLowerCase().includes('temporary')
        ).sort();

    return { 
      locations: availableLocations, 
      positions: availablePositions, 
      employmentTypes 
    };
  }, [jobs, positions, locations, facilities]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    let filteredJobs = jobs.filter(job => job.isActive);

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredJobs = filteredJobs.filter(job =>
        (job.title?.toLowerCase() || '').includes(searchLower) ||
        (job.description?.toLowerCase() || '').includes(searchLower) ||
        (job.position?.toLowerCase() || '').includes(searchLower) ||
        (job.officeLocation?.toLowerCase() || '').includes(searchLower) ||
        (job.workLocation?.toLowerCase() || '').includes(searchLower) ||
        job.facilities.some(facility => (facility?.toLowerCase() || '').includes(searchLower))
      );
    }

    // Apply location filter
    if (filters.location) {
      filteredJobs = filteredJobs.filter(job => job.officeLocation === filters.location);
    }

    // Apply position filter
    if (filters.position) {
      filteredJobs = filteredJobs.filter(job => job.position === filters.position);
    }

    // Apply employment type filter
    if (filters.employmentType) {
      filteredJobs = filteredJobs.filter(job => 
        job.facilities.includes(filters.employmentType)
      );
    }

    // Sort jobs - Featured jobs first, then by date
    filteredJobs.sort((a, b) => {
      // First priority: Featured jobs come first
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      
      // Second priority: Sort by date within each group (featured and non-featured)
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return filters.sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filteredJobs;
  }, [jobs, filters]);

  const handleApplyClick = (jobId: string) => {
    navigate(`/job/${jobId}`);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      position: '',
      employmentType: '',
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = filters.search || filters.location || filters.position || filters.employmentType;
  const totalJobs = filteredJobs.length;

  // Show loading state while data is being fetched
  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="space-y-8">
            {/* Filter skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-12 w-full bg-gray-200" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Skeleton className="h-10 bg-gray-200" />
                <Skeleton className="h-10 bg-gray-200" />
                <Skeleton className="h-10 bg-gray-200" />
                <Skeleton className="h-10 bg-gray-200" />
              </div>
            </div>
            {/* Jobs skeleton */}
            <div className="space-y-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-6">
                  <Skeleton className="h-6 w-40 bg-gray-200" />
                  {Array.from({ length: 3 }).map((_, jobIndex) => (
                    <Skeleton key={jobIndex} className="h-16 w-full bg-gray-200" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search jobs, locations, or keywords..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                {/* Location Filter */}
                <Select value={filters.location || 'all'} onValueChange={(value) => handleFilterChange('location', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {filterOptions.locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Position Filter */}
                <Select value={filters.position || 'all'} onValueChange={(value) => handleFilterChange('position', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Positions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Positions</SelectItem>
                    {filterOptions.positions.map(position => (
                      <SelectItem key={position} value={position}>{position}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Employment Type Filter */}
                <Select value={filters.employmentType || 'all'} onValueChange={(value) => handleFilterChange('employmentType', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Employment Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {filterOptions.employmentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort Filter */}
                <Select value={filters.sortBy} onValueChange={(value: 'newest' | 'oldest') => handleFilterChange('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Results Count */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>{totalJobs} job{totalJobs !== 1 ? 's' : ''} found</span>
              </div>
              {hasActiveFilters && (
                <span className="text-xs sm:text-sm">Filtered from {jobs.filter(job => job.isActive).length} total jobs</span>
              )}
            </div>
          </div>

          {/* Jobs List */}
          {filteredJobs.length > 0 ? (
            <div className="space-y-1">
              
              {filteredJobs.map((job, index) => {
                const isFeatured = job.isUrgent;
                const previousJob = index > 0 ? filteredJobs[index - 1] : null;
                const showSeparator = isFeatured && previousJob && !previousJob.isUrgent;
                
                return (
                  <React.Fragment key={job.id}>
                    {/* Separator between featured and regular jobs */}
                    {showSeparator && (
                      <div className="my-4 border-t border-gray-300">
                        <div className="text-center -mt-3">
                          <span className="bg-white px-4 text-sm text-gray-500">Other Positions</span>
                        </div>
                      </div>
                    )}
                    
                                          <div 
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 rounded-lg px-4 gap-4 sm:gap-0 ${
                          isFeatured ? 'bg-blue-50/50 border-blue-200' : ''
                        }`}
                      >
                        {/* Job Title & Employment Info */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-1">
                            <h3 className="text-lg sm:text-xl font-medium text-black hover:text-gray-800 transition-colors cursor-pointer">
                              {job.title}
                            </h3>
                            {job.isUrgent && (
                              <Badge variant="default" className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-white text-xs w-fit">
                                <Pin className="w-3 h-3" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm sm:text-base font-medium text-black mt-1">
                            {job.position}
                          </p>
                          {/* Employment Type & Benefits */}
                          {job.facilities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {job.facilities.map((facility, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="bg-gray-100 border-gray-300 text-gray-700 text-xs hover:bg-gray-200"
                                >
                                  {facility}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Location Badge */}
                        <div className="flex-shrink-0 sm:mx-8">
                          <div className="flex flex-col gap-1">
                            <Badge 
                              variant="outline" 
                              className="bg-transparent border-gray-300 text-black hover:bg-gray-100 text-xs"
                            >
                              🏢 Office: {job.officeLocation}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className="bg-transparent border-gray-300 text-black hover:bg-gray-100 text-xs"
                            >
                              💼 Work: {job.workLocation}
                            </Badge>
                          </div>
                        </div>

                        {/* Apply Button */}
                        <div className="flex-shrink-0">
                          <Button
                            onClick={() => handleApplyClick(job.id)}
                            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white transition-all duration-200 px-4 sm:px-6 text-sm sm:text-base"
                          >
                            Apply for position
                          </Button>
                        </div>
                      </div>
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {hasActiveFilters ? 'No jobs match your filters' : 'No open positions'}
                </h3>
                <p className="text-gray-600 text-lg mb-4">
                  {hasActiveFilters 
                    ? 'Try adjusting your search criteria or clearing filters.' 
                    : 'We\'re not currently hiring, but check back soon for new opportunities.'
                  }
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsList;
