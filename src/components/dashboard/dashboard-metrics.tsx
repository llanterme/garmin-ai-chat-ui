'use client';

import Link from 'next/link';
import { Dumbbell, MessageCircle } from 'lucide-react';
import { TrainingSnapshot } from '@/components/workouts/training-snapshot';
import { useWorkouts } from '@/hooks/use-workouts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function ZoneRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function SkeletonZoneRows() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          <div className="h-3 w-14 bg-muted animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}

export function DashboardMetrics() {
  const { useTrainingMetrics } = useWorkouts();
  const { data: metrics, isLoading } = useTrainingMetrics();

  const running = metrics?.performanceMetrics?.running;
  const cycling = metrics?.performanceMetrics?.cycling;
  const hasRunning = running && Object.values(running).some(Boolean);
  const hasCycling = cycling && Object.values(cycling).some(Boolean);
  const hasZones = hasRunning || hasCycling;

  return (
    <div className="space-y-4">
      {/* Training snapshot */}
      <TrainingSnapshot />

      {/* Quick links */}
      <div className="flex gap-3">
        <Button variant="outline" asChild className="flex items-center gap-2">
          <Link href="/workouts">
            <Dumbbell className="h-4 w-4" />
            Today&apos;s Workout
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex items-center gap-2">
          <Link href="/chat">
            <MessageCircle className="h-4 w-4" />
            AI Chat
          </Link>
        </Button>
      </div>

      {/* Performance zones */}
      {(isLoading || hasZones) && (
        <Card>
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-medium">Performance Zones</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-6">
                <SkeletonZoneRows />
                <SkeletonZoneRows />
              </div>
            ) : (
              <div className="flex gap-8 flex-wrap">
                {hasRunning && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Running</p>
                    <ZoneRow label="VO2max" value={running?.vo2maxPace} />
                    <ZoneRow label="Threshold" value={running?.thresholdPace} />
                    <ZoneRow label="Tempo" value={running?.tempoPace} />
                    <ZoneRow label="Aerobic" value={running?.aerobicPace} />
                    <ZoneRow label="Easy" value={running?.easyPace} />
                  </div>
                )}
                {hasRunning && hasCycling && (
                  <div className="w-px bg-border self-stretch" />
                )}
                {hasCycling && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Cycling</p>
                    <ZoneRow label="VO2max" value={cycling?.vo2maxWatts != null ? `${cycling.vo2maxWatts}W` : undefined} />
                    <ZoneRow label="Threshold" value={cycling?.thresholdWatts != null ? `${cycling.thresholdWatts}W` : undefined} />
                    <ZoneRow label="Tempo" value={cycling?.tempoWatts != null ? `${cycling.tempoWatts}W` : undefined} />
                    <ZoneRow label="Aerobic" value={cycling?.aerobicWatts != null ? `${cycling.aerobicWatts}W` : undefined} />
                    <ZoneRow label="Easy" value={cycling?.easyWatts != null ? `${cycling.easyWatts}W` : undefined} />
                  </div>
                )}
              </div>
            )}
            {metrics?.performanceMetrics && (metrics.performanceMetrics.runningSource || metrics.performanceMetrics.cyclingSource) && (
              <p className="text-[11px] text-muted-foreground mt-3">
                computed from activity data
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
