'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Bike, Footprints, BedDouble, Dumbbell } from 'lucide-react';
import { DailyPlan } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { WorkoutTimeline } from './workout-timeline';
import { cn } from '@/lib/utils';

const TYPE_BORDER: Record<string, string> = {
  REST: 'border-l-slate-400',
  RECOVERY: 'border-l-emerald-400',
  AEROBIC_BASE: 'border-l-blue-400',
  AEROBIC: 'border-l-blue-400',
  TEMPO: 'border-l-amber-400',
  THRESHOLD: 'border-l-orange-400',
  VO2MAX: 'border-l-red-400',
};

const TYPE_BADGE: Record<string, string> = {
  REST: 'bg-slate-800/60 text-slate-400',
  RECOVERY: 'bg-emerald-950/60 text-emerald-400',
  AEROBIC_BASE: 'bg-blue-950/60 text-blue-400',
  AEROBIC: 'bg-blue-950/60 text-blue-400',
  TEMPO: 'bg-amber-950/60 text-amber-400',
  THRESHOLD: 'bg-orange-950/60 text-orange-400',
  VO2MAX: 'bg-red-950/60 text-red-400',
};

function formatDayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function SportIcon({ sport, type }: { sport: string; type: string }) {
  const isRest = type.toUpperCase() === 'REST';
  const isRecovery = type.toUpperCase() === 'RECOVERY';

  if (isRest) return <BedDouble className="h-4 w-4 text-muted-foreground" />;
  const s = sport.toLowerCase();
  if (s.includes('run')) return <Footprints className="h-4 w-4 text-foreground" />;
  if (s.includes('cycl') || s.includes('bike') || s.includes('virt')) return <Bike className="h-4 w-4 text-foreground" />;
  if (isRecovery) return <BedDouble className="h-4 w-4 text-emerald-400" />;
  return <Dumbbell className="h-4 w-4 text-foreground" />;
}

interface DailyPlanCardProps {
  plan: DailyPlan;
}

export function DailyPlanCard({ plan }: DailyPlanCardProps) {
  const [expanded, setExpanded] = useState(false);

  const typeKey = plan.recommendationType.toUpperCase();
  const isRest = typeKey === 'REST';
  const borderClass = TYPE_BORDER[typeKey] ?? 'border-l-slate-400';
  const badgeClass = TYPE_BADGE[typeKey] ?? TYPE_BADGE.REST;

  const hasTimeline = !isRest && plan.workoutStructure && plan.workoutStructure.length > 0;

  return (
    <Card
      className={cn(
        'border-l-4 cursor-pointer transition-shadow hover:shadow-md',
        borderClass,
        isRest && 'opacity-70'
      )}
      onClick={() => !isRest && setExpanded(e => !e)}
    >
      <CardContent className="p-4 space-y-2">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{formatDayDate(plan.date)}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Day {plan.dayNumber}</span>
            {!isRest && (
              expanded
                ? <ChevronUp className="h-3 w-3 text-muted-foreground" />
                : <ChevronDown className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Sport + type */}
        <div className="flex items-center gap-2">
          <SportIcon sport={plan.sport} type={plan.recommendationType} />
          {isRest ? (
            <span className="text-sm font-medium text-muted-foreground">Rest Day</span>
          ) : (
            <>
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', badgeClass)}>
                {plan.recommendationType.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-muted-foreground">{plan.durationMinutes} min</span>
            </>
          )}
        </div>

        {/* Timeline strip */}
        {hasTimeline && (
          <WorkoutTimeline
            workoutStructure={plan.workoutStructure}
            totalDuration={plan.durationMinutes}
            recommendationType={plan.recommendationType}
          />
        )}

        {/* Rationale */}
        {plan.rationale && (
          <p className={cn(
            'text-xs text-muted-foreground leading-relaxed',
            !expanded && 'line-clamp-1'
          )}>
            {plan.rationale}
          </p>
        )}

        {/* Expanded: interval detail */}
        {expanded && hasTimeline && (
          <div className="space-y-1.5 pt-1 border-t border-border">
            {plan.workoutStructure.map((segment, si) => {
              const hasIntervals = segment.intervals && segment.intervals.length > 0;
              const segName = segment.segment.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

              if (hasIntervals) {
                return (
                  <div key={si} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-medium text-foreground">{segName}</span>
                      <span className="text-muted-foreground">· {segment.durationMinutes} min</span>
                    </div>
                    <div className="pl-3 space-y-1 border-l border-border">
                      {segment.intervals.map((interval, ii) => (
                        <div key={ii} className="flex items-center justify-between text-xs gap-2">
                          <span className="text-muted-foreground flex-1">{interval.description}</span>
                          <div className="flex items-center gap-3 shrink-0">
                            {interval.target && (
                              <span className="text-foreground font-medium tabular-nums">{interval.target}</span>
                            )}
                            <span className="text-muted-foreground w-8 text-right tabular-nums">{interval.durationMinutes}m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={si} className="flex items-center gap-1.5 text-xs">
                  <span className="font-medium text-foreground">{segName}</span>
                  <span className="text-muted-foreground">· {segment.durationMinutes} min</span>
                  {segment.target && (
                    <span className="text-muted-foreground ml-auto">{segment.target}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
