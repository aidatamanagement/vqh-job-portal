
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import JobCard from '@/components/JobCard';
import JobFilters from '@/components/JobFilters';
import { useAppContext } from '@/contexts/AppContext';
import { FilterState } from '@/types';

const JobsList: React.FC = () => {
  const { jobs, isDataLoading } = useAppContext();
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

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  // Show loading state while data is being fetched
  if (isDataLoading) {
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

            {/* Loading skeleton for filters */}
            <div className="animate-slide-up-delayed">
              <Skeleton className="h-20 w-full" />
            </div>

            {/* Loading skeleton for jobs grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up-delayed-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-64 w-full" />
              ))}
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

          {/* Jobs Grid */}
          {displayedJobs.length > 0 ? (
            <>
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
          ) : (
            <div className="text-center py-12 animate-slide-up-delayed-2">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or browse all available positions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsList;
