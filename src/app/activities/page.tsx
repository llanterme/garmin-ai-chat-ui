import { Metadata } from 'next';
import { Activity, BarChart3 } from 'lucide-react';
import { ActivitiesList } from '@/components/activities/activities-list';

export const metadata: Metadata = {
  title: 'Activities - Garmin AI Chat',
  description: 'Browse and analyze your synced Garmin Connect activities',
};

export default function ActivitiesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Activity className="h-8 w-8" />
          Activities
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Browse, filter, and analyze your synced Garmin Connect activities.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">--</div>
          <div className="text-sm text-muted-foreground">Total Activities</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">-- km</div>
          <div className="text-sm text-muted-foreground">Total Distance</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">-- hrs</div>
          <div className="text-sm text-muted-foreground">Total Time</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">-- cal</div>
          <div className="text-sm text-muted-foreground">Total Calories</div>
        </div>
      </div>

      {/* Activities List */}
      <ActivitiesList />
    </div>
  );
}