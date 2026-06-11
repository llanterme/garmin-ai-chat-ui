'use client';

import { useWorkouts } from '@/hooks/use-workouts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function acrColor(acr: number): string {
  if (acr > 1.3) return 'text-red-500';
  if (acr >= 1.0) return 'text-amber-500';
  return 'text-emerald-500';
}

function acrDotColor(acr: number): string {
  if (acr > 1.3) return 'bg-red-500';
  if (acr >= 1.0) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function MetricCell({ value, label, children }: { value?: React.ReactNode; label: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 py-4 px-3">
      {children ?? (
        <span className="text-3xl font-bold font-display tabular-nums leading-none">{value}</span>
      )}
      <span className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

function SkeletonCell() {
  return (
    <div className="flex flex-col items-center gap-2 py-4 px-3">
      <div className="h-8 w-14 bg-muted animate-pulse rounded" />
      <div className="h-3 w-10 bg-muted animate-pulse rounded" />
    </div>
  );
}

export function TrainingSnapshot() {
  const { useTrainingMetrics } = useWorkouts();
  const { data: metrics, isLoading, error, refetch } = useTrainingMetrics();

  const divider = <div className="w-px bg-border self-stretch my-3" />;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="flex items-stretch divide-x divide-border overflow-x-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-1 min-w-[80px]"><SkeletonCell /></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card>
        <CardContent className="py-6 px-6 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {error ? 'Could not load training metrics.' : 'No metrics available.'}
          </span>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  const { zoneDistribution7Days: zones } = metrics;
  const totalZone = (zones.lowIntensityPercent + zones.moderatePercent + zones.highPercent) || 1;

  const restDays = metrics.daysSinceRestDay;
  const restDaysColor =
    restDays === null ? '' :
    restDays >= 7 ? 'text-red-500' :
    restDays >= 5 ? 'text-amber-500' : '';

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-stretch divide-x divide-border overflow-x-auto">
          {/* ACR */}
          <div className="flex-1 min-w-[80px]">
            <MetricCell label="ACR">
              <div className="flex items-center gap-2">
                <span className={cn('text-3xl font-bold font-display tabular-nums leading-none', acrColor(metrics.acuteChronicRatio))}>
                  {metrics.acuteChronicRatio.toFixed(2)}
                </span>
                <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', acrDotColor(metrics.acuteChronicRatio))} />
              </div>
            </MetricCell>
          </div>

          {divider}

          {/* 7d Load */}
          <div className="flex-1 min-w-[80px]">
            <MetricCell value={Math.round(metrics.totalLoad7Days)} label="7d Load" />
          </div>

          {divider}

          {/* Hard sessions */}
          <div className="flex-1 min-w-[80px]">
            <MetricCell value={metrics.hardSessions7Days} label="Hard" />
          </div>

          {divider}

          {/* Days since rest */}
          <div className="flex-1 min-w-[80px]">
            <MetricCell label="Since Rest">
              <span className={cn('text-3xl font-bold font-display tabular-nums leading-none', restDaysColor)}>
                {restDays === null ? '—' : `${restDays}d`}
              </span>
            </MetricCell>
          </div>

          {divider}

          {/* Days since hard */}
          <div className="flex-1 min-w-[80px]">
            <MetricCell
              value={`${metrics.daysSinceHardSession}d`}
              label="Since Hard"
            />
          </div>

          {divider}

          {/* Zone distribution */}
          <div className="flex-1 min-w-[100px]">
            <MetricCell label="Zones L/M/H">
              <div className="flex flex-col gap-1.5 w-full px-2">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(zones.lowIntensityPercent / totalZone) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] tabular-nums text-muted-foreground w-6 text-right">
                    {Math.round(zones.lowIntensityPercent)}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(zones.moderatePercent / totalZone) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] tabular-nums text-muted-foreground w-6 text-right">
                    {Math.round(zones.moderatePercent)}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${(zones.highPercent / totalZone) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] tabular-nums text-muted-foreground w-6 text-right">
                    {Math.round(zones.highPercent)}%
                  </span>
                </div>
              </div>
            </MetricCell>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
