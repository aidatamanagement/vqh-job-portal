
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, FilterX } from 'lucide-react';
import { FilterState } from '@/types';
import { useAppContext } from '@/contexts/AppContext';

interface JobFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalJobs: number;
}

const JobFilters: React.FC<JobFiltersProps> = ({ filters, onFiltersChange, totalJobs }) => {
  const { positions, locations } = useAppContext();

  // Check if any filters are active
  const hasActiveFilters = filters.search !== '' || filters.positions.length > 0 || filters.location !== '';

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handlePositionToggle = (position: string) => {
    const newPositions = filters.positions.includes(position)
      ? filters.positions.filter(p => p !== position)
      : [...filters.positions, position];
    onFiltersChange({ ...filters, positions: newPositions });
  };

  const handleLocationChange = (location: string) => {
    onFiltersChange({ ...filters, location: location === 'all' ? '' : location });
  };

  const handleSortChange = (sort: 'newest' | 'oldest') => {
    onFiltersChange({ ...filters, sortBy: sort });
  };

  const clearPositionFilter = (position: string) => {
    handlePositionToggle(position);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      positions: [],
      location: '',
      sortBy: filters.sortBy, // Keep the sort order
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6 animate-fade-in">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Search jobs by title, keywords, or description..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 h-12 text-base border-gray-300 focus:border-primary"
        />
      </div>

      {/* Position Categories */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Job Categories</h3>
        <div className="flex flex-wrap gap-2">
          {positions.map((position) => (
            <Button
              key={position.id}
              variant={filters.positions.includes(position.name) ? "default" : "outline"}
              size="sm"
              onClick={() => handlePositionToggle(position.name)}
              className={`${
                filters.positions.includes(position.name)
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {position.name}
            </Button>
          ))}
        </div>
        
        {/* Active position filters */}
        {filters.positions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.positions.map((position) => (
              <Badge
                key={position}
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1"
              >
                {position}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => clearPositionFilter(position)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FilterX className="w-4 h-4" />
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Results Count and Sort Options - Mobile Responsive */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center pt-4 border-t border-gray-200 space-y-4 md:space-y-0">
        {/* Sort and Location Controls - Show first on mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 order-1 md:order-2">
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[140px] border-gray-300 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.location || 'all'} onValueChange={handleLocationChange}>
            <SelectTrigger className="w-full sm:w-[160px] border-gray-300 bg-white">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.name}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Results Count - Show after controls on mobile */}
        <div className="flex items-center order-2 md:order-1">
          <span className="text-sm font-bold text-gray-900">
            {totalJobs} job{totalJobs !== 1 ? 's' : ''} available
          </span>
        </div>
      </div>
    </div>
  );
};

export default JobFilters;
