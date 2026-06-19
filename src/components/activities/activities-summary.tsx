'use client';

import { useActivitiesSummary } from '@/hooks/use-activities';

export function ActivitiesSummary() {
  const { data: summary, isLoading } = useActivitiesSummary();

  const stats = [
    { value: summary?.total_activities, label: 'Total Activities', suffix: '' },
    { value: summary?.total_distance_km, label: 'Total Distance', suffix: ' km' },
    { value: summary?.total_duration_hours, label: 'Total Time', suffix: ' hrs' },
    { value: summary?.total_calories, label: 'Total Calories', suffix: ' cal' },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {isLoading ? (
              <span className="inline-block h-7 w-16 bg-muted animate-pulse rounded" />
            ) : (
              `${stat.value ?? '--'}${stat.suffix}`
            )}
          </div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
