
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import JobCard from '@/components/JobCard';
import JobFilters from '@/components/JobFilters';
import LoadingSpinner from '@/components/ui/loading-spinner';
import NoDataState from '@/components/ui/no-data-state';
import { useAppContext } from '@/contexts/AppContext';
import { FilterState } from '@/types';

const JobsList: React.FC = () => {
  const { jobs, jobsLoading } = useAppContext();
  const [displayCount, setDisplayCount] = useState(12);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    positions: [],
    location: '',
    sortBy: 'newest',
  });

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => job.isActive);

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.position.toLowerCase().includes(searchLower)
      );
    }

    // Position filter
    if (filters.positions.length > 0) {
      filtered = filtered.filter(job =>
        filters.positions.includes(job.position)
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(job => job.location === filters.location);
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return filters.sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [jobs, filters]);

  const displayedJobs = filteredJobs.slice(0, displayCount);
  const hasMore = displayCount < filteredJobs.length;
  const hasActiveFilters = filters.search || filters.positions.length > 0 || filters.location;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  // Show loading state while jobs are being fetched
  if (jobsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-slide-up">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Page Header */}
            <div className="text-center space-y-4 animate-slide-up">
              <h1 className="text-4xl font-bold text-gray-900">
                Join Our Mission of Compassionate Care
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover meaningful career opportunities in hospice care where you can make a real difference in patients' and families' lives.
              </p>
            </div>

            {/* Loading State */}
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" text="Loading available positions..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-slide-up">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4 animate-slide-up">
            <h1 className="text-4xl font-bold text-gray-900">
              Join Our Mission of Compassionate Care
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover meaningful career opportunities in hospice care where you can make a real difference in patients' and families' lives.
            </p>
          </div>

          {/* Filters */}
          <div className="animate-slide-up-delayed">
            <JobFilters
              filters={filters}
              onFiltersChange={setFilters}
              totalJobs={filteredJobs.length}
            />
          </div>

          {/* Content based on state */}
          {filteredJobs.length === 0 && !jobsLoading ? (
            <div className="animate-slide-up-delayed-2">
              <NoDataState
                icon={Search}
                title={hasActiveFilters ? "No jobs match your criteria" : "No jobs available"}
                description={
                  hasActiveFilters 
                    ? "Try adjusting your search criteria or browse all available positions." 
                    : "We don't have any open positions at the moment. Please check back later."
                }
              />
            </div>
          ) : (
            <>
              {/* Jobs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up-delayed-2">
                {displayedJobs.map((job, index) => (
                  <div 
                    key={job.id} 
                    className="animate-slide-up opacity-0" 
                    style={{ 
                      animationDelay: `${0.8 + index * 0.1}s`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <JobCard job={job} />
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center pt-8 animate-slide-up-delayed-3">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    size="lg"
                    className="bg-white hover:bg-gray-50 border-primary text-primary hover:text-primary"
                  >
                    Load More Jobs ({filteredJobs.length - displayCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsList;
