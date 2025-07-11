
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FilterX } from 'lucide-react';
import { JobPosition, JobLocation, HRManager } from '@/types';

interface JobFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterPosition: string;
  setFilterPosition: (position: string) => void;
  filterLocation: string;
  setFilterLocation: (location: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterHRManager: string;
  setFilterHRManager: (hrManager: string) => void;
  positions: JobPosition[];
  locations: JobLocation[];
  hrManagers: HRManager[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterPosition,
  setFilterPosition,
  filterLocation,
  setFilterLocation,
  filterStatus,
  setFilterStatus,
  filterHRManager,
  setFilterHRManager,
  positions,
  locations,
  hrManagers,
  hasActiveFilters,
  onClearFilters,
}) => {
  return (
    <Card className="p-3 sm:p-4 lg:p-6 animate-fade-in">
      <div className="space-y-3 sm:space-y-4">
        {/* Search - Full width on mobile */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {/* Filters - Stack on mobile, grid on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Select value={filterPosition} onValueChange={setFilterPosition}>
            <SelectTrigger>
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map((position) => (
                <SelectItem key={position.id} value={position.name}>
                  {position.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger>
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

          <Select value={filterHRManager} onValueChange={setFilterHRManager}>
            <SelectTrigger>
              <SelectValue placeholder="All HR Managers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All HR Managers</SelectItem>
              {hrManagers.map((manager) => (
                <SelectItem key={manager.id} value={manager.id}>
                  {manager.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <FilterX className="w-4 h-4" />
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default JobFilters;
