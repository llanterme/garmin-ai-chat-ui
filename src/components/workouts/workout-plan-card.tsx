'use client';

import { useState } from 'react';
import { WorkoutPlan } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { WorkoutTimeline } from './workout-timeline';
import { cn } from '@/lib/utils';

const INTERVAL_DOT: Record<string, string> = {
  VO2MAX: 'bg-red-400',
  THRESHOLD: 'bg-orange-400',
  TEMPO: 'bg-amber-400',
  AEROBIC: 'bg-blue-400',
  AEROBIC_BASE: 'bg-blue-400',
  RECOVERY: 'bg-emerald-400',
  WARM: 'bg-slate-400',
  COOL: 'bg-slate-400',
};

function formatSegmentName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function intervalDotColor(description: string, target: string, recommendationType: string): string {
  const d = description.toLowerCase();
  const t = target.toLowerCase();
  if (d.includes('recov') || t.includes('recov') || d.includes('easy')) return INTERVAL_DOT.RECOVERY;
  return INTERVAL_DOT[recommendationType.toUpperCase()] ?? 'bg-blue-400';
}

interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
}

export function WorkoutPlanCard({ plan }: WorkoutPlanCardProps) {
  const [mainSetOpen, setMainSetOpen] = useState(true);

  const running = plan.performanceMetrics?.running as Record<string, string> | undefined;
  const cycling = plan.performanceMetrics?.cycling as Record<string, number> | undefined;

  return (
    <Card className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-bold font-display uppercase tracking-wide text-foreground">{plan.sport}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {plan.recommendationType.replace(/_/g, ' ')}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">{plan.durationMinutes} min</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {plan.confidence.toFixed(1)} conf
          </span>
        </div>

        {/* Timeline */}
        <WorkoutTimeline
          workoutStructure={plan.workoutStructure}
          totalDuration={plan.durationMinutes}
          recommendationType={plan.recommendationType}
        />

        {/* Segment list */}
        <div className="space-y-3">
          {plan.workoutStructure.map((segment, si) => {
            const isMainSet = !segment.segment.toLowerCase().includes('warm') &&
              !segment.segment.toLowerCase().includes('cool');
            const hasIntervals = segment.intervals && segment.intervals.length > 0;

            if (isMainSet && hasIntervals) {
              return (
                <div key={si} className="space-y-1">
                  <button
                    className="flex items-center gap-2 w-full text-left group"
                    onClick={() => setMainSetOpen(o => !o)}
                  >
                    <span className="text-sm font-medium text-foreground">{formatSegmentName(segment.segment)}</span>
                    <span className="text-xs text-muted-foreground">· {segment.durationMinutes} min</span>
                    <span className="ml-auto text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      {mainSetOpen ? '▾' : '▸'}
                    </span>
                  </button>
                  {mainSetOpen && (
                    <div className="pl-4 space-y-1.5 border-l-2 border-border ml-1">
                      {segment.intervals.map((interval, ii) => {
                        const dotColor = intervalDotColor(interval.description, interval.target, plan.recommendationType);
                        return (
                          <div key={ii} className="flex items-center gap-2 text-sm">
                            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />
                            <span className="text-muted-foreground">{interval.description}</span>
                            <span className="text-xs text-muted-foreground">· {interval.durationMinutes} min</span>
                            {interval.target && (
                              <span className="text-xs text-muted-foreground ml-auto">{interval.target}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={si} className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-slate-400" />
                <span className="font-medium text-foreground">{formatSegmentName(segment.segment)}</span>
                <span className="text-muted-foreground">· {segment.durationMinutes} min</span>
                {segment.target && (
                  <span className="text-xs text-muted-foreground ml-auto">{segment.target}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Performance metrics footer */}
        {(running || cycling) && (
          <div className="border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Performance Metrics</span>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
              {running?.thresholdPace && <span>Threshold {running.thresholdPace}</span>}
              {running?.tempoPace && <span>Tempo {running.tempoPace}</span>}
              {running?.aerobicPace && <span>Aerobic {running.aerobicPace}</span>}
              {running?.easyPace && <span>Easy {running.easyPace}</span>}
              {cycling?.ftpWatts && <span>FTP {cycling.ftpWatts}W</span>}
              {cycling?.thresholdWatts && <span>Threshold {cycling.thresholdWatts}W</span>}
              {cycling?.tempoWatts && <span>Tempo {cycling.tempoWatts}W</span>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
