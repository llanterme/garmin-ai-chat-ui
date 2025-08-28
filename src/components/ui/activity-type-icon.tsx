import React from 'react';
import {
  Activity,
  Bike,
  Waves,
  Dumbbell,
  Mountain,
  Footprints,
  Trophy,
  CircleDot,
} from 'lucide-react';

interface ActivityTypeIconProps {
  activityType: string;
  className?: string;
}

const getActivityIcon = (activityType: string) => {
  const type = activityType.toLowerCase();
  
  if (type.includes('running') || type.includes('run')) {
    return Footprints;
  }
  if (type.includes('cycling') || type.includes('bike') || type.includes('ride')) {
    return Bike;
  }
  if (type.includes('swimming') || type.includes('swim')) {
    return Waves;
  }
  if (type.includes('strength') || type.includes('weight') || type.includes('gym')) {
    return Dumbbell;
  }
  if (type.includes('hiking') || type.includes('mountain') || type.includes('climb')) {
    return Mountain;
  }
  if (type.includes('race') || type.includes('competition')) {
    return Trophy;
  }
  if (type.includes('activity') || type.includes('fitness') || type.includes('cardio')) {
    return Activity;
  }
  
  // Default icon
  return CircleDot;
};

export function ActivityTypeIcon({ activityType, className = "h-4 w-4" }: ActivityTypeIconProps) {
  const IconComponent = getActivityIcon(activityType);
  
  return <IconComponent className={className} />;
}

export function getActivityTypeColor(activityType: string): string {
  const type = activityType.toLowerCase();
  
  if (type.includes('running') || type.includes('run')) {
    return 'text-orange-600 bg-orange-100 border-orange-200 dark:text-orange-400 dark:bg-orange-950/20 dark:border-orange-800';
  }
  if (type.includes('cycling') || type.includes('bike') || type.includes('ride')) {
    return 'text-blue-600 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-800';
  }
  if (type.includes('swimming') || type.includes('swim')) {
    return 'text-cyan-600 bg-cyan-100 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-950/20 dark:border-cyan-800';
  }
  if (type.includes('strength') || type.includes('weight') || type.includes('gym')) {
    return 'text-purple-600 bg-purple-100 border-purple-200 dark:text-purple-400 dark:bg-purple-950/20 dark:border-purple-800';
  }
  if (type.includes('hiking') || type.includes('mountain') || type.includes('climb')) {
    return 'text-green-600 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-950/20 dark:border-green-800';
  }
  
  // Default color
  return 'text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-950/20 dark:border-gray-800';
}