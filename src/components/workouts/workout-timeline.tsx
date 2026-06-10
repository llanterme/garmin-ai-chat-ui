'use client';

import { WorkoutSegment } from '@/types';
import { cn } from '@/lib/utils';

interface WorkoutTimelineProps {
  workoutStructure: WorkoutSegment[];
  totalDuration: number;
  recommendationType?: string;
}

function getSegmentColor(segment: string, type: string, recommendationType: string): string {
  const segLower = segment.toLowerCase();
  const typeLower = type.toLowerCase();

  if (segLower.includes('warm')) return 'bg-slate-300 dark:bg-slate-600';
  if (segLower.includes('cool')) return 'bg-slate-300 dark:bg-slate-600';

  // Recovery intervals within main set
  if (typeLower.includes('recov') || typeLower.includes('easy') || typeLower.includes('rest')) {
    return 'bg-emerald-200 dark:bg-emerald-900';
  }

  // Effort blocks colored by workout type
  const rt = recommendationType.toUpperCase();
  if (rt.includes('VO2') || rt.includes('VO2MAX')) return 'bg-red-400 dark:bg-red-600';
  if (rt.includes('THRESHOLD')) return 'bg-orange-400 dark:bg-orange-600';
  if (rt.includes('TEMPO')) return 'bg-amber-400 dark:bg-amber-600';
  if (rt.includes('AEROBIC')) return 'bg-blue-400 dark:bg-blue-600';
  if (rt.includes('RECOVERY')) return 'bg-emerald-400 dark:bg-emerald-600';
  return 'bg-blue-400 dark:bg-blue-600';
}

export function WorkoutTimeline({ workoutStructure, totalDuration, recommendationType = '' }: WorkoutTimelineProps) {
  if (!workoutStructure.length || totalDuration === 0) return null;

  return (
    <div className="space-y-1">
      <div className="flex h-10 rounded-lg overflow-hidden gap-0.5">
        {workoutStructure.map((segment, si) => {
          const segDuration = segment.durationMinutes || 1;

          if (!segment.intervals || segment.intervals.length === 0) {
            const widthPct = (segDuration / totalDuration) * 100;
            const color = getSegmentColor(segment.segment, segment.target, recommendationType);
            return (
              <div
                key={si}
                className={cn('flex items-center justify-center overflow-hidden shrink-0', color)}
                style={{ width: `${widthPct}%` }}
                title={`${segment.segment} · ${segDuration} min · ${segment.target}`}
              >
                {widthPct > 8 && (
                  <span className="text-[10px] font-medium text-white/80 px-1 truncate">
                    {segDuration}m
                  </span>
                )}
              </div>
            );
          }

          // Main set — render each interval
          return segment.intervals.map((interval, ii) => {
            const iDuration = interval.durationMinutes || 1;
            const widthPct = (iDuration / totalDuration) * 100;
            const color = getSegmentColor(segment.segment, interval.target, recommendationType);
            return (
              <div
                key={`${si}-${ii}`}
                className={cn('flex items-center justify-center overflow-hidden shrink-0', color)}
                style={{ width: `${widthPct}%` }}
                title={`${interval.description} · ${iDuration} min · ${interval.target}`}
              >
                {widthPct > 6 && (
                  <span className="text-[10px] font-medium text-white/80 px-1 truncate">
                    {iDuration}m
                  </span>
                )}
              </div>
            );
          });
        })}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
        <span>Start</span>
        <span>{totalDuration} min</span>
      </div>
    </div>
  );
}
