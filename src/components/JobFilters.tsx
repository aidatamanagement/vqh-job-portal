
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { FilterState } from '@/types';
import { useAppContext } from '@/contexts/AppContext';

interface JobFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalJobs: number;
}

const JobFilters: React.FC<JobFiltersProps> = ({ filters, onFiltersChange, totalJobs }) => {
  const { positions, locations } = useAppContext();

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

      {/* Results Count and Sort Options */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-bold text-gray-900">
            {totalJobs} job{totalJobs !== 1 ? 's' : ''} available
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[140px] border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.location || 'all'} onValueChange={handleLocationChange}>
            <SelectTrigger className="w-[160px] border-gray-300">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.name}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default JobFilters;
