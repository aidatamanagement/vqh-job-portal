import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Briefcase,
  Filter,
  ArrowUpDown,
  X,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { format, 
  startOfWeek, 
  startOfMonth, 
  startOfYear,
  endOfWeek, 
  endOfMonth, 
  endOfYear,
  addDays, 
  addWeeks, 
  addMonths, 
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  isSameDay,
  isSameMonth,
  parseISO,
  getDay,
  differenceInMinutes,
  startOfDay,
  endOfDay
} from 'date-fns';

export interface CalendarInterview {
  id: string;
  candidate_email: string;
  scheduled_time: string;
  status: string;
  first_name?: string;
  last_name?: string;
  applied_position?: string;
  city_state?: string;
  job_title?: string;
  job_location?: string;
  meeting_url?: string;
  phone?: string;
}

type CalendarView = 'day' | 'week' | 'month' | 'year';

interface CalendarViewProps {
  interviews: CalendarInterview[];
  isLoading: boolean;
  onUpdateStatus?: (interviewId: string, completed: boolean) => Promise<void>;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  interviews, 
  isLoading,
  onUpdateStatus 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('week');
  const [selectedInterview, setSelectedInterview] = useState<CalendarInterview | null>(null);
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Get unique job locations for filtering
  const uniqueLocations = useMemo(() => {
    const locations = interviews
      .map(interview => interview.job_location)
      .filter((location, index, arr) => location && arr.indexOf(location) === index)
      .sort();
    return locations;
  }, [interviews]);

  // Filter and sort interviews
  const filteredInterviews = useMemo(() => {
    let filtered = interviews;

    // Filter by location
    if (locationFilter !== 'all') {
      filtered = filtered.filter(interview => interview.job_location === locationFilter);
    }

    // Sort interviews
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime();
        case 'location':
          return (a.job_location || '').localeCompare(b.job_location || '');
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        default:
          return 0;
      }
    });

    return filtered;
  }, [interviews, locationFilter, sortBy]);

  // Navigation functions
  const navigatePrevious = () => {
    switch (view) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'year':
        setCurrentDate(subYears(currentDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (view) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'year':
        setCurrentDate(addYears(currentDate, 1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get interviews for a specific date
  const getInterviewsForDate = (date: Date) => {
    return filteredInterviews.filter(interview => 
      isSameDay(parseISO(interview.scheduled_time), date)
    );
  };

  // Format header based on view
  const getHeaderText = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'year':
        return format(currentDate, 'yyyy');
      default:
        return '';
    }
  };



  // Render calendar grid based on view
  const renderCalendarGrid = () => {
    if (view === 'day') {
      return renderDayView();
    } else if (view === 'week') {
      return renderWeekView();
    } else if (view === 'month') {
      return renderMonthView();
    } else {
      return renderYearView();
    }
  };

  const renderDayView = () => {
    const dayInterviews = getInterviewsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex-1 overflow-auto">
        <div className="min-h-full bg-white">
          {/* Time slots */}
          <div className="grid grid-cols-1 gap-px bg-gray-200">
            {hours.map(hour => {
              const hourInterviews = dayInterviews.filter(interview => {
                const interviewDate = parseISO(interview.scheduled_time);
                return interviewDate.getHours() === hour;
              });

              return (
                <div key={hour} className="bg-white min-h-16 border-b border-gray-100">
                  <div className="flex">
                    <div className="w-16 flex-shrink-0 border-r border-gray-200 p-2 text-xs text-gray-500">
                      {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
                    </div>
                    <div className="flex-1 p-2 space-y-1">
                      {hourInterviews.map(interview => (
                        <InterviewEvent
                          key={interview.id}
                          interview={interview}
                          onClick={() => setSelectedInterview(interview)}
                          className="w-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex-1 overflow-auto">
        <div className="min-w-full bg-white">
          {/* Day headers */}
          <div className="grid grid-cols-8 gap-px bg-gray-200 border-b">
            <div className="bg-white p-3"></div>
            {days.map(day => (
              <div key={day.toISOString()} className="bg-white p-3 text-center">
                <div className="text-sm font-medium text-gray-900">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-lg ${isSameDay(day, new Date()) ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="grid grid-cols-8 gap-px bg-gray-200">
            {hours.map(hour => (
              <React.Fragment key={hour}>
                <div className="bg-white p-2 border-r border-gray-200 text-xs text-gray-500">
                  {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
                </div>
                {days.map(day => {
                  const dayInterviews = getInterviewsForDate(day).filter(interview => {
                    const interviewDate = parseISO(interview.scheduled_time);
                    return interviewDate.getHours() === hour;
                  });

                  return (
                    <div key={`${day.toISOString()}-${hour}`} className="bg-white min-h-16 p-1 space-y-1">
                      {dayInterviews.map(interview => (
                        <InterviewEvent
                          key={interview.id}
                          interview={interview}
                          onClick={() => setSelectedInterview(interview)}
                          className="w-full text-xs"
                        />
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return (
      <div className="flex-1 overflow-auto">
        <div className="bg-white">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
              <div key={dayName} className="bg-white p-3 text-center text-sm font-medium text-gray-700">
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {days.map(day => {
              const dayInterviews = getInterviewsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div 
                  key={day.toISOString()} 
                  className={`bg-white min-h-32 p-2 ${!isCurrentMonth ? 'bg-gray-50' : ''}`}
                >
                  <div className={`text-sm mb-2 ${isToday ? 'text-blue-600 font-bold' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayInterviews.slice(0, 3).map(interview => (
                      <InterviewEvent
                        key={interview.id}
                        interview={interview}
                        onClick={() => setSelectedInterview(interview)}
                        className="w-full text-xs"
                        compact
                      />
                    ))}
                    {dayInterviews.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dayInterviews.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const months = Array.from({ length: 12 }, (_, i) => 
      new Date(currentDate.getFullYear(), i, 1)
    );

    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {months.map(month => {
            const monthInterviews = filteredInterviews.filter(interview => 
              isSameMonth(parseISO(interview.scheduled_time), month)
            );

            return (
              <Card key={month.toISOString()} className="p-4 cursor-pointer hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="font-medium text-gray-900 mb-2">
                    {format(month, 'MMMM')}
                  </div>
                  <div className="text-2xl font-bold text-gray-600 mb-2">
                    {monthInterviews.length}
                  </div>
                  <div className="text-xs text-gray-500">
                    {monthInterviews.length === 1 ? 'interview' : 'interviews'}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[800px] bg-gray-50 rounded-lg overflow-hidden">
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col">
        {/* Calendar Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={navigatePrevious}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={navigateNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900">
                {getHeaderText()}
              </h2>
            </div>

            {/* View Selector */}
            <div className="flex items-center space-x-2">
              <Select value={view} onValueChange={(value: CalendarView) => setView(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time">Sort by Time</SelectItem>
                  <SelectItem value="location">Sort by Location</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-500">
              {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        {renderCalendarGrid()}
      </div>

      {/* Sidebar */}
      {selectedInterview && (
        <InterviewSidebar 
          interview={selectedInterview} 
          onClose={() => setSelectedInterview(null)}
          onUpdateStatus={onUpdateStatus}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}
    </div>
  );
};

// Helper function for status colors (moved outside component for reuse)
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-green-500';
    case 'cancelled':
      return 'bg-red-500';
    case 'no_show':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
};

// Interview Event Component
interface InterviewEventProps {
  interview: CalendarInterview;
  onClick: () => void;
  className?: string;
  compact?: boolean;
}

const InterviewEvent: React.FC<InterviewEventProps> = ({ 
  interview, 
  onClick, 
  className = '',
  compact = false 
}) => {
  const candidateName = `${interview.first_name || ''} ${interview.last_name || ''}`.trim() || 'Unknown';
  const time = format(parseISO(interview.scheduled_time), 'h:mm a');

  return (
    <div 
      onClick={onClick}
      className={`
        ${getStatusColor(interview.status)} 
        text-white p-2 rounded cursor-pointer hover:opacity-80 transition-opacity
        ${className}
      `}
    >
      {compact ? (
        <div className="truncate">
          <div className="font-medium text-xs">{candidateName}</div>
        </div>
      ) : (
        <div>
          <div className="font-medium text-sm">{candidateName}</div>
          <div className="text-xs opacity-90">{time}</div>
          {interview.job_location && (
            <div className="text-xs opacity-75">{interview.job_location}</div>
          )}
        </div>
      )}
    </div>
  );
};

// Interview Sidebar Component
interface InterviewSidebarProps {
  interview: CalendarInterview;
  onClose: () => void;
  onUpdateStatus?: (interviewId: string, completed: boolean) => Promise<void>;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const InterviewSidebar: React.FC<InterviewSidebarProps> = ({ 
  interview, 
  onClose, 
  onUpdateStatus,
  collapsed,
  onToggleCollapse
}) => {
  const candidateName = `${interview.first_name || ''} ${interview.last_name || ''}`.trim() || 'Unknown';
  const interviewDate = parseISO(interview.scheduled_time);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'no_show':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (collapsed) {
    return (
      <div className="w-16 bg-white border-l border-gray-200 overflow-y-auto transition-all duration-300">
        <div className="p-2 h-full">
          {/* Collapse Toggle */}
          <div className="flex flex-col items-center justify-between h-full">
            <div className="flex flex-col items-center space-y-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onToggleCollapse}
                className="w-10 h-10 p-0"
                title="Expand sidebar"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
              
              {/* Status Indicator */}
              <div 
                className={`w-4 h-4 rounded-full ${getStatusColor(interview.status)}`}
                title={interview.status.replace('_', ' ').toUpperCase()}
              ></div>
              
              {/* User Icon */}
              <User className="w-5 h-5 text-gray-400" title={candidateName} />
              
              {/* Time */}
              <div className="text-xs text-gray-500 text-center transform rotate-90 whitespace-nowrap" title={format(interviewDate, 'MMM d, h:mm a')}>
                {format(interviewDate, 'MMM d')}
              </div>
            </div>
            
            {/* Close Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="w-8 h-8 p-0"
              title="Close sidebar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto transition-all duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Interview Details</h3>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleCollapse}
              title="Collapse sidebar"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Interview Info */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900">{candidateName}</div>
              <div className="text-sm text-gray-500">{interview.candidate_email}</div>
              {interview.phone && (
                <div className="text-sm text-gray-500">{interview.phone}</div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900">
                {format(interviewDate, 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="text-sm text-gray-500">
                {format(interviewDate, 'h:mm a')}
              </div>
            </div>
          </div>

          {interview.job_location && (
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">{interview.job_location}</div>
                <div className="text-sm text-gray-500">Job Location</div>
              </div>
            </div>
          )}

          {interview.applied_position && (
            <div className="flex items-center space-x-3">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">{interview.applied_position}</div>
                <div className="text-sm text-gray-500">Applied Position</div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 flex items-center justify-center">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(interview.status)}`}></div>
            </div>
            <div>
              <Badge variant={getStatusBadgeVariant(interview.status)}>
                {interview.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          {interview.meeting_url && (
            <div className="mt-6">
              <Button 
                asChild 
                className="w-full"
              >
                <a href={interview.meeting_url} target="_blank" rel="noopener noreferrer">
                  Join Meeting
                </a>
              </Button>
            </div>
          )}

          {onUpdateStatus && interview.status === 'scheduled' && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onUpdateStatus(interview.id, true)}
              >
                Mark as Completed
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView; 