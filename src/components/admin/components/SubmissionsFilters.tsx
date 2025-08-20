
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, ArrowUpDown, ArrowUp, ArrowDown, Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubmissionsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  positionFilter: string;
  setPositionFilter: (filter: string) => void;
  locationFilter: string;
  setLocationFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  hrManagerFilter: string;
  setHrManagerFilter: (filter: string) => void;
  sortBy: 'date' | 'name' | 'position' | 'hrManager';
  setSortBy: (sort: 'date' | 'name' | 'position' | 'hrManager') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  positions: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  uniqueHrManagers: string[];
  isArchive?: boolean;
}

const SubmissionsFilters: React.FC<SubmissionsFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  positionFilter,
  setPositionFilter,
  locationFilter,
  setLocationFilter,
  statusFilter,
  setStatusFilter,
  hrManagerFilter,
  setHrManagerFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  positions,
  locations,
  uniqueHrManagers,
  isArchive = false
}) => {
  const navigate = useNavigate();
  
  const hasActiveFilters = searchTerm !== '' || positionFilter !== 'all' || locationFilter !== 'all' || (statusFilter !== 'all' && !isArchive) || hrManagerFilter !== 'all';

  const clearAllFilters = () => {
    setSearchTerm('');
    setPositionFilter('all');
    setLocationFilter('all');
    if (!isArchive) {
      setStatusFilter('all');
    }
    setHrManagerFilter('all');
    setSortBy('date');
    setSortOrder('desc');
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleArchiveClick = () => {
    navigate('/admin/archive-submissions');
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm animate-slide-up-delayed">
      <div className="flex flex-col space-y-4">
        {/* First Row: Search and Filters */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, position, or Manager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map(position => (
                <SelectItem key={position.id} value={position.name}>{position.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Job Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Job Locations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location.id} value={location.name}>{location.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={hrManagerFilter} onValueChange={setHrManagerFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Managers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Managers</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
              {uniqueHrManagers.map(manager => (
                <SelectItem key={manager} value={manager}>{manager}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!isArchive && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="application_submitted">Application Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="waiting_list">Waiting List</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Second Row: Sorting and Actions */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:gap-4 sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date Applied</SelectItem>
                <SelectItem value="name">Candidate Name</SelectItem>
                <SelectItem value="position">Position</SelectItem>
                <SelectItem value="hrManager">Manager</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="flex items-center gap-1"
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {sortOrder === 'asc' ? 'Asc' : 'Desc'}
            </Button>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {!isArchive && (
              <Button
                onClick={handleArchiveClick}
                className="flex items-center gap-2 bg-[#005188] hover:bg-[#004070] text-white"
              >
                <Folder className="w-4 h-4" />
                Archive
              </Button>
            )}
            
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="whitespace-nowrap text-sm px-3"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionsFilters;
