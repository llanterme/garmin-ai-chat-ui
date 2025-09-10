'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Zap,
  TrendingUp,
  Eye,
  Trash2,
  Search,
  Filter,
  ChevronDown,
} from 'lucide-react';

import { useActivities } from '@/hooks/use-activities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActivityTypeIcon, getActivityTypeColor } from '@/components/ui/activity-type-icon';
import { formatDistance, formatDuration, formatPace, formatSpeed, cn } from '@/lib/utils';
import { Activity, ActivityFilters } from '@/types';

interface ActivityCardProps {
  activity: Activity;
  onDelete: (activityId: string) => void;
  isDeleting: boolean;
}

function ActivityCard({ activity, onDelete, isDeleting }: ActivityCardProps) {
  const activityTypeColor = getActivityTypeColor(activity.activity_type);
  const isRunning = activity.activity_type.includes('running');
  const isCycling = activity.activity_type.includes('cycling') || activity.activity_type.includes('ride');

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg border', activityTypeColor)}>
              <ActivityTypeIcon 
                activityType={activity.activity_type} 
                className="h-5 w-5" 
              />
            </div>
            <div>
              <CardTitle className="text-lg">
                {activity.activity_name || 'Untitled Activity'}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(activity.start_time), 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(activity.start_time), 'h:mm a')}
                </span>
              </CardDescription>
            </div>
          </div>
          
          <Badge variant="outline" className={activityTypeColor}>
            {activity.activity_type.replace(/_/g, ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activity.distance > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {activity.normalized?.distance_km?.toFixed(2) || (activity.distance / 1000).toFixed(2)} km
              </div>
              <div className="text-xs text-muted-foreground">
                {activity.normalized?.distance_miles?.toFixed(2) || (activity.distance / 1609.344).toFixed(2)} mi
              </div>
              <div className="text-sm text-muted-foreground">Distance</div>
            </div>
          )}
          
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {activity.normalized?.duration_formatted || `${Math.floor(activity.duration / 60)}:${String(Math.floor(activity.duration % 60)).padStart(2, '0')}`}
            </div>
            <div className="text-sm text-muted-foreground">Duration</div>
          </div>
          
          {activity.average_speed > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {isRunning && activity.normalized?.average_pace_per_km
                  ? activity.normalized.average_pace_per_km
                  : `${activity.normalized?.average_speed_kmh?.toFixed(1) || (activity.average_speed * 3.6).toFixed(1)} km/h`
                }
              </div>
              <div className="text-xs text-muted-foreground">
                {isRunning && activity.normalized?.average_pace_per_mile
                  ? `${activity.normalized.average_pace_per_mile} /mi`
                  : `${activity.normalized?.average_speed_mph?.toFixed(1) || (activity.average_speed * 2.237).toFixed(1)} mph`
                }
              </div>
              <div className="text-sm text-muted-foreground">
                {isRunning ? 'Pace' : 'Speed'}
              </div>
            </div>
          )}
          
          {activity.calories > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {activity.calories}
              </div>
              <div className="text-sm text-muted-foreground">Calories</div>
            </div>
          )}
        </div>

        {/* Additional Metrics */}
        <div className="flex items-center gap-4 pt-2 border-t border-border text-sm flex-wrap">
          {activity.average_heart_rate && activity.average_heart_rate > 0 && (
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span>{Math.round(activity.average_heart_rate)} bpm avg</span>
            </div>
          )}
          {activity.average_power && activity.average_power > 0 && (
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>{Math.round(activity.average_power)}W avg</span>
            </div>
          )}
          {activity.max_power && activity.max_power > 0 && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span>{Math.round(activity.max_power)}W max</span>
            </div>
          )}
          {activity.elevation_gain && activity.elevation_gain > 0 && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>{activity.elevation_gain}m / {activity.normalized?.elevation_gain_ft || Math.round(activity.elevation_gain * 3.28084)}ft elevation</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/activities/${activity.id}`}>
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(activity.id)}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivitiesListProps {
  initialFilters?: ActivityFilters;
  limit?: number;
}

export function ActivitiesList({ initialFilters = {}, limit = 10 }: ActivitiesListProps) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ActivityFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const {
    activities,
    totalActivities,
    currentPage,
    totalPages,
    hasNext,
    hasPrev,
    isLoading,
    error,
    deleteActivity,
    isDeleting,
    useActivityTypes,
  } = useActivities({
    page,
    limit,
    filters: {
      ...filters,
      search: searchQuery || undefined,
    },
  });

  const { data: activityTypes } = useActivityTypes();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (newFilters: Partial<ActivityFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filtering
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-muted rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-48"></div>
                    <div className="h-3 bg-muted rounded w-32"></div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="text-center space-y-2">
                      <div className="h-6 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-destructive mb-2">Failed to load activities</div>
          <p className="text-sm text-muted-foreground">
            Please try again later or check your connection.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <ActivityTypeIcon activityType="fitness" className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No activities found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || Object.keys(filters).length > 0
              ? 'Try adjusting your search or filters.'
              : 'Sync your activities from Garmin Connect to see them here.'}
          </p>
          {!searchQuery && Object.keys(filters).length === 0 && (
            <Button asChild>
              <Link href="/sync">Sync Activities</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={cn("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Activity Type</label>
                  <select
                    value={filters.activityType || ''}
                    onChange={(e) => handleFilterChange({ activityType: e.target.value || undefined })}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="">All Types</option>
                    {activityTypes?.map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">From Date</label>
                  <Input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => handleFilterChange({ dateFrom: e.target.value || undefined })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">To Date</label>
                  <Input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => handleFilterChange({ dateTo: e.target.value || undefined })}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({});
                    setSearchQuery('');
                  }}
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {activities.length} of {totalActivities} activities
        </p>
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
      </div>

      {/* Activities Grid */}
      <div className="grid gap-6">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onDelete={deleteActivity}
            isDeleting={isDeleting}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={!hasPrev}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={!hasNext}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}