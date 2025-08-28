'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  Zap,
  TrendingUp,
  Mountain,
  Gauge,
} from 'lucide-react';

import { useActivities } from '@/hooks/use-activities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActivityTypeIcon, getActivityTypeColor } from '@/components/ui/activity-type-icon';
import { cn } from '@/lib/utils';
import { Activity } from '@/types';

interface ActivityDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const [activityId, setActivityId] = useState<string>('');
  
  useEffect(() => {
    params.then(({ id }) => setActivityId(id));
  }, [params]);

  const { useActivity } = useActivities({ page: 1, limit: 10 });
  const { data: activity, isLoading, error } = useActivity(activityId);
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-48"></div>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 bg-muted rounded-lg"></div>
            <div className="space-y-2 flex-1">
              <div className="h-8 bg-muted rounded w-64"></div>
              <div className="h-4 bg-muted rounded w-48"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Button asChild variant="outline">
          <Link href="/activities">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Link>
        </Button>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-destructive mb-2">Activity not found</div>
            <p className="text-sm text-muted-foreground">
              The activity you're looking for doesn't exist or has been deleted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activityTypeColor = getActivityTypeColor(activity.activity_type);
  const isRunning = activity.activity_type.includes('running');
  const isCycling = activity.activity_type.includes('cycling') || activity.activity_type.includes('ride');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Button asChild variant="outline">
        <Link href="/activities">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Activities
        </Link>
      </Button>

      {/* Activity Header */}
      <div className="flex items-start gap-4">
        <div className={cn('p-3 rounded-lg border', activityTypeColor)}>
          <ActivityTypeIcon 
            activityType={activity.activity_type} 
            className="h-8 w-8" 
          />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {activity.activity_name || 'Untitled Activity'}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(activity.start_time), 'EEEE, MMMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(new Date(activity.start_time), 'h:mm a')}
            </span>
          </div>
          <div className="mt-3">
            <Badge variant="outline" className={activityTypeColor}>
              {activity.activity_type.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {activity.distance > 0 && (
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {activity.normalized.distance_km.toFixed(2)} km
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  {activity.normalized.distance_miles.toFixed(2)} miles
                </div>
                <div className="text-sm text-muted-foreground">Distance</div>
              </div>
            )}
            
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {activity.normalized.duration_formatted}
              </div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
            
            {activity.average_speed > 0 && (
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {isRunning && activity.normalized.average_pace_per_km
                    ? activity.normalized.average_pace_per_km
                    : `${activity.normalized.average_speed_kmh.toFixed(1)} km/h`
                  }
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  {isRunning && activity.normalized.average_pace_per_mile
                    ? `${activity.normalized.average_pace_per_mile} /mi`
                    : `${activity.normalized.average_speed_mph.toFixed(1)} mph`
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  {isRunning ? 'Average Pace' : 'Average Speed'}
                </div>
              </div>
            )}
            
            {activity.calories > 0 && (
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {activity.calories}
                </div>
                <div className="text-sm text-muted-foreground">Calories</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.normalized.max_speed_kmh && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Max Speed</span>
                <div className="text-right">
                  <div className="font-medium">
                    {activity.normalized.max_speed_kmh.toFixed(1)} km/h
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {activity.normalized.max_speed_mph?.toFixed(1)} mph
                  </div>
                </div>
              </div>
            )}
            
            {activity.average_power && activity.average_power > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Power</span>
                <div className="text-right">
                  <div className="font-medium">
                    {Math.round(activity.average_power)}W avg
                  </div>
                  {activity.max_power && activity.max_power > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {Math.round(activity.max_power)}W max
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activity.average_cadence && activity.average_cadence > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cadence</span>
                <div className="text-right">
                  <div className="font-medium">
                    {Math.round(activity.average_cadence)} avg
                  </div>
                  {activity.max_cadence && activity.max_cadence > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {Math.round(activity.max_cadence)} max
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activity.elevation_gain && activity.elevation_gain > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Elevation Gain</span>
                <div className="text-right">
                  <div className="font-medium">
                    {activity.elevation_gain}m
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {activity.normalized.elevation_gain_ft}ft
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Health Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.average_heart_rate && activity.average_heart_rate > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Heart Rate</span>
                <div className="text-right">
                  <div className="font-medium">
                    {Math.round(activity.average_heart_rate)} bpm avg
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Calories Burned</span>
              <div className="text-right">
                <div className="font-medium">{activity.calories}</div>
              </div>
            </div>
            
            {activity.normalized_power && activity.normalized_power > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Normalized Power</span>
                <div className="text-right">
                  <div className="font-medium">
                    {Math.round(activity.normalized_power)}W
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Information */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Garmin Activity ID</span>
              <span className="font-mono">{activity.garmin_activity_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Activity Type</span>
              <span className="capitalize">{activity.activity_type.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Time</span>
              <span>{format(new Date(activity.start_time), 'MMM d, yyyy h:mm a')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration (Raw)</span>
              <span>{(activity.duration / 60).toFixed(1)} minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}