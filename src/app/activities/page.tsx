import { Metadata } from 'next';
import { Activity, BarChart3 } from 'lucide-react';
import { ActivitiesList } from '@/components/activities/activities-list';
import { ActivitiesSummary } from '@/components/activities/activities-summary';

export const metadata: Metadata = {
  title: 'Activities - Garmin AI Chat',
  description: 'Browse and analyze your synced Garmin Connect activities',
};

export default function ActivitiesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground flex items-center gap-3">
          <Activity className="h-8 w-8" />
          Activities
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Browse, filter, and analyze your synced Garmin Connect activities.
        </p>
      </div>

      {/* Quick Stats */}
      <ActivitiesSummary />

      {/* Activities List */}
      <ActivitiesList />
    </div>
  );
}